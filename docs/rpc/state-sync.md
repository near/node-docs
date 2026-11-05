---
id: state-sync
title: State Sync
sidebar_label: State Sync Configuration
sidebar_position: 4
description: State Sync Configuration
---

# Overview

State sync lets a node download the state of a shard from other nodes instead of computing it from every block. Nodes get the state parts from other nodes in the network.

## When state sync runs

No option turns state sync on or off. The node decides when to run it:

* A non-archival node that is more than two epochs behind the network runs epoch sync, then header sync, then state sync, then block sync. Two epochs is the default of `epoch_sync.epoch_sync_horizon_num_epochs`.
* Archival nodes, and nodes that are closer to the head of the chain, catch up with header sync and block sync only. This way archival nodes keep the full history.
* A validator whose shard assignment changes also uses state sync. It downloads the state of the shards that it will track in the next epoch.

## State parts from external storage are no longer supported

Since nearcore 2.13.0, a `config.json` that sets `state_sync.sync` to `ExternalStorage` fails config validation. The node then does not start. If your `config.json` still has a `state_sync.sync` block, remove it. nearcore 2.14 removes the option.

Nodes can still dump state parts to external storage with the `state_sync.dump` option.

## Reference `config.json` file

Run the following command to download the reference `config.json` file:

```shell
./neard --home /tmp/ init --download-genesis --download-config rpc --chain-id <testnet or mainnet>
```

*This command is for an RPC node. If you want to download the reference `config.json` file for a validator or archival node, replace the `--download-config rpc` option with `--download-config validator` or `--download-config archival`, respectively.*

The file will be available at `/tmp/config.json`.

## Troubleshooting

If you notice that your node runs state sync and it hasn't completed after 3 hours, please check the following:

1. Config options related to the state sync in your `config.json` file:
* `state_sync`
* `consensus.state_sync_p2p_timeout`
* `consensus.state_sync_retry_backoff`
* `tracked_shards_config`
* `archive`
* `epoch_sync.epoch_sync_horizon_num_epochs`

To see the config values that the node uses, call the `client_config` JSON-RPC method on your node. You can also open `http://127.0.0.1:3030/debug/client_config`. This page works only after you set `rpc.enable_debug_rpc` to `true` in `config.json` and restart the node.

2. Has your node run out of available disk space?

If the config is correct and the disk has free space, stop the node, remove the `data` folder in the node's home directory, and start the node again. A non-archival node that starts with an empty `data` folder uses [Epoch Sync](../intro/epoch_sync.md).

## Running a validator that tracks a single shard

Configure the node to track no shards:

```json
"tracked_shards_config": "NoShards",
```

Remove any `tracked_shards`, `tracked_accounts`, `tracked_shard_schedule` and `tracked_shadow_validator` keys from `config.json`. These keys are deprecated. The node refuses to start when one of them is set together with `tracked_shards_config`.

`NoShards` is the correct config for a validator. With it, the node tracks whichever shards consensus assigns to it.

Note that in different epochs a validator may be assigned to different shards. A
node switches tracked shards by using the State Sync mechanism for a single
shard. See [catchup](https://github.com/near/nearcore/blob/master/docs/architecture/how/sync.md#catchup).
