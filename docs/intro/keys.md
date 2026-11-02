---
id: keys
title: Key Management
sidebar_label: Key Management
sidebar_position: 4
description: NEAR Node Key Management
---

## What are Keys? {#what-are-keys}

In public key cryptography, there exists a key pair, one public and one private, to sign and send verifiable transactions across the network. NEAR takes the common approach of using public keys for identity and private keys for signatures. Internally the NEAR platform uses ed25519, one of several "elliptic curves" that produce secure cryptographic results quickly. Specifically, we use `tweetnacl` in JavaScript and `libsodium` in Rust.

## Are there Different Types of Keys? {#are-there-different-types-of-keys}

There are 3 types of key pairs on the NEAR platform:

- Signer Keys (e.g. account keys, access keys)
- Validator Keys
- Node Keys

**Signer Keys** are the ones we all know and love. They're used by accounts on the network to sign transactions like `sendMoney` and `stake` before sending these transactions to the network. Signer keys are not related to running a node in any way. End users who sign up through the [NEAR Wallet](https://wallet.near.org/) get their own signer keys, for example. These are the keys that humans think about and keep safe.

There are two flavors of signer keys currently available, `FullAccess` keys and `FunctionCall` keys. The first has unrestricted control to "act on behalf of an account" (as used by NEAR CLI and NEAR Wallet to get things done for you). The second is limited to contract storage and compute. Both flavors of keys can be revoked by the account holder. There is no limit to the flavors of keys that the NEAR platform can handle so we can easily imagine keys for voting, shopping, conducting official business, etc. each with their own access controls on our data, programmable time limits, etc. But keep in mind that you do have to pay rent on keys issued to your account.

**Validator Keys** are used by validators (people and companies who are committed to maintaining the integrity of the system) to support their work of validating blocks and chunks on the network, nothing more. The human validators don't think about these keys beyond creating them and resetting them. Once added to a validator's node, validator keys are used by the node to do their thing of validating blocks and chunks. `neard init` creates a validator key when you pass `--account-id <staking pool account id>`. It writes the key to `validator_key.json` in the node's home directory. If that file already exists, `neard init` keeps it, and fails if the file holds a key for a different account. `neard run` does not create a validator key. A node without `validator_key.json` runs as a non-validator node.

**Node Keys** are something no humans on the network think about except core contributors to the platform. A node key identifies the node on the peer-to-peer network. Its public key is the node's peer ID. The node signs its peer connection records and the routed network messages it sends with this key. Block headers and other consensus messages are signed with the validator key, not the node key. `neard init` creates the node key in `node_key.json` in the node's home directory. `neard run` does not create it and fails to start if the file is missing.

## Can Keys be Changed? {#can-keys-be-changed}

Yes, but only in that keys can be _reset_ (ie. regenerated as a new key pair). If a private key is lost or compromised somehow then a new key pair must be generated. This is just the nature of secure keys.

**Signers** can create new keys and revoke existing keys at will. NEAR Wallet also supports key recovery via SMS or seed phrase which makes it convenient to move signer keys from one computer to another, for example.

**Validators** can reset their validator keys, but the new key must be registered on chain first. The network checks a validator's signatures against the public key registered for that validator in the current epoch. A new key, sent with a stake action, takes effect two epochs after the epoch that includes the stake action.

Since nearcore 2.12.0, a synced node also compares the key in its `validator_key.json` with the key registered for the current epoch. The node runs this check after every start and at the first block of each epoch, when its account is a validator in that epoch. If the keys differ, the node stops with a "validator key mismatch" error.

To reset a validator key:

1. Create a new ed25519 key pair for the same account id. Save it in a new file with the same fields as `validator_key.json`: `account_id`, `public_key` and `secret_key`. Do not replace the `validator_key.json` that the node uses yet.
2. Register the new public key on chain. For a staking pool, the pool owner calls the pool's `update_staking_key` method with the new public key. A validator without a pool sends a stake transaction with the new key and its current stake. The new key then shows in `current_proposals` of the `validators` response.
3. Keep the old key in `validator_key.json` until the new key is active. Call the `validators` RPC method and check its `next_validators` list. When the list shows the new public key for your account, the new key becomes active when the next epoch starts. The next epoch starts near the height `epoch_start_height` + `epoch_length`. `epoch_start_height` is in the same `validators` response. `epoch_length` is in the response of the `EXPERIMENTAL_protocol_config` RPC method, with `{"finality": "final"}` as `params`.
4. Shortly before that epoch starts, stop the node and replace `validator_key.json` with the new key file.
5. Start the node after the new epoch has started and the new key is active. Check this with the `validators` RPC method. Its `current_validators` list must show the new public key for your account. Your node is stopped, so send this request to any synced RPC node. If you start the node before the new key is active, the node compares the new key with the old registered key and stops.

Steps 3 and 5 read two different lists of the `validators` response:

| Step | List | What it shows when it has the new key |
|---|---|---|
| 3. Before you stop the node | `next_validators` | The new key becomes active when the next epoch starts. |
| 5. Before you start the node | `current_validators` | The new key is active now. |

For example, this command prints the key that is active for your pool in the current epoch on mainnet. Replace `<POOL_ID>` with your staking pool account. On testnet, use `https://rpc.testnet.near.org`. Replace `current_validators` with `next_validators` for the check in step 3.

```bash
curl -s -d '{"jsonrpc": "2.0", "method": "validators", "id": "dontcare", "params": [null]}' -H 'Content-Type: application/json' https://rpc.mainnet.near.org | jq -r '.result.current_validators[] | select(.account_id == "<POOL_ID>") | .public_key'
```

The node misses its blocks, chunks and endorsements while it is stopped. If the node still runs with the old key when the new epoch starts, it stops at the first block of that epoch. In that case, replace `validator_key.json` with the new key file and start the node again.

Instead of steps 4 and 5, you can swap the key without a restart. Replace `validator_key.json` near the end of the epoch, and send SIGHUP to neard (`kill -HUP <neard pid>`). The node logs `hot loading validator key`. Send SIGHUP after `next_validators` shows the new key and before the next epoch starts. The node misses its blocks, chunks and endorsements from the swap until the new epoch starts.

**Nodes** should not need to reset their node keys.

<blockquote class="info">
<strong>Did you know?</strong><br /><br />

As a brief word on the NEAR runtime, the subsystem that manages state transitions on the blockchain (ie. keeping things moving from one block to the next), it's worth understanding that the movement of the system happens in stages, called epochs, during which the group of validators does not change. The [Nightshade whitepaper](https://near.org/papers/nightshade) introduces epochs this way: "the maintenance of the network is done in epochs, where an epoch is a period of time on the order of days." and there's much more detail in the paper.

At the beginning of each epoch, some computation produces a list of validators for the very next epoch (not the one that just started). The input to this computation includes all validators that have "raised their hand" to be a validator by staking some amount over the system's staking threshold. The output of this computation is a list of the validators for the very next epoch.

When a validator is elected during an epoch, they have the opportunity to stake (ie. put some skin in the game in the form of tokens) in support of their intent to "behave" while keeping their node running so others can rent storage and compute on it. Any foul play on the part of the validator that is detected by the system may result is a slashing event where the validator is marked as out of integrity and forfeit their stake to be redistributed among other validators.

</blockquote>

<blockquote class="warning">
<strong>Heads up</strong><br /><br />

The key in `validator_key.json` must match the key that the network has registered for the validator in the current epoch. If it does not, neard 2.12.0 and later stops with a "validator key mismatch" error. While the node is stopped, the validator misses its blocks, chunks and endorsements. If it misses too many, it can lose its place in the validator set, and its stake is returned to it. To change a validator key safely, follow the steps in [Can Keys be Changed?](#can-keys-be-changed).

</blockquote>

For concrete examples of keys being used as identifiers, you can see a list of validators and active nodes on various NEAR networks here:

- NEAR testnet (staking currently disabled)
  - `https://rpc.testnet.near.org/status`
  - `https://rpc.testnet.near.org/network_info`
