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

In split storage mode, the Near Client only works with a smaller hot database to produce blocks, which results in increased performance. Cold database is not accessed for reads during normal block production and is only read when historical data is specifically requested. Thus, we recommend keeping the cold database on cheaper and slower drives such as an HDD and only optimize speed for the hot database, which is significantly smaller.

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

## Restore from an archival snapshot {#restore-from-snapshot}

FastNEAR provides archival snapshots on request. See [FastNEAR Snapshots](https://docs.fastnear.com/snapshots) for how to request access. There is no public download link. When you request access, ask for a split storage snapshot with a hot and a cold database.

A split storage snapshot holds a hot database and a cold database. To start a node from it:

1. Stop the node if it is running.
2. Place the hot database in the `hot-data` folder and the cold database in the `cold-data` folder of the node's home directory (`~/.near` by default).
3. Set the split storage fields in `config.json`, as described in [Important config fields](#config). The command writes a new file first, so `config.json` stays as it was if `jq` fails:
```bash
NEAR_HOME=~/.near
jq '.archive = true | .save_trie_changes = true | .cold_store = .store | .cold_store.path = "cold-data" | .store.path = "hot-data" | .split_storage.enable_split_storage_view_client = true' "$NEAR_HOME/config.json" > "$NEAR_HOME/config.tmp" && mv "$NEAR_HOME/config.tmp" "$NEAR_HOME/config.json"
```
4. Start the node. It downloads the blocks produced since the snapshot was taken.

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
