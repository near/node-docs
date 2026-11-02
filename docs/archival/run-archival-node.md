---
id: run-archival-node
title: Run an Archival Node
sidebar_label: Run a Node 🚀
sidebar_position: 2
description: How to run an Archival Node
---
## This page is DEPRECATED in favor of split storage archival.  Please Use [Run a Split Storage Archival](/archival/split-storage-archival)

The following instructions are applicable across localnet, testnet, and mainnet.

If you are looking to learn how to compile and run a NEAR Archival node natively for one of the following networks, this guide is for you.

- [`testnet`](/archival/run-archival-node#testnet)
- [`mainnet`](/archival/run-archival-node#mainnet)


<blockquote class="info">
<strong>Heads up</strong><br /><br />

Running an archival node is very similar to running a [validator node](/validator/compile-and-run-a-node) as both types of node use the same `nearcore` release. An archival node needs `archive` set to `true`, a cold database configured in `cold_store`, and `save_trie_changes` set to `true`. Set `split_storage.enable_split_storage_view_client` to `true` so that RPC queries can read old data from the cold database. Setting only `archive` to `true` is not enough. With only that setting, the node does not start. See [Run a Split Storage Archival](/archival/split-storage-archival).

</blockquote>


## Prerequisites {#prerequisites}

- [Rust](https://www.rust-lang.org/)
- [Git](https://git-scm.com/)
- Installed developer tools:
  - MacOS
    ```bash
    $ brew install cmake protobuf clang llvm awscli jq
    ```
  - Linux
    ```bash
    $ apt update
    $ apt install -y git binutils-dev libcurl4-openssl-dev zlib1g-dev libdw-dev libiberty-dev cmake gcc g++ python docker.io protobuf-compiler libssl-dev pkg-config clang llvm cargo awscli jq
    ```
---

### Choosing your `nearcore` version {#choosing-your-nearcore-version}

When building your NEAR node you will have two branch options to choose from depending on your desired use:

- `master` : _(**Experimental**)_
  - Use this if you want to play around with the latest code and experiment. This branch is not guaranteed to be in a fully working state and there is absolutely no guarantee it will be compatible with the current state of *mainnet* or *testnet*.
- [`Latest stable release`](https://github.com/near/nearcore/tags) : _(**Stable**)_
  - Use this if you want to run a NEAR node for *mainnet*. For *mainnet*, please use the latest stable release. This version is used by mainnet validators and other nodes and is fully compatible with the current state of *mainnet*.
- [`Latest release candidates`](https://github.com/near/nearcore/tags) : _(**Release Candidates**)_
  - Use this if you want to run a NEAR node for *testnet*. For *testnet*, we first release a RC version and then later make that release stable. For testnet, run the version that the public testnet RPC node runs. Step 1 below shows how to find it. This is usually the latest RC version.


## `testnet` {#testnet}

### 1. Clone `nearcore` project from GitHub {#1-clone-nearcore-project-from-github}

First, clone the [`nearcore` repository](https://github.com/near/nearcore).

```bash
$ git clone https://github.com/near/nearcore
$ cd nearcore
$ git fetch origin --tags
```

Checkout to the branch you need if not `master` (default). Latest release is recommended. Please check the [releases page on GitHub](https://github.com/near/nearcore/releases).

Testnet usually runs a newer release candidate than mainnet. The following command reads the version that the public testnet RPC node runs:

```bash
$ NEAR_RELEASE_VERSION=$(curl -s -X POST https://rpc.testnet.near.org -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":"dontcare","method":"status","params":[]}' | jq -r '.result.version.version')
$ echo "${NEAR_RELEASE_VERSION:?}"
```

### 2. Compile `nearcore` binary {#2-compile-nearcore-binary}

In the `nearcore` folder, check out that version and build it:

```bash
$ git checkout "tags/${NEAR_RELEASE_VERSION:?}" && make release
```

This will start the compilation process. It will take some time
depending on your machine power (e.g. i9 8-core CPU, 32 GB RAM, SSD
takes approximately 25 minutes). Note that compilation will need over
1 GB of memory per virtual core the machine has. If the build fails
with processes being killed, you might want to try reducing number of
parallel jobs, for example: `CARGO_BUILD_JOBS=8 make release`.

The binary path is `target/release/neard`

### 3. Initialize working directory {#3-initialize-working-directory}

The NEAR node requires a working directory with a couple of configuration files. Generate the initial required working directory by running:

```bash
$ ./target/release/neard --home ~/.near init --chain-id testnet --download-genesis --download-config archival
```

> You can specify trusted boot nodes that you'd like to use by passing the `--boot-nodes` flag during `init`.
To find a set of active boot nodes, follow these instructions for [testnet](/intro/node-epoch-sync#testnet).

> You can skip the `--home` argument if you are fine with the default working directory in `~/.near`. If not, pass your preferred location.

This command will create the required directory structure and will generate `config.json`, `node_key.json`, and `genesis.json` for `testnet` network.
- `config.json` - Configuration parameters which are responsive for how the node will work. This file should contain the following fields critical for archival nodes:
  - `"archive": true` - to save the data for all blocks to storage.
  - `cold_store` - the cold database that holds the old data. See [Run a Split Storage Archival](/archival/split-storage-archival) for its settings.
  - `"save_trie_changes": true` - required when `cold_store` is set.
  - `"tracked_shards_config": "AllShards"` - to track all shards. Do not add the deprecated `tracked_shards` key. The node does not start when both keys are set.
- `genesis.json` - A file with all the data the network started with at genesis. This contains initial accounts, contracts, access keys, and other records which represents the initial state of the blockchain.
- `node_key.json` -  A file which contains a public and private key for the node. Also includes an optional `account_id` parameter which is required to run a validator node (not covered in this doc).
- `data/` -  A folder in which a NEAR node will write it's state.

> **Heads up**
> The genesis file for `testnet` is big (8GB +) so this command will be running for a while and no progress will be shown.

Please make sure that the node is not running while changing the `config.json`.

Changing `config.json` does not turn an existing RPC node into an archival node. An RPC node has already deleted old blocks. Archive mode cannot restore them. To run an archival node, start from a split storage archival snapshot, as described in the next step.


### 4. Get data backup {#4-get-data-backup}

The node is ready to be started. However, an archival node needs the full history of the chain. Start from a split storage archival snapshot, which holds a hot database and a cold database.

The public NEAR S3 archival backups that this step used to download are no longer available. FastNEAR provides archival snapshots on request. See [FastNEAR Snapshots](https://docs.fastnear.com/snapshots) for how to request access. To place the hot and cold databases and set `config.json`, follow [Restore from an archival snapshot](/archival/split-storage-archival#restore-from-snapshot).

### 5. Run the node {#5-run-the-node}
To start your node simply run the following command:

```bash
$ ./target/release/neard --home ~/.near run
```

That's all. The node is running you can see log outputs in your console. It will download a bit of missing data since the last backup was performed but it shouldn't take much time.


## `mainnet` {#mainnet}

### 1. Clone `nearcore` project from GitHub {#1-clone-nearcore-project-from-github-1}

First, clone the [`nearcore` repository](https://github.com/near/nearcore).

```bash
$ git clone https://github.com/near/nearcore
$ cd nearcore
$ git fetch origin --tags
```

Next, checkout the release branch you need (recommended) if you will not be using the default `master` branch. Please check the [releases page on GitHub](https://github.com/near/nearcore/releases) for the latest release.

For more information on choosing between `master` and latest release branch [ [click here](/validator/compile-and-run-a-node#choosing-your-nearcore-version) ].

The following command reads the latest stable release:

```bash
$ NEAR_RELEASE_VERSION=$(curl -s https://api.github.com/repos/near/nearcore/releases/latest | grep '"tag_name"' | cut -d '"' -f 4)
$ echo "${NEAR_RELEASE_VERSION:?}"
```

### 2. Compile `nearcore` binary {#2-compile-nearcore-binary-1}

In the `nearcore` folder, check out that version and build it:

```bash
$ git checkout "tags/${NEAR_RELEASE_VERSION:?}" && make release
```

This will start the compilation process. It will take some time
depending on your machine power (e.g. i9 8-core CPU, 32 GB RAM, SSD
takes approximately 25 minutes). Note that compilation will need over
1 GB of memory per virtual core the machine has. If the build fails
with processes being killed, you might want to try reducing number of
parallel jobs, for example: `CARGO_BUILD_JOBS=8 make release`.

The binary path is `target/release/neard`

### 3. Initialize working directory {#3-initialize-working-directory-1}

The NEAR node requires a working directory with a couple of configuration files. Generate the initial required working directory by running:

```bash
$ ./target/release/neard --home ~/.near init --chain-id mainnet --download-genesis --download-config archival
```

> You can specify trusted boot nodes that you'd like to use by passing the `--boot-nodes` flag during `init`.
To find a set of active boot nodes, follow these instructions for [mainnet](/intro/node-epoch-sync#mainnet).

> You can skip the `--home` argument if you are fine with the default working directory in `~/.near`. If not, pass your preferred location.

This command will create the required directory structure by generating a `config.json`, `node_key.json`, and downloads a `genesis.json` for `mainnet`.
- `config.json` - Configuration parameters which are responsive for how the node will work. This file should contain the following fields critical for archival nodes:
  - `"archive": true` - to save the data for all blocks to storage.
  - `cold_store` - the cold database that holds the old data. See [Run a Split Storage Archival](/archival/split-storage-archival) for its settings.
  - `"save_trie_changes": true` - required when `cold_store` is set.
  - `"tracked_shards_config": "AllShards"` - to track all shards. Do not add the deprecated `tracked_shards` key. The node does not start when both keys are set.
- `genesis.json` - A file with all the data the network started with at genesis. This contains initial accounts, contracts, access keys, and other records which represents the initial state of the blockchain.
- `node_key.json` -  A file which contains a public and private key for the node. Also includes an optional `account_id` parameter which is required to run a validator node (not covered in this doc).
- `data/` -  A folder in which a NEAR node will write it's state.


### 4. Get data backup {#4-get-data-backup-1}

The node is ready to be started. However, an archival node needs the full history of the chain. Start from a split storage archival snapshot, which holds a hot database and a cold database.

The public NEAR S3 archival backups that this step used to download are no longer available. FastNEAR provides archival snapshots on request. See [FastNEAR Snapshots](https://docs.fastnear.com/snapshots) for how to request access. To place the hot and cold databases and set `config.json`, follow [Restore from an archival snapshot](/archival/split-storage-archival#restore-from-snapshot).

### 5. Run the node {#5-run-the-node-1}
To start your node simply run the following command:

```bash
$ ./target/release/neard --home ~/.near run
```

That's all. The node is running and you can see log outputs in your console. It will download a bit of missing data since the last backup was performed but it shouldn't take much time.
