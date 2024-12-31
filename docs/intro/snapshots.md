---
id: node-data-snapshots
title: Node Data Snapshots
sidebar_label: Node Data Snapshots
sidebar_position: 3
description: Node Data Snapshots
---


### !!!Note!!!
As the NEAR ecosystem continues to decentralize, Pagoda has cease operations and decentralize its functions into NEAR ecosystem teams and committees.
FastNEAR will be the sole provider of snapshots downloads starting Jan 1, 2025. Please visit https://docs.fastnear.com/docs/snapshots for more details. 

## Overview

Before you start running a node, you must first sync with the network. This means your node needs to download all the headers and blocks that other nodes in the network already have. You can speed up this process by downloading the latest data snapshots from a public cloudfront endpoint.

Here are the available snapshots directories based on node type and network. Please note that the RPC snapshots are updated every 12 hours. Split-Storage Archival snapshots are updated every 72 hours due to the size of cold storage data.


| Node Type and Network| CloudFront Path                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------|
| RPC testnet          | `https://dcf58hz8pnro2.cloudfront.net/backups/testnet/rpc/latest`                      |
| RPC mainnet          | `https://dcf58hz8pnro2.cloudfront.net/backups/mainnet/rpc/latest`                      |
| Archival testnet     | `https://dcf58hz8pnro2.cloudfront.net/backups/testnet/archive/latest_split_storage`    |
| Archival mainnet     | `https://dcf58hz8pnro2.cloudfront.net/backups/mainnet/archive/latest_split_storage`    |

----

## Sample instruction

Prerequisite:

Recommended download client [`rclone`](https://rclone.org). 
This tool is present in many Linux distributions. There is also a version for Windows.
And its main merit is multithread.
You can [read about it on](https://rclone.org)
** rclone version needs to be v1.66.0 or higher

First, install rclone:
```
$ sudo -v ; curl https://rclone.org/install.sh | sudo bash
```
Next, prepare config, so you don't need to specify all the parameters interactively:
```
mkdir -p ~/.config/rclone
touch ~/.config/rclone/rclone.conf
```

, and paste exactly the following config into `rclone.conf`:
```
[near_cf]
type = s3
provider = AWS
download_url = https://dcf58hz8pnro2.cloudfront.net/
acl = public-read
server_side_encryption = AES256
region = ca-central-1

```
Commands to run for RPC|Validator Data Download:
```
chain="mainnet"  # or "testnet"
kind="rpc"       
rclone copy --no-check-certificate near_cf://near-protocol-public/backups/${chain:?}/${kind:?}/latest ./
latest=$(cat latest)
rclone copy --no-check-certificate --progress --transfers=6 --checkers=6 \
  near_cf://near-protocol-public/backups/${chain:?}/${kind:?}/${latest:?} ~/.near/data
```

Commands to run for Archival Split Storage Data Download:
```
chain="mainnet"  # or "testnet"
kind="archive"       
rclone copy --no-check-certificate near_cf://near-protocol-public/backups/${chain:?}/${kind:?}/latest_split_storage ./
latest=$(cat latest_split_storage)
rclone copy --no-check-certificate --progress --transfers=6 --checkers=6 \
  near_cf://near-protocol-public/backups/${chain:?}/${kind:?}/${latest:?} ~/.near/data
```



>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
