---
id: node-debug
title: Node Debug Page
sidebar_label: Node Debug Page
description: How to Use the Node Debug Page
sidebar_position: 2
---

# Node Debug Page

The nearcore 1.27.0 release will introduce a node debug page on your NEAR node which provides detailed info on last blocks, sync info, chain info, and epoch info. Node operators will have the option to enable this node debug page.

### Enable Node Debug Page
To enable this debug page on the node, a modificiation is require on `config.json`. Under `rpc` struct, set `enable_debug_rpc`: true. If this line doesn't exist the node's `config.json`, the node operator may add the following:

```
"rpc": {
  ...
   "enable_debug_rpc": true
  ...
```

After the node starts, head to http://your-node-ip/debug to view the Node Debug Page.

![img](/images/node-debug.png)

### Last Blocks
This page displays the most recent 50 blocks on the node. For each block, the following fields are shown:
- Block hash
- Validator who validated the block
- Processing time for the block
- Estimated Next block time
- Gas Price Ratio: How much gas it costs to generate this block. The ratio is the current cost of generating the block in comparison to the cost of genesis block.
- For each shard, the fields are the chunk hash / validator who validated the chunk / Gas / Time (in ms)


### Sync Info
This page displays the current point-in-time status of node's peers.

`Current Sync Status: NoSync (#64817610 DakWGcEUsNpRSXEgBm4FUGEqnJy9qVKouB8V9ek8BqYr)`
- Current Sync Status: NoSync means the node is synced and not syncing. What follows is the block number and block hash. Other status that can be shown are header sync and block sync.

`Number of peers: 30/40`
This means there are 30 active peers. 40 is the max number of peers.

`Validators: 100 Known: 100 Reachable: 100`
- `Validators: 100`: is determined in the last epoch by the network.
- `Known: 100`: is that the current node has the validator accountID present in this node's database.
- `Reachable: 100`: If a validator is not reachable from the current node, it will not be included in the count.

What follows is a table of the node peers.
- `Address`: node IP and port.
- `Validator?`: Shows if the node is a validator. If it is, it shows the pool name.
- `AccountID`: The first line shows the account id for the peer. The second line shows the peer id.
- `Height`: shows the latest block height.
- `Tracked Shards`: shows which shards the node is tracking.
- `Archival`: shows whether the node is archival or not.
- `Route to validators`: The list of validators that this node is one-hop away.


### Chain Info
This page displays the current point-in-time status of the node in terms of orphan blocks and missing chunks.

`Current head: 3mivFUczgGWM6RvwvaT2oQ93zRQQTn3riXNtWxByntD1 @ 64818564`: The current head is the latest block of this node.

`Current header head: 3mivFUczgGWM6RvwvaT2oQ93zRQQTn3riXNtWxByntD1 @ 64818564`: TBD

`Orphan Pool`: This table shows a list of orphan blocks for this current node. The block hash and block height are listed. (e.g. It is possible that this node received a block for which its predecessor is unknown. Once the predecessor is known, the orphan block would no longer be in the pool.)

`Missing Chunks Pool`
This table shows a list of blocks that are missing some of its chunks in this node. The block hash and block height are listed. As your node request for missed chunks, you can refresh the page to see the latest status and to see if the chunk has been received and stored. If a chunk has been no longer missing, it will be removed from this table.


### Epoch Info

The epoch displays the current epoch and the most recent five epoches.

- `Epoch id`: block hash of the final block in epoch T-2.
- `Start height`: the first block of the epoch.
- `Protocol version`: The protocol version of the epoch.
- `First block`: Block hash of the first block in the epoch.
- `Epoch start`: How long ago the epoch has restarted.

The table below displays the validators in the current epoch and the last five epochs (represented by the epoch hash) with either TRUE or FALSE.  


>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
