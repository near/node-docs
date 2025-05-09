---
id: run-rpc-node-without-nearup
title: Run an RPC Node
sidebar_label: Run a Node 🚀
sidebar_position: 2
description: How to run an RPC Node without nearup
---

The following instructions are applicable across localnet, testnet, and mainnet.

If you are looking to learn how to compile and run a NEAR RPC node natively for one of the following networks, this guide is for you.

- [`testnet`](/rpc/run-rpc-node-without-nearup#testnet)
- [`mainnet`](/rpc/run-rpc-node-without-nearup#mainnet)


<blockquote class="info">
<strong>Heads up</strong><br /><br />

Running a RPC node is very similar to running a [validator node](/validator/running-a-node) as both types of node use the same `nearcore` release. The main difference for running a validator node is requiring `validator_key.json` to be used by the validator node to support its work of validating blocks and chunks on the network.

</blockquote>


## Prerequisites

- [Rust](https://www.rust-lang.org/). If not already installed, please [follow these instructions](https://doc.rust-lang.org/book/ch01-01-installation.html).
- [Git](https://git-scm.com/)
- Installed developer tools:
  - MacOS
    ```bash
    $ brew install cmake protobuf clang llvm awscli
    ```
  - Linux
    ```bash
    $ apt update
    $ apt install -y git binutils-dev libcurl4-openssl-dev zlib1g-dev libdw-dev libiberty-dev cmake gcc g++ python docker.io protobuf-compiler libssl-dev pkg-config clang llvm cargo awscli
    ```
---

### Choosing your `nearcore` version

When building your NEAR node you will have two branch options to choose from depending on your desired use:

- `master` : _(**Experimental**)_
  - Use this if you want to play around with the latest code and experiment. This branch is not guaranteed to be in a fully working state and there is absolutely no guarantee it will be compatible with the current state of *mainnet* or *testnet*.
- [`Latest stable release`](https://github.com/near/nearcore/tags) : _(**Stable**)_
  - Use this if you want to run a NEAR node for *mainnet*. For *mainnet*, please use the latest stable release. This version is used by mainnet validators and other nodes and is fully compatible with the current state of *mainnet*.
- [`Latest release candidates`](https://github.com/near/nearcore/tags) : _(**Release Candidates**)_
  - Use this if you want to run a NEAR node for *tesnet*. For *testnet*, we first release a RC version and then later make that release stable. For testnet, please run the latest RC version.


## `testnet`

### 1. Clone `nearcore` project from GitHub {#1-clone-nearcore-project-from-github}

First, clone the [`nearcore` repository](https://github.com/near/nearcore).

```bash
$ git clone https://github.com/near/nearcore
$ cd nearcore
$ git fetch origin --tags
```

Checkout to the branch you need if not `master` (default). Latest release is recommended. Please check the [releases page on GitHub](https://github.com/near/nearcore/releases).

```bash
$ git checkout tags/1.25.0 -b mynode
```

### 2. Compile `nearcore` binary {#2-compile-nearcore-binary}

In the `nearcore` folder run the following commands:

```bash
$ make release
```

This will start the compilation process. It will take some time
depending on your machine power (e.g. i9 8-core CPU, 32 GB RAM, SSD
takes approximately 25 minutes). Note that compilation will need over
1 GB of memory per virtual core the machine has. If the build fails
with processes being killed, you might want to try reducing number of
parallel jobs, for example: `CARGO_BUILD_JOBS=8 make release`.

If you’re familiar with Cargo, you could also run `cargo build -p neard
--release` instead, which might or might not be equivalent to `make release`. It
is equivalent at the time of writing, but we don't guarantee this. If in doubt,
consult the `Makefile`, or just stick with `make release`.

The binary path is `target/release/neard`

### 3. Initialize working directory {#3-initialize-working-directory}

The NEAR node requires a working directory with a couple of configuration files. Generate the initial required working directory by running:

```bash
$ ./target/release/neard --home ~/.near init --chain-id testnet --download-genesis --download-config rpc
```

> You can specify trusted boot nodes that you'd like to use by pass in a flag during init: `--boot-nodes ed25519:4k9csx6zMiXy4waUvRMPTkEtAS2RFKLVScocR5HwN53P@34.73.25.182:24567,ed25519:4keFArc3M4SE1debUQWi3F1jiuFZSWThgVuA2Ja2p3Jv@34.94.158.10:24567,ed25519:D2t1KTLJuwKDhbcD9tMXcXaydMNykA99Cedz7SkJkdj2@35.234.138.23:24567,ed25519:CAzhtaUPrxCuwJoFzceebiThD9wBofzqqEMCiupZ4M3E@34.94.177.51:24567`

> You can skip the `--home` argument if you are fine with the default working directory in `~/.near`. If not, pass your preferred location.

This command will create the required directory structure and will generate `config.json`, `node_key.json`, and `genesis.json` for `testnet` network.
- `config.json` - Configuration parameters which are responsive for how the node will work. This file should contain the following fields critical for RPC nodes:
  - `"tracked_shards": [0]` - to track all shards.
- `genesis.json` - A file with all the data the network started with at genesis. This contains initial accounts, contracts, access keys, and other records which represents the initial state of the blockchain.
- `node_key.json` -  A file which contains a public and private key for the node. Also includes an optional `account_id` parameter which is required to run a validator node (not covered in this doc).
- `data/` -  A folder in which a NEAR node will write it's state.

> **Heads up**
> The genesis file for `testnet` is big (6GB +) so this command will be running for a while and no progress will be shown.


### 4. Get data backup {#4-get-data-backup}

⚠️ **FREE SNAPSHOT SERVICE BY FASTNEAR WILL BE DEPRECATGED STARTING JUNE 1ST, 2025. We strongly recommend all node operators to use [Epoch Sync](../intro/epoch_sync.md) when possible.**

The node is ready to be started. However, you must first sync up with the network. This means your node needs to download all the headers and blocks that other nodes in the network already have.

~~The latest daily snapshots are made available to the public by FastNear, and can be used to set up a validator node or RPC. 
For detailed instructions, please refer to [HERE](https://docs.fastnear.com/docs/snapshots).~~
While snapshot-based syncing was previously the recommended default, we now recommend Epoch Sync—a faster, more lightweight method that allows a node to catch up from genesis without downloading a large state snapshot.

### 5. Run the node {#5-run-the-node}
To start your node simply run the following command:

```bash
$ ./target/release/neard --home ~/.near run
```

That's all. The node is running you can see log outputs in your console. It will download a bit of missing data since the last backup was performed but it shouldn't take much time.


## `mainnet`

### 1. Clone `nearcore` project from GitHub {#1-clone-nearcore-project-from-github-1}

First, clone the [`nearcore` repository](https://github.com/near/nearcore).

```bash
$ git clone https://github.com/near/nearcore
$ cd nearcore
$ git fetch origin --tags
```

Next, checkout the release branch you need (recommended) if you will not be using the default `master` branch. Please check the [releases page on GitHub](https://github.com/near/nearcore/releases) for the latest release.

For more information on choosing between `master` and latest release branch [ [click here](/validator/compile-and-run-a-node#choosing-your-nearcore-version) ].

```bash
$ git checkout tags/1.25.0 -b mynode
```

### 2. Compile `nearcore` binary {#2-compile-nearcore-binary-1}

In the `nearcore` folder run the following commands:

```bash
$ make release
```

This will start the compilation process. It will take some time
depending on your machine power (e.g. i9 8-core CPU, 32 GB RAM, SSD
takes approximately 25 minutes). Note that compilation will need over
1 GB of memory per virtual core the machine has. If the build fails
with processes being killed, you might want to try reducing number of
parallel jobs, for example: `CARGO_BUILD_JOBS=8 make release`.

If you’re familiar with Cargo, you could also run `cargo build -p neard
--release` instead, which might or might not be equivalent to `make release`. It
is equivalent at the time of writing, but we don't guarantee this. If in doubt,
consult the `Makefile`, or just stick with `make release`.

The binary path is `target/release/neard`

### 3. Initialize working directory {#3-initialize-working-directory-1}

The NEAR node requires a working directory with a couple of configuration files. Generate the initial required working directory by running:

```bash
$ ./target/release/neard --home ~/.near init --chain-id mainnet --download-genesis --download-config rpc
```

> You can specify trusted boot nodes that you'd like to use by pass in a flag during init: `--boot-nodes ed25519:86EtEy7epneKyrcJwSWP7zsisTkfDRH5CFVszt4qiQYw@35.195.32.249:24567,ed25519:BFB78VTDBBfCY4jCP99zWxhXUcFAZqR22oSx2KEr8UM1@35.229.222.235:24567,ed25519:Cw1YyiX9cybvz3yZcbYdG7oDV6D7Eihdfc8eM1e1KKoh@35.195.27.104:24567,ed25519:33g3PZRdDvzdRpRpFRZLyscJdbMxUA3j3Rf2ktSYwwF8@34.94.132.112:24567,ed25519:CDQFcD9bHUWdc31rDfRi4ZrJczxg8derCzybcac142tK@35.196.209.192:24567`

> You can skip the `--home` argument if you are fine with the default working directory in `~/.near`. If not, pass your preferred location.

This command will create the required directory structure by generating a `config.json`, `node_key.json`, and downloads a `genesis.json` for `mainnet`.
- `config.json` - Configuration parameters which are responsive for how the node will work. This file should contain the following fields critical for RPC nodes:
  - `"tracked_shards": [0]` - to track all shards.
- `genesis.json` - A file with all the data the network started with at genesis. This contains initial accounts, contracts, access keys, and other records which represents the initial state of the blockchain.
- `node_key.json` -  A file which contains a public and private key for the node. Also includes an optional `account_id` parameter which is required to run a validator node (not covered in this doc).
- `data/` -  A folder in which a NEAR node will write it's state.

### 4. Get data backup {#4-get-data-backup-1}

⚠️ **FREE SNAPSHOT SERVICE BY FASTNEAR WILL BE DEPRECATGED STARTING JUNE 1ST, 2025. We strongly recommend all node operators to use [Epoch Sync](../intro/epoch_sync.md) when possible.**

The node is ready to be started. However, you must first sync up with the network. This means your node needs to download all the headers and blocks that other nodes in the network already have.

~~The latest daily snapshots are made available to the public by FastNear, and can be used to set up a validator node or RPC. 
For detailed instructions, please refer to [HERE](https://docs.fastnear.com/docs/snapshots).~~
While snapshot-based syncing was previously the recommended default, we now recommend Epoch Sync—a faster, more lightweight method that allows a node to catch up from genesis without downloading a large state snapshot.

### 5. Run the node {#5-run-the-node}
To start your node simply run the following command:

```bash
$ ./target/release/neard --home ~/.near run
```

That's all. The node is running and you can see log outputs in your console. It will download a bit of missing data since the last backup was performed but it shouldn't take much time.



## Running a node in `light` mode
Running a node in `light` mode allows the operator to access chain level data, not state level data. You can also use the `light` node to submit transactions or verify certain proofs. To run a node in a `light` mode that doesn't track any shards, the only change required is to update the `config.json` whereby `tracked_shards` is set to an empty array.

```
"tracked_shards": []
```


>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
