---
id: run-rpc-node-with-nearup
title: Run an RPC Node (with nearup)
sidebar_label: Run a Node (with nearup)
sidebar_position: 3
description: How to run an RPC Node with nearup
---

*We encourage you to set up your node with Neard instead of Nearup as Nearup is not used on Mainnet. Please head to [Run a Node](/rpc/run-rpc-node-without-nearup) for instructions on how to setup a RPC node with Neard.*

<blockquote class="info">
<strong>Heads up</strong><br /><br />

The README for `nearup` (linked above) may be **all you need to get a node up and running** in `testnet` and `localnet`. `nearup` is exclusively used to launch NEAR `testnet` and `localnet` nodes. `nearup` is not used to launch `mainnet` nodes.

</blockquote>


## Prerequisites

- [Git](https://git-scm.com/)
- [Nearup](https://github.com/near-guildnet/nearup): Make sure [`nearup`](https://github.com/near-guildnet/nearup) is installed. You can install `nearup` by following the instructions at https://github.com/near-guildnet/nearup.

---

### Steps to Run an RPC Node using `nearup`

Running a RPC node is very similar to running a [validator node](/validator/running-a-node) as both types of node use the same `nearcore` release. The main difference for running a validator node is requiring `validator_key.json` to be used by the validator node to support its work of validating blocks and chunks on the network.


First, clone the `nearcore` repo:

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
build --release`.  The latter skips some optimizations (most notably
link-time optimisation) and thus produces a less efficient executable.


```bash
nearup run testnet --binary-path path/to/nearcore/target/release
```

You will then be prompted for an Account ID below. You should leave this empty as you are running an RPC node, not a validator node.

```text
Enter your account ID (leave empty if not going to be a validator):
```

Wait until initialization finishes, use the following command to follow logs:
```bash
  $ nearup logs --follow
```
Then run:
```bash
  $ nearup stop
```

### Retrieve a copy of the latest RPC snapshot:

The latest daily snapshots are made available to the public by FastNear, and can be used to set up a validator node or RPC. 
For detailed instructions, please refer to [HERE](https://docs.fastnear.com/docs/snapshots).
