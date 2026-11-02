---
id: deploy-on-mainnet
title: Deploy Mainnet Staking Pool
sidebar_label: Deploy Mainnet Staking Pool
sidebar_position: 5
---

Deploying a node on `mainnet` is similar to deploying one on `testnet`
and requires the following steps:

1. Create `mainnet` wallet.
2. Build `mainnet` validator node daemon.
3. Initialize the node.
4. Deploy `mainnet` staking pool.
5. Run the validator node.


### 1. Create `mainnet` wallet {#create-wallet}

If you don’t have a NEAR account, first go to [NEAR
Wallet](https://wallet.near.org/) and create one.


### 2. Build `mainnet` validator node daemon {#build-node}

To build the validator first clone the [`nearcore`
repository](https://github.com/near/nearcore):

```bash
git clone https://github.com/near/nearcore.git
```

Once that’s done, figure out [the most recent stable
release](https://github.com/near/nearcore/releases).  Stable releases
are ones without `-rc.<number>` suffix (‘rc’ stands for ‘release
candidate’).  This can be done automatically as follows:

```bash
NEAR_RELEASE_VERSION=$(curl -s https://api.github.com/repos/near/nearcore/releases/latest |
                       grep '"tag_name"' | cut -d '"' -f 4)
echo "${NEAR_RELEASE_VERSION:?}"
```

Now, go to the cloned repository’s root directory, check out the code
corresponding to the latest stable release and build the executable.
Each nearcore release is a git tag:

```bash
cd nearcore
git checkout "tags/${NEAR_RELEASE_VERSION:?}" && make neard
```

`make neard` builds with the release profile, which already enables
full optimization.  The executable is at `./target/release/neard`.


### 3. Initialize the node {#init-node}

Once the daemon executable is built it’s time to initialize the node.

First, get a list of boot nodes.  The node uses them to find its first
peers.  The reference validator `config.json` does not include any boot
nodes, so you need to pass them to `neard init`.  The following command
asks a mainnet RPC node for the validators it is connected to.  It
needs `jq`.  You can use any RPC provider for this command:

```bash
BOOT_NODES=$(curl -s -X POST https://rpc.mainnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)
echo "${BOOT_NODES:?}"
```

Then initialize the node with the reference validator config and the
boot nodes:

```bash
./target/release/neard init --chain-id=mainnet \
                            --account-id="<POOL_ID>.poolv1.near" \
                            --download-config validator \
                            --boot-nodes "${BOOT_NODES:?}"
```

`--download-config validator` downloads the reference validator
`config.json`.  Without it, `neard init` writes a default config that
tracks all shards.  On mainnet, a node that tracks all shards stops at
startup while its account is a validator in the current epoch.

`<POOL_ID>` is the name you want to use for your staking pool.  Note
that at this point the `<POOL_ID>.poolv1.near` account doesn’t yet
exist.  We’re going to create it in the next step.

This command will create a `~/.near/validator_key.json` file which
will contain validator’s private key.  `neard init` creates this file
only when `--account-id` is given.  It also creates
`~/.near/node_key.json`, which holds the node’s network key.  Do not
use the key from `node_key.json` for staking.  It’s a good idea to back
up `validator_key.json` in a secure location.  For now, read the
validator’s public key from this file:

```bash
grep public_key ~/.near/validator_key.json
```


### 4. Deploy `mainnet` Staking Pool {#deploy-staking-pool}

You can deploy the staking pool with [near-cli](https://github.com/near/near-cli),
using the `near call` command:

```bash
near call poolv1.near create_staking_pool '{
    "staking_pool_id": "<POOL_ID>",
    "owner_id": "<OWNER_ID>",
    "stake_public_key": "<VALIDATOR_KEY>",
    "reward_fee_fraction": {"numerator": <X>, "denominator": <Y>}
}' --account_id <OWNER_ID> --amount 30 --gas 300000000000000
```

It will invoke the `staking-pool-factory` method from [NEAR Core
Contracts](https://github.com/near/core-contracts), passing the
following parameters:

- `poolv1.near` is the staking pool factory,
- `<POOL_ID>` is the name of your validator (and the staking pool
  associated with it),
- `<OWNER_ID>` is the wallet that controls the pool (see [owner-only
  methods](https://github.com/near/core-contracts/tree/master/staking-pool#owner-only-methods)
  for more information),
- `<VALIDATOR_KEY>` is the validator node public key read in the
  previous step from the `~/.near/validator_key.json` file,
- `{"numerator": <X>, "denominator": <Y>}` sets the validator fees
  (for example`X=10` and `Y=100` means 10%),
- `--amount 30` attaches 30 $NEAR to the transaction to pay the
  contract storage,
- `--gas 300000000000000` specifies the amount of gas for the
  transaction (optional).

Note that if your `<POOL_ID>` is ‘buildlinks’, the staking pool
factory will deploy a contract called ‘buildlinks.poolv1.near’, and
your node will appear in the Explorer as ‘buildlinks.poolv1.near’.
This corresponds to the account identifier used in the previous step.


### 5. Run the validator node {#run-the-node}

Once the daemon is built, node is initialized and staking pool
created, the validator can be started.  To make sure the node has been
set up correctly, check that `~/.near/config.json` lists boot nodes and
tracks no shards:

```bash
jq '.network.boot_nodes, .tracked_shards_config' ~/.near/config.json
```

The first value must not be empty, and the second must be `"NoShards"`.
A validator still tracks the shards it is assigned to.  Your
`config.json` does not match the reference file byte for byte.  This is
expected, because `neard init` adds the boot nodes and writes the file
again.

If everything is in order, start your node with the following command:

```
./target/release/neard run
```

After the node starts, check its log.  The node logs `Waiting for peers`
until it is connected to at least `consensus.min_num_peers` peers (3 by
default).  If the message does not go away, the node cannot connect to
enough peers.  Check that `network.boot_nodes` in `config.json` is not
empty, and that the machine can reach those addresses.

You can start your node without the JSON RPC endpoint by running the
above command with an additional `--disable-rpc` flag.  This reduces
resource use and attack vector by closing a listening port.
