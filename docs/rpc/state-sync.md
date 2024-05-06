---
id: state-sync
title: State Sync
sidebar_label: State Sync Configuration
sidebar_position: 4
description: State Sync Configuration
---

# Overview

See [State Sync from External Storage](https://github.com/near/nearcore/blob/master/docs/misc/state_sync_from_external_storage.md)
for a description of how to configure your node to sync State from an arbitrary
external location.

Pagoda provides state dumps for every shard of every epoch since the release of
`1.36.0-rc.1` for testnet and `1.36.0` for mainnet.

## Enable State Sync

The main option you need is `state_sync_enabled`, and then specify how to get
the state parts provided by Pagoda in the option `state_sync`.

The following snippet is included in the reference `config.json` file and
provides access to the state of every shard every epoch:

```json
"state_sync_enabled": true,
"state_sync": {
  "sync": {
    "ExternalStorage": {
      "location": {
        "GCS": {
          "bucket": "state-parts",
        }
      },
      "num_concurrent_requests": 4,
      "num_concurrent_requests_during_catchup": 4,
    }
  }
}
```

## Reference `config.json` file

Run the following command to download the reference `config.json` file:

```shell
./neard --home /tmp/ init --download-genesis --download-config --chain-id <testnet or mainnet>
```

The file will be available at `/tmp/config.json`.

## Troubleshooting

If you notice that your node runs state sync and it hasn't completed after 3 hours, please check the following:

1. Config options related to the state sync in your `config.json` file:
* `state_sync_enabled`
* `state_sync`
* `consensus.state_sync_timeout`
* `tracked_shards`
* `tracked_accounts`
* `tracked_shard_schedule`
* `archive`
* `block_fetch_horizon`

The best way to see the exact config values used is to visit a debug page of your node: `http://127.0.0.1:3030/debug/client_config`

Check whether state sync is enabled, and check whether it's configured to get state parts from the right location mentioned above.

2. Has your node ran out of available disk space?

If all seems to be configured fine, then disable state sync (set `"state_sync_enabled": false` in `config.json`) and try again.
If that doesn't help, then restart from a backup data snapshot.

## Running a Chunk-Only Producer that tracks a single shard

Enable State Sync as explained above.

And then configure the node to track no shards:

```json
"tracked_shards": [],
"tracked_accounts": [],
"tracked_shard_schedule": [],
```

It is counter-intuitive but it works. If a node stakes and is accepted as a
validator, then it will track the shard that it needs to track to fulfill its
validator role. The assignment of validators to shards is done by the consensus
of validators.

Note that in different epochs a validator may be assigned to different shards. A
node switches tracked shards by using the State Sync mechanism for a single
shard. See [catchup](https://github.com/near/nearcore/blob/master/docs/architecture/how/sync.md#catchup).
