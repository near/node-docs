---
id: running-a-node
title: Run a Node on Linux and MacOS
sidebar_label: Run a Node (Linux and MacOS)
sidebar_position: 5
description: How to run a NEAR node on Linux and MacOS, with or without using Docker
---

*If this is the first time for you to setup a validator node, head to our [Validator Bootcamp 🚀](/validator/validator-bootcamp). Please head to [Run a node](/validator/compile-and-run-a-node) for instructions on how to setup a validator node with neard.*

This doc is written for developers, sysadmins, DevOps, or curious people who want to know how to run a NEAR node on Linux and MacOS.


## Running a Node using Docker {#running-a-node-using-docker}

For running a node using Docker, please refer to the [Docker setup guide](docker-setup.md).


## Compiling and Running a Node without Docker {#compiling-and-running-a-node-without-docker}

You can build and run a node without Docker by compiling `neard` locally. Steps in this section provide details of how to do this.

As a prerequisite, [Rust](https://www.rust-lang.org/) needs to be installed on your machine.

For Mac OS, make sure you have developer tools installed and then use `brew` to install extra tools:

```text
brew install cmake protobuf clang llvm jq
```

For Linux, install these dependencies:

```text
sudo apt update
sudo apt install -y git binutils-dev libcurl4-openssl-dev zlib1g-dev libdw-dev libiberty-dev cmake gcc g++ python docker.io protobuf-compiler libssl-dev pkg-config clang llvm jq
```

Then clone the repo:

```text
git clone https://github.com/near/nearcore.git
cd nearcore
```
Checkout the version you wish to build:

```bash
git checkout <version>
```

You can then run:

```bash
make neard
```

This will compile the `neard` binary for the version you have checked out, it will be available under `target/release/neard`.

Note that compilation will need over 1 GB of memory per virtual core
the machine has. If the build fails with processes being killed, you
might want to try reducing number of parallel jobs, for example:
`CARGO_BUILD_JOBS=8 make neard`.

NB. Please ensure you build releases through `make` rather than `cargo
build --release`.  The latter skips some optimisations (most notably
link-time optimisation) and thus produces a less efficient executable.

If your machine is behind a firewall or NAT, make sure port 24567 is
open and forwarded to the machine where the node is going to be
running.

Finally, initialize the working directory and start the node.  The
node needs boot nodes to find its first peers.  The reference RPC
`config.json` has no boot nodes. Follow [Fetch boot nodes](/intro/boot-nodes#fetch-boot-nodes) with `CHAIN_ID=testnet` to set `BOOT_NODES`, then return here and continue in the same shell:

```bash
./target/release/neard --home ~/.near init --chain-id testnet --download-genesis --download-config rpc --boot-nodes "${BOOT_NODES:?}"
```

Check that `network.boot_nodes` in `config.json` is not empty:

```bash
jq -r '.network.boot_nodes' ~/.near/config.json
```

The command should print a comma-separated list of boot nodes. If it prints an empty line, the node has no peers to sync from. Add boot nodes as described in [Update an existing configuration](/intro/boot-nodes#update-an-existing-configuration). Running `neard init` again does not add them, because it does not change an existing `config.json`.

Then start the node:

```bash
./target/release/neard --home ~/.near run
```

If you want to run `localnet` instead of `testnet`, you do not need
boot nodes.  Run `./target/release/neard --home ~/.near init --chain-id localnet`
instead, then start the node.  (If you're running `localnet` you don't
need to open port 24567).

For validation, please follow the [Validator Bootcamp](/validator/validator-bootcamp).

## Running a Node on the Cloud {#running-a-node-on-the-cloud}

Create a new instance following the [Hardware requirements](hardware-validator.md).

Add firewall rules to allow traffic to port 24567 from all IPs
(0.0.0.0/0).

SSH into the machine.  Depending on your cloud provider this may
require different commands.  Often simple `ssh hosts-external-ip`
should work.  Cloud providers may offer custom command to help with
connecting to the instances: GCP offers [`gcloud compute
ssh`](https://cloud.google.com/sdk/gcloud/reference/compute/ssh), AWS
offers [`aws emr
ssh`](https://docs.aws.amazon.com/cli/latest/reference/emr/ssh.html)
and Azure offers [`az
ssh`](https://docs.microsoft.com/en-gb/cli/azure/ssh?view=azure-cli-latest).

Once connected to the instance, follow [the steps listed
above](#compiling-and-running-a-node-without-docker).

## Starting a node with epoch sync {#starting-a-node-from-backup}
A new node syncs with [Epoch Sync](/intro/node-epoch-sync), so it does not need a data backup. Follow [Fetch boot nodes](/intro/boot-nodes#fetch-boot-nodes) with `CHAIN_ID` set to your network (`mainnet` or `testnet`). Return here and continue in the same shell, replacing `<chain-id>` with that network:

```bash
./neard init --chain-id <chain-id> --download-genesis --boot-nodes "${BOOT_NODES:?}"
```

Check that `network.boot_nodes` in `config.json` is not empty:

```bash
jq -r '.network.boot_nodes' ~/.near/config.json
```

The command should print a comma-separated list of boot nodes. If it prints an empty line, the node has no peers to sync from. Add boot nodes as described in [Update an existing configuration](/intro/boot-nodes#update-an-existing-configuration). Running `neard init` again does not add them, because it does not change an existing `config.json`.

Then start the node with an empty `data` folder:

```bash
./neard run
```

Where `<chain-id>` corresponds to `testnet` or `mainnet`.
