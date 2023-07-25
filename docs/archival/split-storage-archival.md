---
id: split-storage-archival
title: Split Storage for NEAR Archival Nodes
sidebar_label: Split Storage
sidebar_position: 4
description: Split Storage for NEAR Archival Nodes
---

This page presents the Split Storage option for NEAR Archival nodes.

## Introduction {#introduction}

With the 1.35.0 release we are rolling out split storage, a new option for storage management that is mainly targeted at archival nodes.. Split storage allows nodes to reduce storage costs and improve block production performance by splitting local storage into two separate areas: a hot and a cold database .  The hot database is smaller in size and stores all of the data from the most recent epochs. The cold database is larger, and it stores all historical data for older epochs. Hot and cold databases can be independently placed on separate hardware storage, allowing configurations such as using hot storage on a fast NVMe drive, and placing cold storage on a cheaper HDD drive.

In split storage mode, the Near Client only works with a smaller hot database to produce blocks, which results in increased performance. Cold database is not accessed for reads during normal block production and is only read when historical data is specifically requested. Thus, we recommend keeping the cold database on cheaper and slower drives such as an HDD and only optimize speed for the hot database, which is about 10 times smaller.

Split storage is disabled by default, and can be enabled with a config change and going through a migration process that requires manual steps. We have several choices for the migration:
* Use Pagoda-provided S3 snapshots of nodes that have split-storge configured.
* Do a manual migration using S3 snapshots of the existing RPC single database
* Do a manual migration using your own buddy RPC node

| Migration option                                    | Pros                            | Cons                                                   |
| --------------------------------------------------- | ------------------------------- | ------------------------------------------------------ |
| Pagoda-provided S3 snapshots of split-storage nodes | Fastest. Little to no downtime. | Requires trust  in migration performed by Pagoda nodes |
| Manual migration + S3 RPC snapshots                 | No need for extra node. Cold storage is initialized in a trustless way. |  Requires trust in Pagoda RPC snapshots. The node will be out of sync at the end of the migration and will need to block sync several epochs. Migration takes days and you cannot restart your node during that time. |
| Manual migration + your own node                    | Trustless. Little to no downtime | Requires an extra RPC node with bigger storage. Migration takes days and you cannot restart your node during that time. |

## Important config fields {#config}
```json
{
    "archive": true,
    "save_trie_changes": <whether to store TrieChanges column need for garbage collection>,
    "store": {
      "path": <path to hot db, relative to near home dir, "data" by default>
    },
    "cold_store": { # description of cold db, if such is present
      "path": <path to cold db, relative to near home dir, "cold-data" by default>
    },
    "split_storage": {
      "enable_split_storage_view_client": <whether to query cold storage in view client request, essentially making node act as archival, not just store all archival information>
    }
}
```

Example:
```json
{
  "archive": true,
  "save_trie_changes": true,
  "store": {
    "path": "hot-data",
    ...
  },
  "cold_store": {
    "path": "cold-data",
    ...
  },
  "split_storage": {
    "enable_split_storage_view_client": true
  },
  ...
}
```

## Using Pagoda-provided S3 split-storage snapshots {#S3 migration}
1. Find latest snapshot
```bash
chain=testnet/mainnet
aws s3 --no-sign-request cp s3://near-protocol-public/backups/$chain/archive/latest_split_storage .
latest=$(cat latest_split_storage)
```
2. Download cold and hot databases
```bash
NEAR_HOME=/home/ubuntu/.near
aws s3 --no-sign-request cp --recursive s3://near-protocol-public/backups/$chain/archive/$latest/ $NEAR_HOME
```
This will download cold database to `$NEAR_HOME/cold-data`, and hot database to `$NEAR_HOME/hot-data`
3. Make changes to your config.json
```bash
cat <<< $(jq '.save_trie_changes = true | .cold_store = .store | .cold_store.path = "cold-data" | .store.path = "hot-data" | .split_storage.enable_split_storage_view_client = true' $NEAR_HOME/config.json) > $NEAR_HOME/config.json
```
4. Restart the node

## Doing the migration manually (based on an S3 RPC snapshot or your own node) {#manual migration}
Note: We prepared an optimistic migration script that we have used several times to migrate our nodes.
It follows a second scenario of using manual migration + S3 snapshots.
https://github.com/near/nearcore/blob/master/scripts/split_storage_migration.sh  
This script relies on our internal infrastructure, you can find a list of assumptions commented at the top of the file.
We do not recommend using this script as is, but it is a good reference point.

To perform a manual migration you first need to decide whether you can afford the node being out of sync.
If not, you should set up a second non-archival (rpc) node and increase its `gc_num_epochs_to_keep` to 100 (this is just an example of a ridiculously large number).
The second node will now stop performing garbage collection, and its storage size will grow.
This is needed for smooth transition between legacy archival storage and split storage.

1. If you decided to use your own node to support migration, set up an RPC node with `gc_num_epochs_to_keep` set to 100.
2. Next steps concern your archival node.  
Enable `save_trie_changes` in Neard configuration json.
```bash
NEAR_HOME=/home/ubuntu/.near
cp $NEAR_HOME/config.json $NEAR_HOME/config.json.bkp1
cat <<< $(jq '.save_trie_changes = true' $NEAR_HOME/config.json) > $NEAR_HOME/config.json
```
3. Restart neard
4. Verify neard started fine with the new config option enabled.
5. Wait at least 100 new blocks to be produced.
6. Setup cold storage configuration json part and set the path to desired location.  
Note that `.cold_store.path` value should be relative to `$NEAR_HOME`, so in example below the path used by neard for cold-storage is `/home/ubuntu/.near/cold-data`.  
Command:
```bash
NEAR_HOME=/home/ubuntu/.near
cp $NEAR_HOME/config.json $NEAR_HOME/config.json.bkp2
cat <<< $(jq '.cold_store = .store | .cold_store.path = "cold-data"' $NEAR_HOME/config.json) > $NEAR_HOME/config.json
```
7. Restart neard. This will trigger the cold database migration process.
8. Verify neard started fine with the new config option enabled.
9. Wait enough time for the migration to complete. **This migration takes several days.**  
Ensure that neard is not restarted because the migration process cannot resume and all progress made so far will be lost.  
During migration you'll be seeing high cold disk usage because effectively we are moving data from archival db to cold storage.  
Some useful command to check the progress:
```bash
curl --silent  0.0.0.0:3030/metrics | grep near_cold_migration_initial_writes_time_count
```
Most of the time is spent on `State` column migration. Each other column should migrate in hours.
To check on per-column progress look at `near_cold_migration_initial_writes` metric.
```bash
curl --silent  0.0.0.0:3030/metrics | grep near_cold_migration_initial_writes
```
It appears when the process starts migrating a specific column, and stops growing for that column when the column migration is finished.  
10. Once the migration process is complete, the disk usage will decrease and `cold_head_height` value will surface in node metrics and will continue to increase.
This means that initial migration is over and you can safely restart the node.
```bash
curl --silent  0.0.0.0:3030/metrics | grep cold_head_height
```
11. Stop neard process.
12. If you set up your own RPC node, stop it and download its database to the hot data folder in `$NEAR_HOME`.
Otherwise, download a fresh RPC DB backup to the hot data folder in `$NEAR_HOME`.
13. This step relies on your hot database and your cold database having blocks in common.
If you properly set up your own RPC node as the first step, this should be true.
If you are using S3 snapshot, the condition might not hold. In this case, this step will fail. You will need to restart the neard process and wait until the `cold_head_height` metric reports large enough value indicating the overlap between cold and hot databases.
This command will open two dbs specified in your config file, plus additional db provided in the command line. It will check that db provided in the command line is compatible with the current storage and can be used as a replacement hot database, and make some adjustments.
```bash
NEAR_HOME=/home/ubuntu/.near
/home/ubuntu/neard --home $NEAR_HOME cold-store prepare-hot  --store-relative-path='hot-data'
```
14. Set the hot database path and enable split storage in neard configuration file
```bash
NEAR_HOME=/home/ubuntu/.near
cp $NEAR_HOME/config.json $NEAR_HOME/config.json.bkp3
cat <<< $(jq '.store.path = "hot-data" | .split_storage.enable_split_storage_view_client = true' $NEAR_HOME/config.json) > $NEAR_HOME/config.json
```
15. Restart neard.
If you chose to use S3 snapshot to initialize the hot database, your node may be out of sync for a while, due to your hot database becoming out-of-date, while you were waiting for cold head to increase enough.
Verify neard started fine with the new config option enabled.
You can also post a request about split storage status and check that `.result.hot_db_kind` is `Hot`.
```bash
curl -H "Content-Type: application/json" -X POST --data '{"jsonrpc":"2.0","method":"EXPERIMENTAL_split_storage_info","params":[],"id":"dontcare"}'  0.0.0.0:3030
```

## Important metrics {#metrics}
The metrics below can be used to monitor the way split storage works

`near_cold_head_height` – height of cold storage.
`near_block_height_head` – height of hot storage.
These two metrics should be very close to each other.

`near_rocksdb_live_sst_files_size` – size of column in hot storage.
`near_rocksdb_live_sst_files_size_cold` – size of column in cold storage.

`near_cold_store_copy_result` – status of the continuous block-by-block migration that is performed in background to block production and can be interrupted.

Size of the hot db – should be close to the size of an RPC node’s storage.
Size of the cold db – should be close to the size of a legacy archival node’s storage. 


