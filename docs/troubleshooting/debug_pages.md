---
id: debug-pages
title: Debug Pages
sidebar_label: Debug Pages
description: Debug Pages
---

# Debug Pages
Debug pages is a feature that allows node maintainers to navigate detailed information about the node in a structured way

## Enable Debug Pages
To enable debug pages modify your config.json file and restart the node.
```
...
"rpc": {
    ...
    "enable_debug_rpc": true,
    ...
 }
 ...
```
By default, debug pages will become accessible on `<your node ip>:3030/debug`.  
If you modified your rpc address in config, then debug page will be accessible on `<config.rpc.addr>/debug`.

## Last blocks page
Displays 50 most recent blocks. Shows hash, as well as time and gas stats for block and every shard.  
On the left schematically displays the chain to visualise forks.

## Network info page
Displays a table of peers.
For every peer shows:
- some sync information like height and last block hash;
- id information like validator pool name (if peer is a validator), peer id;
- network information like address, traffic, route;
- node information like archival flag and tracked shards.

## TIER1 Network info page
Similar to network page, but about TIER1 network.

## Epoch info page
Displays several tables related to epochs:
- Start height and epoch hash for last 4 epochs, current epoch and next epoch;
- Validators in the current epoch;
- Validators in the next epoch;
- Validator proposals;
- Validator kickouts;
- Validator type for current validators in 6 epochs described on the page. Whether the validator is a block producer or a chunk-only producer;
- Shard sizes for 5 out of 6 epochs described on the page (because one of them didn't start yet).

## Chain & Chunk info page
Displays information about chunks requested and received by the node 


## Sync info page
Displays a page with tracked shards for this epoch and the next epoch.
Also shows status of three sync algorithms that are executed sequentially if the node is behind:
- Header sync
- State sync
- Block sync

## Validator info page
Displays information related to blocks and chunks produced by the node and approvals or skips sent by other nodes.

## Client Config page
Displays client config JSON of the node.


