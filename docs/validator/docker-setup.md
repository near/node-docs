---
id: docker-setup
title: Run a Node (Docker)
sidebar_label: Run a Node (Docker)
sidebar_position: 4
---

# Running neard with Docker

This guide explains how to run a NEAR node using the official `nearprotocol/nearcore` Docker image.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- `curl` and `jq` on the host, to get the boot nodes

## Pulling the Image

:::note
The `mainnet` and `testnet` tags will take effect starting version 2.11.0.
:::

The `nearprotocol/nearcore` image is published with network-specific tags:

| Tag | Description |
|-----|-------------|
| `release` or `mainnet` | Latest stable release for mainnet |
| `pre-release` or `testnet` | Latest pre-release for testnet |
| `<version>` (e.g. `2.5.0`) | A specific version |
| `<version>-<commit>` (e.g. `2.5.0-abc1234`) | A specific version and commit |

:::caution
The `latest` tag is **not available**. Always use a network-specific or version tag.
:::

Pull the image for your target network:

```bash
# For mainnet
docker pull nearprotocol/nearcore:mainnet

# For testnet
docker pull nearprotocol/nearcore:testnet
```

## Initializing the Node

The node needs boot nodes to find its first peers. The reference `config.json` files have no boot nodes, so you need to pass them to `neard init`. The following commands ask an RPC node of your network for the validators it is connected to. Then they create a directory to store chain data and initialize neard:

```bash
CHAIN_ID=mainnet  # or testnet
NODE_TYPE=validator  # or rpc

BOOT_NODES=$(curl -s -X POST https://rpc.$CHAIN_ID.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)
echo "${BOOT_NODES:?}"

mkdir -p ~/.near
docker run --rm -v $HOME/.near:/root/.near nearprotocol/nearcore:$CHAIN_ID neard init --chain-id $CHAIN_ID --download-genesis --download-config $NODE_TYPE --boot-nodes "${BOOT_NODES:?}"
```

This downloads the genesis and config files and sets up the data directory.

Before you start the node, check that `network.boot_nodes` in `config.json` is not empty:

```bash
jq -r '.network.boot_nodes' ~/.near/config.json
```

The command should print a comma-separated list of boot nodes. If it prints an empty line, the node has no peers to sync from. Add boot nodes as described in [Epoch Sync](/intro/node-epoch-sync). Running `neard init` again does not add them, because it does not change an existing `config.json`.

## Running the Node

Start neard with the data directory mounted and the RPC and P2P ports exposed:

```bash
docker run -d \
  --name neard \
  -v $HOME/.near:/root/.near \
  -p 3030:3030 \
  -p 24567:24567 \
  nearprotocol/nearcore:mainnet neard run
```

Replace `mainnet` with `testnet` if running a testnet node.

The two exposed ports are:

- **3030** — the JSON-RPC port, used by clients and tools to query the node
- **24567** — the P2P networking port, used to communicate with other nodes in the network

These values should match the `rpc.addr` and `network.addr` ports in your `~/.near/config.json`. If you change them in the config, update the `-p` flags accordingly.

## Managing the Container

### View logs

```bash
docker logs -f neard
```

### Stop the node

```bash
docker stop neard
```

### Restart the node

```bash
docker start neard
```

### Remove the container

```bash
docker rm neard
```
