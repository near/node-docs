---
id: node-epoch-sync
title: Epoch Sync - a novel solution enabling a node to quickly sync from genesis
sidebar_label: Node Epoch Sync 
sidebar_position: 5
description: Node Epoch Sync
---

Epoch Sync enables a node to sync from genesis without relying on snapshots.
Unlike Header Sync, which requires downloading the entire history of block headers, Epoch Sync downloads only a minimal subset necessary for state reconstruction.

To sync using Epoch Sync, update your `config.json` file with the latest list of NEAR boot nodes, then start the neard service.
You can use the following command as-is or treat it as a boilerplate:

### MainNet 

```
BOOT_NODES=$(curl -s -X POST https://rpc.mainnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)

jq --arg newBootNodes $BOOT_NODES '.network.boot_nodes = $newBootNodes' ~/.near/config.json > ~/.near/config.tmp && mv ~/.near/config.json ~/.near/config.json.backup && mv ~/.near/config.tmp ~/.near/config.json
```

### TestNet

```
BOOT_NODES=$(curl -s -X POST https://rpc.testnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)

jq --arg newBootNodes $BOOT_NODES '.network.boot_nodes = $newBootNodes' ~/.near/config.json > ~/.near/config.tmp && mv ~/.near/config.json ~/.near/config.json.backup && mv ~/.near/config.tmp ~/.near/config.json
```

