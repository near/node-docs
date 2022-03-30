---
id: staking-pool-migration
title: Upgradeable Staking Pool
sidebar_label: Upgradeable Staking Pool
sidebar_position: 7
---

#  Upgradeable Staking Pool

NEAR Protocol is launch an upgradeable staking pool contract with features include:
- Upgradeability
- Stake farming

In the future, this upgradeable staking pool contract will also support action to stake to Chunk-Only Producers. The upgradeable staking contract's name on Testnet is `factory01.littlefarm.testnet`. The contract name on Mainnet is `pool.near`.

### Deploy a New Staking Pool Contract
Calls the staking pool factory, creates a new staking pool with the specified name, and deploys it to the indicated accountId.

For Testnet: (This call will not work as the `code_hash` has not been added to the factory. Please stay tuned for announcement when this contract is ready.)

```
near call factory01.littlefarm.testnet  create_staking_pool '{"staking_pool_id": "<poolId>", "owner_id": "<accountId>", "stake_public_key": "<public key in validator.json>", "reward_fee_fraction": {"numerator": 5, "denominator": 100}, "code_hash": "GGfKUF9TuAFN4AzbecPonNGuRTuVqx8UPXmViogN8pRm"}' --accountId="<accountId>" --amount=30 --gas=300000000000000
```

For Mainnet:

```
near call pool.near create_staking_pool '{"staking_pool_id": "<poolId>", "owner_id": "<accountId>", "stake_public_key": "<public key>", "reward_fee_fraction": {"numerator": 5, "denominator": 100}}' --accountId="<accountId>" --amount=30 --gas=300000000000000
```

In the example above, you need to replace:

* **Pool ID**: Staking pool name, the factory automatically adds its name to this parameter, creating {pool_id}.{staking_pool_factory}. Let's take `aurora` as an example:   
   - `aurora.factory01.littlefarm.testnet` for testnet
   - `aurora.pool.near` for mainnet
* **Owner ID**: The NEAR account that will manage the staking pool. Usually your main NEAR account.
* **Public Key**: The public key in your **validator_key.json** file.
* **5**: The fee that the pool will charge (e.g. in this case 5 over 100 is 5% of fees).
* **Account Id**: The NEAR account deploying the staking pool.


Once a new staking pool is deployed and associated now with the new node, you can start the stake migration to the new pool. To migrate stake, take a look at the [Stake and Delegation page](/validator/staking-and-delegation).

### Submit a Proposal
In order to have a validator seat, you must submit a proposal with a ping. A ping issues a new proposal and updates the staking balances for your delegators. A ping should be issued each epoch to keep reported rewards current.

Command:
```
near call <staking_pool_id> ping '{}' --accountId <accountId> --gas=300000000000000
```



>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
