---
id: attach-state-snapshot
title: Attach State Snapshot
sidebar_label: Attach State Snpashot
description: Instructions on attaching a supporting state snapshot.
---

## Terminology {#terminology}
State Snapshot is different from DB snapshot.
State Snapshot is checkpoint of some columns of the full DB taken at the epoch boundary.
It is used in state sync and resharding.

State snapshots are identified by the last block hash of the epoch.
We save state snapshot in `$NEAR_HOME_DATA/state_snapshot/$BLOCK_HASH`.
We also save `$BLOCK_HASH` in DB to know which path to open when we need to use snapshot. 

## How to attach state snapshot to existing node {#how to attach}
1. Download state snapshot on your machine.
You can download it to any directory, but `$NEAR_HOME_DATA/state_snapshot/$BLOCK_HASH` has to point to your new state snapshot.
2. Create a support directory anywhere on the node. We will refer to it as `$OTHER_HOME`.
3. Copy config to the new directory
```bash
cp $NEAR_HOME/config.json $OTHER_HOME/config.json
```
4. Point data directory of `$OTHER_HOME` to state snapshot.
```bash
ln -s <state snapshot path> $OTHER_HOME/test-data
```
5. Change `$OTHER_HOME` config to work with state snapshot
```bash
cat <<< $(jq '.archive = false | .cold_store = null | .store.path = "test-data"' $OTHER_HOME/config.json) > $OTHER_HOME/config.json
```
6. Change state snapshot `DBKind` to suit your node.
If you are running a split storage archival node run
```bash
$NEARD --unsafe-fast-startup --home $OTHER_HOME database change-db-kind --new-kind Hot change-hot
```
If you are running rpc node run
```bash
$NEARD --unsafe-fast-startup --home $OTHER_HOME database change-db-kind --new-kind RPC change-hot
```
7. You can delete `$OTHER_HOME` now.
8. If you are fixing a problem for 1.37 or 1.38 release you need to build a binary from [this tool branch](https://github.com/near/nearcore/tree/1.37.0-fix).
Changes from this branch will be included in 1.39 release by default.
9. Stop your node
10. Run a binary with [tool branch](https://github.com/near/nearcore/tree/1.37.0-fix) changes to save `$BLOCK_HASH` in RocksDB.
```bash
$NEARD_TOOL --unsafe-fast-startup --home $NEAR_HOME database write-crypto-hash --hash $BLOCK_HASH
```
11. Restart your node