---
id: node-data-snapshots
title: Node Data Snapshots
sidebar_label: Node Data Snapshots
sidebar_position: 3
description: Node Data Snapshots
---

**Notice: The AWS S3 endpoints will be inaccessible starting January 1st, 2024. Please use the updated Cloudfront endpoints for snapshot downloads to ensure uninterrupted service.**

Before you start running a node, you must first sync with the network. This means your node needs to download all the headers and blocks that other nodes in the network already have. You can speed up this process by downloading the latest data snapshots from a public cloudfront endpoint.

Here are the available snapshots directories based on node type and network. Please note that the snapshots are updated every 12 hours.


| Node Type and Network| S3 Path                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| RPC testnet          | https://dcf58hz8pnro2.cloudfront.net/backups/testnet/rpc/latest          |
| RPC mainnet          | https://dcf58hz8pnro2.cloudfront.net/backups/mainnet/rpc/latest          |
| Archival testnet     | https://dcf58hz8pnro2.cloudfront.net/backups/testnet/archive/latest      |
| Archival mainnet     | https://dcf58hz8pnro2.cloudfront.net/backups/mainnet/archive/latest      |

----
Prerequisite:

Recommended download client [`rclone`](https://rclone.org). 
This tool is present in many Linux distributions. There is also a version for Windows.
And its main merit is multithread.
You can [read about it on](https://rclone.org)

First, install rclone:
```
$ sudo apt install rclone
```
Next, prepare config, so you don't need to specify all the parameters interactively:
```
mkdir -p ~/.config/rclone
touch ~/.config/rclone/rclone.conf
```

, and paste the following config into `rclone.conf`:
```
[near_cf]
type = s3
provider = AWS
download_url = https://dcf58hz8pnro2.cloudfront.net/
acl = public-read
server_side_encryption = AES256
region = ca-central-1

```
Commands to run:
```
chain="mainnet"  # or "testnet"
kind="rpc"       # or "archive"
rclone copy --no-check-certificate near_cf://near-protocol-public/backups/${chain:?}/${kind:?}/latest ./
latest=$(cat latest)
rclone copy --no-check-certificate --progress --transfers=6 \
  near_cf://near-protocol-public/backups/${chain:?}/${kind:?}/${latest:?} ~/.near/data
```

----


**Notice: The following section are the older instructions to download snapshots from s3. Direct s3 access will be deprecated starting January 1, 2024.**


| Node Type and Network| S3 Path                                                       |
| -------------------- | ------------------------------------------------------------- |
| RPC testnet          | s3://near-protocol-public/backups/testnet/rpc/latest          |
| RPC mainnet          | s3://near-protocol-public/backups/mainnet/rpc/latest          |
| Archival testnet     | s3://near-protocol-public/backups/testnet/archive/latest      |
| Archival mainnet     | s3://near-protocol-public/backups/mainnet/archive/latest      |


----


If you've [initialized the working directory for your node](/validator/compile-and-run-a-node#3-initialize-working-directory-1) without passing in a preferred location, the default working directory for your node is `~/.near`. It is recommended that you wget and untar into a `data` folder under `~/.near/`. The new `~/.near/data` is where your node will store historical states and write its state. To use the default location, run the following commands.

First, please install AWS CLI:
```bash
$ sudo apt-get install awscli -y
```

Then, download the snapshot using the AWS CLI:
```bash
$ chain="mainnet"  # or "testnet"
$ kind="rpc"       # or "archive"
$ aws s3 --no-sign-request cp "s3://near-protocol-public/backups/${chain:?}/${kind:?}/latest" .
$ latest=$(cat latest)
$ aws s3 sync --delete --no-sign-request  "s3://near-protocol-public/backups/${chain:?}/${kind:?}/${latest:?}" ~/.near/data
```

For a faster snapshot download speed, use s5cmd, the download accelerator for S3 written in Go. For download instruction, please see https://github.com/peak/s5cmd.

Another alternative is [`rclone`](https://rclone.org). 
This tool is present in many Linux distributions. There is also a version for Windows.
And its main merit is multithread.
You can [read about it on](https://rclone.org)

First, install rclone:
```
$ sudo apt install rclone
```
Next, prepare config, so you don't need to specify all the parameters interactively:
```
mkdir -p ~/.config/rclone
touch ~/.config/rclone/rclone.conf
```

, and paste the following config into `rclone.conf`:
```
[near_s3]
type = s3
provider = AWS
location_constraint = EU
acl = public-read
server_side_encryption = AES256
region = ca-central-1
```
Next step very similar with aws-cli. 
```
chain="mainnet"  # or "testnet"
kind="rpc"       # or "archive"
rclone copy --no-check-certificate near_s3://near-protocol-public/backups/${chain:?}/${kind:?}/latest ./
latest=$(cat latest)
rclone copy --no-check-certificate --progress --transfers=6 \
  near_s3://near-protocol-public/backups/${chain:?}/${kind:?}/${latest:?} ~/.near/data
```

>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
