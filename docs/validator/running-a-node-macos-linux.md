---
id: running-a-node
title: Run a Node on Linux and MacOS
sidebar_label: Run a Node (Linux and MacOS)
sidebar_position: 3
description: How to run a NEAR node using nearup on Linux and MacOS, with or without using Docker
---

*If this is the first time for you to setup a validator node, head to our [Validator Bootcamp 🚀](/validator/validator-bootcamp). We encourage you to set up your node with Neard instead of Nearup as Nearup is not used on Mainnet. Please head to [Run a node](/validator/compile-and-run-a-node) for instructions on how to setup a RPC node with Neard.*

This doc is written for developers, sysadmins, DevOps, or curious people who want to know how to run a NEAR node using `nearup` on Linux and MacOS, with or without using Docker.


## `nearup` Installation {#nearup-installation}
You can install `nearup` by following the instructions at https://github.com/near-guildnet/nearup.

<blockquote class="info">
<strong>Heads up</strong><br /><br />

The README for `nearup` (linked above) may be **all you need to get a node up and running** in `testnet` and `localnet`. `nearup` is exclusively used to launch NEAR `testnet` and `localnet` nodes. `nearup` is not used to launch `mainnet` nodes.  See [Deploy Node on Mainnet](deploy-on-mainnet.md) for running a node on `mainnet`.

</blockquote>

The steps in the rest of this document will require `nearup`


## Running a Node using Docker {#running-a-node-using-docker}

### Install Docker {#install-docker}

By default we use Docker to run the client.

Follow these instructions to install Docker on your machine:

* [MacOS](https://docs.docker.com/docker-for-mac/install/)
* [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

### Running `nearup` with Docker {#running-nearup-with-docker}

<blockquote class="warning">
Note: `nearup` and `neard` are running inside the container. You have to mount the ~/.near folder to ensure you don't lose your data which should live on the host.
</blockquote>

Once `nearup` and Docker are installed (by following instructions in previous section), run:

```sh
docker run -v $HOME/.near:/root/.near -p 3030:3030 --name nearup nearup/nearprotocol run testnet
```


_(If you prefer to use `localnet` then just replace `testnet` with `localnet` in the command above)_


You might be asked for a validator ID; if you do not want to validate, simply press enter. For validation, please follow the [Validator Bootcamp](/validator/validator-bootcamp).

```text
Enter your account ID (leave empty if not going to be a validator):
```


#### Running in detached mode {#running-in-detached-mode}

To run `nearup` in docker's detached (non-blocking) mode, you can add `-d` to the `docker run` command,

```
docker run -v $HOME/.near:/root/.near -p 3030:3030 -d --name nearup nearup/nearprotocol run testnet
```

#### Execute `nearup` commands in container {#execute-nearup-commands-in-container}

To execute other `nearup` commands like `logs`, `stop`, `run`, you can use `docker exec`,

```
docker exec nearup nearup logs
docker exec nearup nearup stop
docker exec nearup nearup run {testnet/localnet}
```

(The container is running in a busy wait loop, so the container won't die.)

#### `nearup` logs {#nearup-logs}

To get the `neard` logs run:

```
docker exec nearup nearup logs
```

or,

```
docker exec nearup nearup logs --follow
```

To get the `nearup` logs run:

```
docker logs -f nearup
```

![text-alt](/images/docker-logs.png)


| Legend   |                                                            |
| :------- | :--------------------------------------------------------- |
| `# 7153` | BlockHeight                                                |
| `V/1`    | `V` (validator) or  `—`  (regular node) / Total Validators |
| `0/0/40` | connected peers / up to date peers / max peers             |



## Compiling and Running a Node without Docker {#compiling-and-running-a-node-without-docker}

Alternatively, you can build and run a node without Docker by compiling `neard` locally and pointing `nearup` to the compiled binaries. Steps in this section provide details of how to do this.

Make sure [Rust](https://www.rust-lang.org/) is already installed.

For Mac OS, make sure you have developer tools installed and then use `brew` to install extra tools:

```text
brew install cmake protobuf clang llvm
```

For Linux, install these dependencies:

```text
sudo apt update
sudo apt install -y git binutils-dev libcurl4-openssl-dev zlib1g-dev libdw-dev libiberty-dev cmake gcc g++ python docker.io protobuf-compiler libssl-dev pkg-config clang llvm
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

Finally, execute:

```bash
nearup run testnet --binary-path path/to/nearcore/target/release
```

If you want to run `localnet` instead of `testnet`, then replace
`testnet` with `localnet` in the command above.  (If you’re running
`localnet` you don’t need to open port 24567).

You might be asked for a validator ID; if you do not want to validate, simply press enter. For validation, please follow the [Validator Bootcamp](/validator/validator-bootcamp).

```text
Enter your account ID (leave empty if not going to be a validator):
```

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

## Success Message {#success-message}

Once you have followed the steps for running a node with Docker or of Compiling without Docker, you should see messages similar to as shown below:


```text
Using local binary at path/to/nearcore/target/release
Our genesis version is up to date
Starting NEAR client...
Node is running!
To check logs call: `nearup logs` or `nearup logs --follow`
```

or

```text
Using local binary at path/to/nearcore/target/release
Our genesis version is up to date
Stake for user 'stakingpool.youraccount.testnet' with 'ed25519:6ftve9gm5dKL7xnFNbKDNxZXkiYL2cheTQtcEmmLLaW'
Starting NEAR client...
Node is running!
To check logs call: `nearup logs` or `nearup logs --follow`
```

## Starting a node from backup {#starting-a-node-from-backup}
Using data backups allows you to sync your node quickly by using public tar backup files. There are two types of backups for available for both `testnet` and `mainnet`:
- regular
- archival

### Archive links {#archive-links}

Download the latest snapshots from [Node Data Snapshots](/intro/node-data-snapshots).

Starting node using `neard` backup data

```bash
./neard init --chain-id <chain-id> --download-genesis
mkdir ~/.near/data
wget -c <link-above> -O - | tar -xC ~/.near/data
./neard run
```

Starting node using `nearup` backup data:

```bash
nearup run <chain-id> && sleep 30 && nearup stop
dir=$HOME/.near/<chain-id>/data
rm -r -- "$dir"  # clean up old DB files to avoid corruption
mkdir -- "$dir"
wget -c <link-above> -O - | tar -xC "$dir"
nearup run <chain-id>
```

In both examples, `<chain-id>` corresponds to `testnet` or `mainnet`.

**Note:** Default location for `neard` data is `~/.near/data`. `nearup` stores data by default in `~/.near/<chain-id>/data.`

>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
