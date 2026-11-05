---
id: boot-nodes
title: Boot nodes
sidebar_label: Boot Nodes
sidebar_position: 6
description: Find peers and configure boot nodes for a NEAR node
---

Boot nodes help a NEAR node find its first peers. The reference `config.json` files do not include boot nodes, so supply them when initializing a node or add them to an existing configuration.

## Fetch boot nodes

Run these commands in Bash with `curl`, `jq`, and `paste` installed. For Docker setups, run them on the host. Choose the network that matches your node:

```bash
CHAIN_ID=mainnet  # Change to testnet for a testnet node.
```

Query an RPC node for the validators it is connected to and create a comma-separated list of `peer_id@address` entries. You can substitute another RPC provider for the same network if it supports `network_info`.

```bash
BOOT_NODES=$(curl -s -X POST "https://rpc.${CHAIN_ID:?}.near.org" -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)
echo "${BOOT_NODES:?}"
```

The last command must print a nonempty list. If it fails or the RPC request returns an error, check the response or try another RPC provider before continuing. The `${BOOT_NODES:?}` guard in the commands below prevents using an empty or unset list.

Keep using the same shell when you return to your setup guide: `BOOT_NODES` is a shell variable.

## Initialize a new node

Pass the list to your guide's `neard init` command:

```bash
./target/release/neard --home ~/.near init --chain-id "${CHAIN_ID:?}" --download-genesis --download-config validator --boot-nodes "${BOOT_NODES:?}"
```

This example uses the validator config and the default home directory. Follow your guide for the executable path, node type, account ID, and other initialization options.

`neard init` does not change an existing `config.json`. If you already initialized the node, or downloaded a replacement config, update that file instead.

## Update an existing configuration

First [fetch boot nodes](#fetch-boot-nodes) for your node's network. Stop the node before editing its configuration. Set the path to its existing config; for example, use `~/.near/testnet/config.json` for a testnet node stored in that directory.

```bash
CONFIG_PATH=~/.near/config.json
jq --arg boot_nodes "${BOOT_NODES:?}" '.network.boot_nodes = $boot_nodes' "$CONFIG_PATH" > "$CONFIG_PATH.tmp" &&
  cp "$CONFIG_PATH" "$CONFIG_PATH.backup" &&
  mv "$CONFIG_PATH.tmp" "$CONFIG_PATH"
```

This preserves the other settings and saves a backup before replacing the file. Start or restart the node after the update.

## Check the configuration

Using your node's config path, check that the list is not empty:

```bash
jq -r '.network.boot_nodes' ~/.near/config.json
```

The command should print a comma-separated list of boot nodes. If it prints an empty line, [update the existing configuration](#update-an-existing-configuration). Downloading the reference config again does not add boot nodes.
