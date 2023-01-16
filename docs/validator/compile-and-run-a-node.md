---
id: compile-and-run-a-node
title: Run a Validator Node
sidebar_label: Run a Node
sidebar_position: 3
description: Compile and Run a NEAR Node without Container in localnet, testnet, and mainnet
---

*If this is the first time for you to setup a validator node, head to our [Validator Bootcamp 🚀](/validator/validator-bootcamp).*

The following instructions are applicable across localnet, testnet, and mainnet. Note: We do not use nearup on mainnet.

If you are looking to learn how to compile and run a NEAR validator node natively (without containerization) for one of the following networks, this guide is for you.

- [`localnet`](/validator/compile-and-run-a-node#localnet)
- [`testnet`](/validator/compile-and-run-a-node#testnet)
- [`mainnet`](/validator/compile-and-run-a-node#mainnet)

## Prerequisites {#prerequisites}

- [Rust](https://www.rust-lang.org/). If not already installed, please [follow these instructions](https://docs.near.org/docs/tutorials/contracts/intro-to-rust#3-step-rust-installation).
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

## How to use this document {#how-to-use-this-document}

This document is separated into sections by network ID. Although all of the sections have almost the exact same steps/text, we found it more helpful to create individual sections so you can easily copy-paste commands to quickly get your node running.

### Choosing your `nearcore` version {#choosing-your-nearcore-version}

When building your NEAR node you will have two branch options to choose from depending on your desired use:

- `master` : _(**Experimental**)_
  - Use this if you want to play around with the latest code and experiment. This branch is not guaranteed to be in a fully working state and there is absolutely no guarantee it will be compatible with the current state of *mainnet* or *testnet*.
- [`Latest stable release`](https://github.com/near/nearcore/tags) : _(**Stable**)_
  - Use this if you want to run a NEAR node for *mainnet*. For *mainnet*, please use the latest stable release. This version is used by mainnet validators and other nodes and is fully compatible with the current state of *mainnet*.
- [`Latest release candidates`](https://github.com/near/nearcore/tags) : _(**Release Candidates**)_
  - Use this if you want to run a NEAR node for *tesnet*. For *testnet*, we first release a RC version and then later make that release stable. For testnet, please run the latest RC version.

#### (Optional) Enable debug logging {#optional-enable-debug-logging}

> **Note:** Feel free to skip this step unless you need more information to debug an issue.

To enable debug logging, run `neard` like this:

```bash
$ RUST_LOG=debug,actix_web=info ./target/release/neard --home ~/.near run
```

## `localnet` {#localnet}

### 1. Clone `nearcore` project from GitHub {#clone-nearcore-project-from-github}

First, clone the [`nearcore` repository](https://github.com/near/nearcore).

```bash
$ git clone https://github.com/near/nearcore
```

Next, checkout the release branch you need if you will not be using the default `master` branch. [ [More info](/validator/compile-and-run-a-node#choosing-your-nearcore-version) ]

```bash
$ git checkout master
```

### 2. Compile `nearcore` binary {#compile-nearcore-binary}

In the repository run the following commands:

```bash
$ make neard
```

This will start the compilation process. It will take some time
depending on your machine power (e.g. i9 8-core CPU, 32 GB RAM, SSD
takes approximately 25 minutes). Note that compilation will need over
1 GB of memory per virtual core the machine has. If the build fails
with processes being killed, you might want to try reducing number of
parallel jobs, for example: `CARGO_BUILD_JOBS=8 make neard`.

By the way, if you’re familiar with Cargo, you could wonder why not
run `cargo build -p neard --release` instead.  While this will produce
a binary, the result will be a less optimized version.  On technical
level, this is because building via `make neard` enables link-time
optimisation which is disabled by default. The binary path is `target/release/neard`.


For `localnet`, you also have the option to build in nightly mode (which is experimental and is used for cutting-edge testing). When you compile, use the following command:
```bash
$ cargo build --package neard --features nightly_protocol,nightly_protocol_features --release
```

### 3. Initialize working directory {#initialize-working-directory}

The NEAR node requires a working directory with a couple of configuration files. Generate the initial required working directory by running:

```bash
$ ./target/release/neard --home ~/.near init --chain-id localnet
```

> You can skip the `--home` argument if you are fine with the default working directory in `~/.near`. If not, pass your preferred location.

This command will create the required directory structure and will generate `config.json`, `node_key.json`, `validator_key.json`, and `genesis.json` files for `localnet` network.
- `config.json` - Configuration parameters which are responsive for how the node will work.
- `genesis.json` - A file with all the data the network started with at genesis. This contains initial accounts, contracts, access keys, and other records which represents the initial state of the blockchain.
- `node_key.json` -  A file which contains a public and private key for the node. Also includes an optional `account_id` parameter which is required to run a validator node (not covered in this doc).
- `data/` -  A folder in which a NEAR node will write its state.
- `validator_key.json` - A file which contains a public and private key for local `test.near` account which belongs to the only local network validator.


### 4. Run the node {#run-the-node}

To run your node, simply run the following command:

```bash
$ ./target/release/neard --home ~/.near run
```

That's all. The node is running you can see log outputs in your console.


## `testnet` {#testnet}

### 1. Clone `nearcore` project from GitHub {#clone-nearcore-project-from-github-1}

First, clone the [`nearcore` repository](https://github.com/near/nearcore).

```bash
$ git clone https://github.com/near/nearcore
$ cd nearcore
$ git fetch origin --tags
```

Checkout to the branch you need if not `master` (default). Latest release is recommended. Please check the [releases page on GitHub](https://github.com/near/nearcore/releases).

```bash
$ git checkout tags/1.28.0 -b mynode
```

### 2. Compile `nearcore` binary {#compile-nearcore-binary-1}

In the `nearcore` folder run the following commands:

```bash
$ make neard
```

This will start the compilation process. It will take some time
depending on your machine power (e.g. i9 8-core CPU, 32 GB RAM, SSD
takes approximately 25 minutes). Note that compilation will need over
1 GB of memory per virtual core the machine has. If the build fails
with processes being killed, you might want to try reducing number of
parallel jobs, for example: `CARGO_BUILD_JOBS=8 make neard`.

By the way, if you’re familiar with Cargo, you could wonder why not
run `cargo build -p neard --release` instead.  While this will produce
a binary, the result will be a less optimized version.  On technical
level, this is because building via `make neard` enables link-time
optimisation which is disabled by default.

The binary path is `target/release/neard`

### 3. Initialize working directory {#initialize-working-directory-1}

The NEAR node requires a working directory with a couple of configuration files. Generate the initial required working directory by running:

```bash
$ ./target/release/neard --home ~/.near init --chain-id testnet --download-genesis --download-config
```

> You can skip the `--home` argument if you are fine with the default working directory in `~/.near`. If not, pass your preferred location.

This command will create the required directory structure and will generate `config.json`, `node_key.json`, and `genesis.json` files for `testnet` network.
- `config.json` - Configuration parameters which are responsive for how the node will work.
- `genesis.json` - A file with all the data the network started with at genesis. This contains initial accounts, contracts, access keys, and other records which represents the initial state of the blockchain.
- `node_key.json` -  A file which contains a public and private key for the node. Also includes an optional `account_id` parameter which is required to run a validator node (not covered in this doc).
- `data/` -  A folder in which a NEAR node will write it's state.

> **Heads up**
> The genesis file for `testnet` is big (6GB +) so this command will be running for a while and no progress will be shown.

### 4. Get data backup {#get-data-backup}

The node is ready to be started.  When started as-is, it will establish
connection to the network and start downloading latest state.  This
may take a while so an alternative is to download [Node Data Snapshots](/intro/node-data-snapshots)
which will speed up the syncing.  The short of it is to install AWS
CLI and run:

```bash
$ aws s3 --no-sign-request cp s3://near-protocol-public/backups/testnet/rpc/latest .
$ latest=$(cat latest)
$ aws s3 --no-sign-request cp --no-sign-request --recursive s3://near-protocol-public/backups/testnet/rpc/$latest ~/.near/data
```

> **Heads up**
> An RPC node stores around 500GB of data on disk.  Furthermore, it
> requires SSD to be able to keep up with network.  Make sure that you
> have enough free space on a fast-enough disk.

Note that you don’t have to perform this step if you prefer a fully
decentralized experience when the node downloads data from the NEAR
network.

### 5. Run the node {#run-the-node}
To start your node simply run the following command:

```bash
$ ./target/release/neard --home ~/.near run
```

That's all. The node is running you can see log outputs in your console. It will download a bit of missing data since the last backup was performed but it shouldn't take much time.


## `mainnet` {#mainnet}

### 1. Clone `nearcore` project from GitHub {#clone-nearcore-project-from-github-2}

First, clone the [`nearcore` repository](https://github.com/near/nearcore).

```bash
$ git clone https://github.com/near/nearcore
$ cd nearcore
$ git fetch origin --tags
```

Next, checkout the release branch you need you will not be using the
default `master` branch.  Please check the [releases page on
GitHub](https://github.com/near/nearcore/releases) for the latest
release.

For more information on choosing between `master` and latest release branch [ [click here](/validator/compile-and-run-a-node#choosing-your-nearcore-version) ].

```bash
$ git checkout tags/1.26.1 -b mynode
```

### 2. Compile `nearcore` binary {#compile-nearcore-binary-2}

In the `nearcore` folder run the following commands:

```bash
$ make neard
```

This will start the compilation process. It will take some time
depending on your machine power (e.g. i9 8-core CPU, 32 GB RAM, SSD
takes approximately 25 minutes). Note that compilation will need over
1 GB of memory per virtual core the machine has. If the build fails
with processes being killed, you might want to try reducing number of
parallel jobs, for example: `CARGO_BUILD_JOBS=8 make neard`.

By the way, if you’re familiar with Cargo, you could wonder why not
run `cargo build -p neard --release` instead.  While this will produce
a binary, the result will be a less optimized version.  On technical
level, this is because building via `make neard` enables link-time
optimisation which is disabled by default.

The binary path is `target/release/neard`

### 3. Initialize working directory {#initialize-working-directory-2}

In order to work NEAR node requires to have working directory and a couple of configuration files. Generate the initial required working directory by running:

```bash
$ ./target/release/neard --home ~/.near init --chain-id mainnet --download-config
```

> You can skip the `--home` argument if you are fine with the default working directory in `~/.near`. If not, pass your preferred location.

This command will create the required directory structure by generating a `config.json`, `node_key.json`, and downloads a `genesis.json` for `mainnet`.
- `config.json` - Configuration parameters which are responsive for how the node will work.
- `genesis.json` - A file with all the data the network started with at genesis. This contains initial accounts, contracts, access keys, and other records which represents the initial state of the blockchain.
- `node_key.json` -  A file which contains a public and private key for the node. Also includes an optional `account_id` parameter which is required to run a validator node (not covered in this doc).
- `data/` -  A folder in which a NEAR node will write it's state.


### 4. Get data backup {#get-data-backup-1}

The node is ready to be started. When started as-is, it will establish
connection to the network and start downloading latest state.  This
may take a while so an alternative is to download [Node Data Snapshots](/intro/node-data-snapshots)
which will speed up the syncing.  The short of it is to install AWS
CLI and run:

```bash
$ aws s3 --no-sign-request cp s3://near-protocol-public/backups/mainnet/rpc/latest .
$ latest=$(cat latest)
$ aws s3 --no-sign-request cp --no-sign-request --recursive s3://near-protocol-public/backups/mainnet/rpc/$latest ~/.near/data
```

> **Heads up**
> An RPC node stores around 500GB of data on disk.  Furthermore, it
> requires SSD to be able to keep up with network.  Make sure that you
> have enough free space on a fast-enough disk.

Note that you don’t have to perform this step if you prefer a fully
decentralized experience when the node downloads data from the NEAR
network.

### 5. Run the node {#run-the-node-1}
To start your node simply run the following command:

```bash
$ ./target/release/neard --home ~/.near run
```

That's all. The node is running and you can see log outputs in your console. It will download a bit of missing data since the last backup was performed but it shouldn't take much time.


>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
