---
id: node-epoch-sync
title: Epoch Sync - a novel solution enabling a node to quickly sync from genesis
sidebar_label: Node Epoch Sync 
sidebar_position: 5
description: Node Epoch Sync
---

Epoch Sync enables a node to sync from genesis without relying on snapshots.
Unlike Header Sync, which requires downloading the entire history of block headers, Epoch Sync downloads only a minimal subset necessary for state reconstruction.

Epoch Sync runs automatically when a non-archival node starts more than two epochs behind the network. Boot nodes help it find peers; they are also used by other sync methods.

If your node cannot find peers, [update its existing configuration](/intro/boot-nodes#update-an-existing-configuration) with fresh boot nodes for the correct network, then start or restart the `neard` service.

### MainNet

Follow the [boot node instructions](/intro/boot-nodes#fetch-boot-nodes) with `CHAIN_ID=mainnet`, then [update your existing config](/intro/boot-nodes#update-an-existing-configuration).

### TestNet

Follow the [boot node instructions](/intro/boot-nodes#fetch-boot-nodes) with `CHAIN_ID=testnet`, then [update your existing config](/intro/boot-nodes#update-an-existing-configuration).
