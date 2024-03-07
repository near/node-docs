---
id: resharding-troubleshooting
title: Troubleshooting Resharding
sidebar_label: Resharding
description: Advice to ensure that the node goes through resharding successfully
---

## Resharding Timeline {#timeline}

The [1.37.0 release](https://github.com/near/nearcore/releases/tag/1.37.0) contains a protocol upgrade that splits shard 3 into two shards.
When network upgrades to the protocol version 64, it will have 5 shards defined by these border accounts `vec!["aurora", "aurora-0", "kkuuue2akv_1630967379.near", "tge-lockup.sweat"]`.

Any code that has a hardcoded number of shards or mapping of an account to shard id may break.
If you are not sure if your tool will work after mainnet updates to protocol version 64, test it on testnet, as it is already running on 5 shards.

Resharding will happen in the epoch preceding protocol upgrade.
So, if the voting happens in epoch X, resharding will happen in epoch X+1, and protocol upgrade will happen in epoch X + 2.
Voting for upgrading to protocol version 64 will start on **Monday 2024-03-11 18:00:00 UTC** .
By our estimations, resharding will start on **Tuesday 2024-03-12  07:00:00 UTC**, and first epoch with 5 shards will start on **Tuesday 2024-03-12  23:00:00 UTC**.

Resharding is done as a background process of a regular node run. It takes hours to finish, and it shouldn’t be interrupted.
Failure to reshard will result in the node not being able to sync with the network.

## 1.37.0 release resharding {#1.37.0}

### General recommendations {#general 1.37}
- **Do not restart your node during the resharding epoch.**
It may result in your node not being able to finish resharding.
- **Disable state sync** until your node successfully transitions to the epoch with protocol version 64.
You should disable it before the voting date (**Monday 2024-03-11 18:00:00 UTC**).
It should be safe to enable it on **Thursday 2024-03-14**.
To disable state sync, assign `false` to the `state_sync_enabled` field in config.
- **Make sure that state snapshot compaction is disabled.**
Your node will create a state snapshot for resharding.
State snapshot compaction may lead to stack overflow.
Make sure that fields `store.state_snapshot_config.compaction_enabled` and `store.state_snapshot_compaction_enabled` are set to `false`.
- Ensure that you have additional 200Gb of free space on your `.near/data` disk.

### Before resharding {#prepare for 1.37}

#### If your node is out of sync {#out of sync 1.37}
If your node is far behind the network, consider downloading the latest DB snapshot provided by Pagoda from s3
[Node Data Snapshots](/intro/node-data-snapshots).
Your node will likely fail resharding if it is not in sync with the network for the majority of the resharding epoch.

#### If you run legacy archival node {#legacy 1.37}
We don’t expect legacy archival nodes to be able to finish resharding and stay in sync on mainnet.
We highly recommend migrating to split storage archival nodes as soon as possible.
The easiest way is to download DB snapshots provided by Pagoda from s3.
Be aware that the cold db of a mainnet split storage is about 22Tb, and it may take a long time to download it.
You can find instructions on how to migrate to split storage on [Split Storage page](/archival/split-storage-archival).

### During resharding {#run 1.37}

#### Monitoring {#monitoring 1.37}
To monitor resharding you can use metrics `near_resharding_status`, `near_resharding_batch_size`, and `near_resharding_batch_prepare_time_bucket`.
You can read more [on github](https://github.com/near/nearcore/blob/master/docs/architecture/how/resharding.md#monitoring).

If you observe problems with block production or resharding performance, you can adjust resharding throttling configuration.
This does not require a node restart, you can send a signal to the neard process to load the new config.
Read more [on github](https://github.com/near/nearcore/blob/master/docs/architecture/how/resharding.md#monitoring).

### After resharding {#after 1.37}
If your node failed to reshard or is not able to sync with the network after the protocol upgrade, you will need to download the latest DB snapshot provided by Pagoda from s3
[Node Data Snapshots](/intro/node-data-snapshots).
We will try to ensure that these snapshots are uploaded as soon as possible, but you may need to wait several hours for them to be available.

Pagoda s3 DB snapshots have a timestamp of their creation in the file path.
Check that you are downloading a snapshot that was taken after the switch to protocol version 64.

