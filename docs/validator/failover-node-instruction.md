---
id: failover-node-instruction
title: Failover/backup node instruction
sidebar_label: Failover/backup node instruction
sidebar_position: 10
---

# How to set up Failover/Backup node

## Overview

There are two main ways to set up a failover node, each with its own pros and cons. Read through both options and choose the one that works best for your situation.

**Option 1** is best if you need a failover node that can also serve as an RPC node, or if you need one failover node for multiple validators. However, it requires a restart when the failover node becomes a validator.

**Option 2** is best for minimizing downtime, as the failover happens almost instantly. However, the failover node must be dedicated to a single validator and cannot serve as an RPC node.

### Important Note

* Once a node becomes a validator node and begins tracking a specific shard, it cannot be reverted to track all shards. 
* During the failover process, a node operator may lose one RPC node when the node transitions to a validator node (option 1). This is a known issue, and it is on the team's roadmap for resolution.

### [Option 1] RPC node as a failover node

This is the traditional [recovery plan](https://near-nodes.io/troubleshooting/common-errors) which has been available on the mainnet, where you have a primary validator node and a secondary failover node.

#### Pros

* It is possible to use an RPC node as a failover node.
* Failover node can be used for multiple validator nodes, each tracking different shards.

#### Cons

* A restart of neard is required before a failover node can be promoted to a new validator node.

#### Setup for the failover node while it is on standby

In `config.json`
* Set `tracked_shards_config` to `"AllShards"`
* Set `store.load_mem_tries_for_tracked_shards` to `false`

#### Procedure

* Copy `validator_key.json` to the failover node.
* In `config.json` file of the failover node:
  * Set `tracked_shards_config` to `"NoShards"`
  * Set `store.load_mem_tries_for_tracked_shards` to `true`
* **Note**: You don’t need to swap the `node_key.json` file on the failover node. The network identifies nodes by their key and IP address, so changing the IP address might prevent successful syncing.
* Stop the primary validator node.
* Restart the failover node.

### [Option 2] Validator key hot swap

This method allows you to quickly transfer the validator key to the failover node with very little downtime.

#### Pros

* No need to restart the failover node during transition.
* Failover can happen in seconds, minimizing downtime.

#### Cons

* The failover node cannot be used as an RPC node while it is on standby.
* The failover node is dedicated to just one validator node.

#### Setup for the failover node while it is on standby

* In `config.json`
  * Set `tracked_shards_config` to `{ "ShadowValidator": "<validator_id>" }` (where `<validator_id>` is the pool ID of the validator).
  * Set `store.load_mem_tries_for_tracked_shards` to `true`.
* **Note**: The failover node must be dedicated to a single validator and cannot be used as an RPC node during failover. Since mem_trie doesn’t work well with RPC nodes, the failover node won’t be able to perform RPC functions.

#### Procedure

With the changes made to the `config.json` file and the validator key hot swap procedure, the failover node can quickly take over validator responsibilities.
* Copy `validator_key.json` to the failover node.
* [Optional] Set `tracked_shards_config` to `"NoShards"` in `config.json` file of the failover node.
* **Note**: You don’t need to swap the `node_key.json` file on the failover node. The network identifies nodes by their key and IP address, so changing the key might prevent successful syncing.
* Stop the primary node.
* Send a `SIGHUP` signal to the failover node (without restarting it).
* The failover node will pick up the validator key and start validating.

