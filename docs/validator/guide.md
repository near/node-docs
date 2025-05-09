---
id: validator-guide
title: Validator Onboarding Guide
sidebar_label: Validator Onboarding Guide
sidebar_position: 11
---

## Run a Node on Linux

### Recommended Hardware Specifications

Please refer to [Hardware Requirements for Validator Node](/validator/hardware-validator).

### Node installation

#### Get Build and latest update

```sh
sudo apt update && sudo apt upgrade -y && sudo apt install -y git binutils-dev libcurl4-openssl-dev zlib1g-dev libdw-dev libiberty-dev cmake gcc g++ python3 docker.io protobuf-compiler libssl-dev pkg-config clang llvm awscli tmux jq ccze rclone
```

#### Install Rust

For Rust, we use standard installation, just press "Enter" when asked for the setup.

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh && source $HOME/.cargo/env
```

#### Install NEAR CLI and NEAR-Validator

```sh
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near/near-cli-rs/releases/latest/download/near-cli-rs-installer.sh | sh &&
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near-cli-rs/near-validator-cli-rs/releases/latest/download/near-validator-installer.sh | sh &&
source $HOME/.cargo/env
```

#### Clone Nearcore repo

First get latest version available:

##### MainNet
```sh
Nearcore_Version=$(curl -s https://api.github.com/repos/near/nearcore/releases/latest | jq -r .tag_name)
```

Clone the nearcore repo, choose the latest stable branch for mainnet and build the nearcore from source:

```sh
cd ~ && git clone https://github.com/near/nearcore && cd nearcore/ && git checkout $Nearcore_Version
make release
echo 'export NEAR_ENV=mainnet' >> ~/.bashrc
source ~/.bashrc
```

##### TestNet
```sh
Nearcore_Version=$(curl -s https://api.github.com/repos/near/nearcore/releases | jq -r '[.[] | select(.prerelease == true)][0].tag_name')
```

Clone the nearcore repo, choose the latest stable branch for mainnet and build the nearcore from source:

```sh
cd ~ && git clone https://github.com/near/nearcore && cd nearcore/ && git checkout $Nearcore_Version
make release
echo 'export NEAR_ENV=testnet' >> ~/.bashrc
source ~/.bashrc
```

### Wallet creation

⚠️ **Make sure to create a wallet for correct target network (e.g MainNet)**

During the building time, let's make a wallet.

You can use any wallet supporting Near Protocol like Meteor, MyNearWallet or SenderWallet.

- [MyNearWallet](https://app.mynearwallet.com/)
- [MeteorWallet](https://meteorwallet.app/)

![wallet_creation](https://github.com/user-attachments/assets/da2685a4-11c5-455f-a5eb-9fff4d28c934)

Add at least **31 NEAR** to this wallet:
- **30 NEAR** will be used for wallet creation
- **1 NEAR** will be used for transaction fees

⚠️ This **30 NEAR** can't be recovered if you decide to stop your validator.


#### Wallet Authorization

A full access key needs to be installed locally to be able to send transactions via NEAR-CLI.

```sh
# MainNet
near login --network-id mainnet

# TestNet
near login --network-id testnet
```

**Note:** This command launches a web browser allowing for the authorization of a full access key to be copied locally.

1. Copy the link in your browser.
   
   ![login](https://github.com/user-attachments/assets/a4c14115-91d2-4a74-a2b8-781e76ada20b)

2. Grant Access to Near CLI, fill your validator address and press **Enter**.
3. Choose **"Store the access key in my keychain"** from the CLI command.

If you get an error, you can retry `near login` with **"Store the access key in my legacy keychain (compatible with the old near CLI)"**.

### Initialize & Start the Node

Time to think about your validator name.

Your validator node will finish with pool factory name, `pool.near` (MainNet) or `pool.f863973.m0` (TestNet). 

⚠️ `poolv1.near` is legacy MainNet pool factory and should be avoided.

For example:
- If you want to have a validator pool named "panda", set `panda.pool.near` for MainNet, `panda.pool.testnet` for TestNet.

#### Reminder:
- `<pool_id>` – your pool name, for example `panda`.
- `<full_pool_id>` – `xxx.pool.near`, where `xxx` is your pool_id like `panda.pool.near`.
- `<accountId>` or `accountId` – `xxx.near`, where `xxx` is your account name, for example `validator_near.near`.

```sh
# You can use any RPC provider for this command.

# MainNet
BOOT_NODES=$(curl -s -X POST https://rpc.mainnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)

cd ~/nearcore && target/release/neard init --chain-id="mainnet" --account-id=<full_pool_id> --download-genesis  --download-config validator --boot-nodes $BOOT_NODES

# TestNet
BOOT_NODES=$(curl -s -X POST https://rpc.testnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)

cd ~/nearcore && target/release/neard init --chain-id="testnet" --account-id=<full_pool_id> --download-genesis  --download-config validator --boot-nodes $BOOT_NODES
```

⚠️ Use `--home` argument if you want to change working directory from the default value of ~/.near. 

If you have trouble downloading genesis.config, they can be manually downloaded from the following links as well:
* MainNet: https://s3-us-west-1.amazonaws.com/build.nearprotocol.com/nearcore-deploy/mainnet/genesis.json
* TestNet: https://s3-us-west-1.amazonaws.com/build.nearprotocol.com/nearcore-deploy/testnet/genesis.json

Set your `<full_pool_id>`, example: `xxx.pool.near`, where `xxx` is your pool_id.

`validator_key.json` generated after the above command in `~/.near/` folder must be something like this:
```
{
  "account_id": "your_pool_id.pool.f863973.m0",
  "public_key": "blahblah_public_key",
  "secret_key": "blahblah_private_key"
}
```

The `account_id` must match the staking pool contract ID, or you will not be able to sign/verify blocks.

#### Tips before launching the node
If you want to reduce the size used by the data folder, you can run this command:

This will reduce the number of epoch stores from **5 (default) to 3**, without any issue for your node.
```sh
jq '.gc_num_epochs_to_keep = 3' ~/.near/config.json > ~/.near/config.json.tmp && mv ~/.near/config.json.tmp ~/.near/config.json
```

#### Network optimizations
To optimize the network settings for better validator performance, execute the following commands:

```sh
MaxExpectedPathBDP=8388608 && \
sudo sysctl -w net.core.rmem_max=$MaxExpectedPathBDP && \
sudo sysctl -w net.core.wmem_max=$MaxExpectedPathBDP && \
sudo sysctl -w net.ipv4.tcp_rmem="4096 87380 $MaxExpectedPathBDP" && \
sudo sysctl -w net.ipv4.tcp_wmem="4096 16384 $MaxExpectedPathBDP" && \
sudo sysctl -w net.ipv4.tcp_slow_start_after_idle=0 && \
sudo bash -c "cat > /etc/sysctl.d/local.conf" <<EOL
# Network settings for better validator performance
net.core.rmem_max = $MaxExpectedPathBDP
net.core.wmem_max = $MaxExpectedPathBDP
net.ipv4.tcp_rmem = 4096 87380 $MaxExpectedPathBDP
net.ipv4.tcp_wmem = 4096 16384 $MaxExpectedPathBDP
net.ipv4.tcp_slow_start_after_idle = 0
EOL
sudo sysctl --system
```

#### Neard Service

Let's setup Systemd so the node will always run with the system

```sh
sudo bash -c 'cat > /etc/systemd/system/neard.service << EOF
[Unit]
Description=NEARd Daemon Service

[Service]
Type=simple
User=[USER] /!_ UPDATE HERE
WorkingDirectory=[PATH TO .NEAR]/.near /!_ UPDATE HERE
ExecStart=[PATH TO NEARCORE]/nearcore/target/release/neard run /!_ UPDATE HERE
Restart=on-failure
RestartSec=30
KillSignal=SIGINT
TimeoutStopSec=45
KillMode=mixed

[Install]
WantedBy=multi-user.target
EOF
systemctl enable neard'
```

#### Syncing Data

Syncing consists of two main steps:

1. **Syncing headers** – achieved in one of three ways:
   - **[Epoch Sync](#epoch-sync)**: the recommended, decentralized approach. This solution results in the smallest database size, as the node will only contain compacted block headers.
   - **[Using a snapshot](#sync-data-with-snapshot)**: a centralized solution.
   - **Fallback**: If neither option is used, the node defaults to Header Sync, which can be extremely slow.

2. **Syncing blocks** – involves downloading the blockchain state at the start of the latest epoch and then processing the remaining blocks to fully sync with the chain. State sync, the process of downloading the state, can be done in two ways:
   - **Decentralized state sync**: the default method, which pulls data directly from peers.
   - **[Centralized state sync](#state-sync-from-external-storage)**: uses cloud-based storage as a fallback when configured in `config.json`.



##### Epoch Sync

Epoch Sync enables a node to sync from genesis without relying on snapshots.
Unlike Header Sync, it requires downloading only a small subset of past block headers rather than all of them.
To sync using Epoch Sync, update the `config.json` file with the latest boot nodes list from the NEAR network and then start the `neard` service, here is the command:

```
# MainNet 
BOOT_NODES=$(curl -s -X POST https://rpc.mainnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)

jq --arg newBootNodes $BOOT_NODES '.network.boot_nodes = $newBootNodes' ~/.near/config.json > ~/.near/config.tmp && mv ~/.near/config.json ~/.near/config.json.backup && mv ~/.near/config.tmp ~/.near/config.json

# TestNet
BOOT_NODES=$(curl -s -X POST https://rpc.testnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)

jq --arg newBootNodes $BOOT_NODES '.network.boot_nodes = $newBootNodes' ~/.near/config.json > ~/.near/config.tmp && mv ~/.near/config.json ~/.near/config.json.backup && mv ~/.near/config.tmp ~/.near/config.json
```
after that, just restart the node (sudo systemctl restart neard).

Wait for approximately 3 hours and you are done, follow the next step to become an active validator!


##### Sync data with snapshot
⚠️ **FREE SNAPSHOT SERVICE BY FASTNEAR WILL BE DEPRECATED STARTING JUNE 1ST, 2025. We strongly recommend all node operators to use epoch sync.**

To sync data fast, we can download the snapshot of recent NEAR epochs instead of waiting for node sync with other peers, this process can take a few hours (usually less than 7 hours for MainNet, 1 hour for TestNet), the expected data size will be around 100GB.

Run this to download snapshot (huge thanks FastNEAR for maintaining this):

```
# MainNet

curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/fastnear/static/refs/heads/main/down_rclone.sh | DATA_PATH=~/.near/data CHAIN_ID=mainnet RPC_TYPE=fast-rpc bash

# TestNet

curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/fastnear/static/refs/heads/main/down_rclone.sh | DATA_PATH=~/.near/data CHAIN_ID=testnet bash 

```

Once snapshot is downloaded, you can use the following commands to 'start' or 'restart' neard:

```
## Fresh start
./target/release/neard --home ~/.near run

## Restart
sudo systemctl restart neard

```



If you need to make a change to service in the config.json file, the node also need to be reloaded:

```
sudo systemctl restart neard
```

Watch logs:
```
journalctl -n 100 -f -u neard | ccze -A
```


Check the running status of the validator node. If you see something like the image above, it means the node is fully synced, and you are ready to become an active validator!

##### State sync from external storage

To configure your node to sync from external storage, follow the [link](https://github.com/near/nearcore/blob/master/docs/misc/state_sync_from_external_storage.md).
The new state sync bucket is `fast-state-parts` and it is maintained by FastNEAR.


### Becoming an active Validator
In order to become a validator and enter the validator set to help secure the network and earn rewards, a minimum set of success criteria must be met:

 - The node must be fully synced
 - The validator_key.json must be in place
 - The contract must be initialized with the public_key in validator_key.json
 - The account_id must be set to the staking pool contract id  
 - There must be enough delegations to meet the minimum seat price. See the seat price here or just run this command     

```sh
# MainNet
near-validator validators network-config mainnet next

# TestNet
near-validator validators network-config testnet next
```

- A proposal must be submitted by pinging the contract
- Once a proposal is accepted a validator must wait 2-3 epoch to enter the validator set
- Once in the validator set the validator must produce great than 90% of assigned blocks or your node will be kick out

Check the running status of the validator node. If "Validator" is showing up, your pool is selected in the current validators list.

##### Deploy your staking pool contract
NEAR uses a staking pool factory with a whitelisted staking contract to ensure delegators’ funds are safe. In order to run a validator on NEAR, a staking pool must be deployed to a NEAR account and integrated into a NEAR validator node. Delegators must use a UI or the command line to stake to the pool. A staking pool is a smart contract that is deployed to a NEAR account.

Note: STAKING POOL CONTRACT WON'T HAVE WRITE ACCESS TO ALL SUB ACCOUNTS FUNDS OR DATA, this also applies for any sub accounts on NEAR, that means your staking balance is SAFE!

##### Deploy a Staking Pool Contract

Calls the staking pool factory, creates a new staking pool with the specified name, and deploys it to the indicated accountId.

```sh

# MainNet
near contract call-function as-transaction pool.near create_staking_pool json-args '{"staking_pool_id": "<pool_id>", "owner_id": "<accountId>", "stake_public_key": "<public_key>", "reward_fee_fraction": {"numerator": 5, "denominator": 100}}' prepaid-gas '300.0 Tgas' attached-deposit '30 NEAR' sign-as <accountId> network-config mainnet sign-with-keychain

# TestNet
near contract call-function as-transaction pool.f863973.m0 create_staking_pool json-args '{"staking_pool_id": "<pool_id>", "owner_id": "<accountId>", "stake_public_key": "<public_key>", "reward_fee_fraction": {"numerator": 5, "denominator": 100}}' prepaid-gas '300.0 Tgas' attached-deposit '30 NEAR' sign-as <accountId> network-config testnet sign-with-keychain
``` 

From the example above, you need to replace:

**pool_id**: Staking pool name example "panda"  
**owner_id**: The NEAR account that will manage the staking pool. Usually your main NEAR account.  
**public_key**: The public key in your validator_key.json file.  
**5**: The fee the pool will charge (e.g. in this case 5 over 100 is 5% of fees), usually validators take 5% fee, if you set the fee so high, no one will stake to your node 😉   
**accountId**: The NEAR account deploying the staking pool.  
Be sure to have at least 30 NEAR available, it is the minimum required for storage.

Final command will look something like this:
```sh
near contract call-function as-transaction pool.near create_staking_pool json-args '{"staking_pool_id": "panda", "owner_id": "validator_near.near", "stake_public_key": "ed25519:xxx", "reward_fee_fraction": {"numerator": 5, "denominator": 100}}' prepaid-gas '300.0 Tgas' attached-deposit '30 NEAR' sign-as validator_near.near network-config mainnet sign-with-keychain
```  

To change the pool parameters, such as changing the amount of commission charged to 1% in the example below, use this command:
```sh
near contract call-function as-transaction <full_pool_id> update_reward_fee_fraction json-args '{"reward_fee_fraction": {"numerator": 1, "denominator": 100}}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' sign-as <account_id> network-config mainnet sign-with-keychain
```

Note: full_pool_id: `<pool_id>.pool.near` , it’s `panda.pool.near` in this case.

If there is a "True" at the End. Your pool is created.

Congrats! You have now configure your Staking pool up and running 🚀🚀🚀🚀


#### Manage your staking pool contract

Few useful commands you should know:

Retrieve the owner ID of the staking pool
```sh
# MainNet
near contract call-function as-read-only <full_pool_id> get_owner_id json-args {} network-config mainnet now  

# TestNet
near contract call-function as-read-only <full_pool_id> get_owner_id json-args {} network-config testnet now  
```
Issue this command to retrieve the public key the network has for your validator
```sh
# MainNet
near contract call-function as-read-only <full_pool_id> get_staking_key json-args {} network-config mainnet now

# TestNet
near contract call-function as-read-only <full_pool_id> get_staking_key json-args {} network-config testnet now  
```  
  
If the public key does not match you can update the staking key like this (replace the pubkey below with the key in your validator.json file)
```sh
# MainNet
near contract call-function as-transaction <full_pool_id> update_staking_key json-args '{"stake_public_key": "<public key>"}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' sign-as <accountId> network-config mainnet sign-with-keychain

# TestNet
near contract call-function as-transaction <full_pool_id> update_staking_key json-args '{"stake_public_key": "<public key>"}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' sign-as <accountId> network-config testnet sign-with-keychain   
```

### Working with Staking Pools

NOTE: Your validator must be fully synced before issuing a proposal or depositing funds.

#### Deposit stake to the pool
While the staking pool is created, it may not be able to join validator set yet if it does not have enough stake.

If you already have fund to start with, you can use the following command to deposit
```sh

# MainNet
near call <staking_pool_id> deposit_and_stake --deposit <amount> --use-account <accountId> --gas=300000000000000 --network-id mainnet

# TestNet
near call <staking_pool_id> deposit_and_stake --deposit <amount> --use-account <accountId> --gas=300000000000000 --network-id testnet
```

#### Proposals and Pings   
In order to get a validator seat you must first submit a proposal with an appropriate amount of stake. Proposals are sent for epoch +2. Meaning if you send a proposal now, if approved, you would get the seat in 3 epochs. You should submit a proposal every epoch to ensure your seat. To send a proposal we use the ping command. A proposal is also sent if a stake or unstake command is sent to the staking pool contract.

To note, a ping also updates the staking balances for your delegators. A ping should be issued each epoch to keep reported rewards current on the pool contract. You could set up a ping using a cron job with a ping script here.  
  
Ping are done by Metapool too, you don't need anymore to use a script ping but you can. You need at least 1 ping to be visible for the first time.

##### Ping once to make an initial proposal

You can use the following command to make an initial proposal to join the validator set
```sh

# MainNet
near call <staking_pool_id> ping '{}' --accountId <accountId> --gas=300000000000000 --network-id mainnet

# Testnet
near call <staking_pool_id> ping '{}' --accountId <accountId> --gas=300000000000000 --network-id testnet

```

Once you ping, use the following near cli command to see if your proposal is accepted:

```sh
# if you do not have near-validator installed, please refer to
# https://docs.near.org/tools/near-cli#validator-extension for installation guide. 

near-validator proposals
```

##### Cron-job to periodically ping to renew proposal

Replace `<full_pool_id>` and `<account_id>` before execution:

```sh
mkdir -p /home/root/scripts /home/root/logs && sudo bash -c 'cat > /home/root/scripts/ping.sh << EOF
#!/bin/sh
# Ping call to renew Proposal added to crontab
export NEAR_ENV=mainnet
export LOGS=/home/root/logs
export POOLID=<full_pool_id>
export ACCOUNTID=<account_id>
echo "---" >> \$LOGS/near_ping.log
date >> \$LOGS/near_ping.log
near contract call-function as-transaction \$POOLID ping json-args '\''{"stake_public_key": "<public key>"}'\'' prepaid-gas '\''100.0 Tgas'\'' attached-deposit '\''0 NEAR'\'' sign-as \$ACCOUNTID network-config mainnet sign-with-keychain >> \$LOGS/near_ping.log
EOF
chmod +x /home/root/scripts/ping.sh && (crontab -l 2>/dev/null; echo "0 */8 * * * sh /home/root/scripts/ping.sh") | crontab -'
```
  
This will ping your node every 8h

List crontab to see it is running:
```sh
crontab -l
```

Review your logs
```sh
cat $HOME/logs/near_ping.log
```

Now you only need to have enough token staked to start earning Rewards.  

### How to have Logo, Description, Contact Details on Nearscope - Near Staking

Adding pool information helps delegators and also helps with outreach for upgrades and other important announcements: [Near Pool Details](https://github.com/zavodil/near-pool-details).

The available fields to add are: [Fields Documentation](https://github.com/zavodil/near-pool-details/blob/master/FIELDS.md).

The identifying information that validators need to provide includes:
- Name
- Description
- URL
- Telegram
- Twitter

#### Example Commands

**Change validator name and description:**  
Replace `<full_pool_id>` with your pool address, e.g., `panda.poolv1.near`.  
Replace `<accountId>` with your authenticated wallet address, e.g., `validator_near.near`.

```
near contract call-function as-transaction pool-details.near update_field json-args '{"pool_id": "<full_pool_id>", "name": "name", "value": "PandaPool"}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' sign-as <accountId> network-config mainnet sign-with-keychain
```

```
near contract call-function as-transaction pool-details.near update_field json-args '{"pool_id": "<full_pool_id>", "name": "description", "value": "PandaPool Description"}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' sign-as <accountId> network-config mainnet sign-with-keychain
```

**View your validator info from CLI:**
```
near contract call-function as-read-only pool-details.near get_fields_by_pool json-args '{"pool_id":"<full_pool_id>"}' network-config mainnet now
```

**View validator info on NearScope or NearBlocks:**
The info will appear as shown on NearScope.

---

### How to Know When to Update Node Version

You can get update notifications from:
- **Discord:** [NEAR Protocol Discord](https://discord.gg/nearprotocol)
- **Telegram:** [NEAR Validators Group](https://t.me/near_validators)
- **Twitter (X):** @NEARChainStatus *(Only for Mainnet)*
- **Email Subscription:** [NEAR Update Notifications](https://near.us14.list-manage.com/subscribe?u=faedf5dec8739fb92e05b4131&id=befd133f18)

---

### How to Update Node Version

When there is a new node version, you will receive a notification on the Telegram Validator group. Run the following command to update your node:

```
cd ~/nearcore && git fetch && export NEAR_RELEASE_VERSION=<node_version> && git checkout tags/$NEAR_RELEASE_VERSION && make release && sudo systemctl stop neard && sudo systemctl start neard
```

Replace `<node_version>` with the correct NEAR core release version.

**Update Priority Codes:**
- **CODE_RED_<network_id>** – where `<network_id>` is either `MAINNET` or `TESTNET`. This represents the most dire and urgent situation. Usually it means that the network has stalled or crashed and we need validators to take immediate actions to bring the network up. Alternatively it could mean that we discovered some highly critical security vulnerabilities and a patch is needed as soon as possible. If it is about mainnet, we expect that validators will react **immediately** to such alerts, ideally within 30 minutes.
- **CODE_YELLOW_<network_id>** – where `<network_id>` is either `MAINNET` or `TESTNET`. This represents a less urgent announcement. Usually it means the release of a protocol change or a fix of a moderate security issue. In such cases, validators are not expected to take immediate actions but are still expected to **react within days**.
- **CODE_GREEN_<network_id>** – where `<network_id>` is either `MAINNET` or `TESTNET`. This usually means some general announcement that is more informational or doesn't require actions within a short period of time. It could be an announcement of a release that improves performance or a fix some minor issues.

---

### Monitor the Node Performance
- **Monitoring Tools:**  
  - [NEAR Prometheus Exporter](https://github.com/LavenderFive/near_prometheus_exporter)  
  - [NEAR Monitoring](https://github.com/LavenderFive/near-monitoring)
- **Telegram BOT Monitoring:** [Near Validator Watcher Bot](https://t.me/nearvalidatorwatcherbot)

---

### How to Withdraw Your Rewards

Log in to your wallet you created few steps before, unstake (takes 3 epochs), and withdraw.

---

### Useful Commands

**Get active epoch data (list of active validators, seat price, and performance):**
```
near-validator validators network-config mainnet now
```

**Next epoch validators list:**
```
near-validator validators network-config mainnet next
```

**View validator staked balance:**
```
near-validator staking view-stake <full_pool_id> network-config mainnet now
```

---

### Troubleshooting

#### No Peers
If you have no peers, run this script:
```  
BOOT_NODES=$(curl -s -X POST https://rpc.mainnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)
jq --arg newBootNodes $BOOT_NODES '.network.boot_nodes = $newBootNodes' ~/.near/config.json > ~/.near/config.tmp && mv ~/.near/config.json ~/.near/config.json.backup && mv ~/.near/config.tmp ~/.near/config.json
````

#### Weird Error When Running a Command

First, check that you are using the correct NEAR-CLI:
```
near --version
```
**Expected Output:** `near-cli-rs 0.XX.X`

If it returns `X.X.XX`, the NEAR CLI JS version is overshadowing the Rust version. You can either:
- Use `npx near-cli-rs` instead of `near`.
- Uninstall `near-cli` with: `npm remove near-cli`.

#### How to Get Metrics from My Node
Check metrics with:
```
curl -s http://localhost:3030/metrics
```
**Content Type:** `application/json`

#### Warning Messages
Warning messages can be ignored unless they indicate critical issues.

#### Get Latest Config.json
Find the latest `config.json` here:
```
https://s3-us-west-1.amazonaws.com/build.nearprotocol.com/nearcore-deploy/mainnet/validator/config.json
```

#### Always Kicked Issue
Ensure your config file has `store.load_mem_tries_for_tracked_shards` set to `true`.

---

### Useful Links
- **NEAR Chain Status Twitter:** @NEARChainStatus
- **NEAR Staking:** [Near Staking Website](https://near-staking.com/)
- **NEARBlocks Node Explorer:** [NearBlocks](https://nearblocks.io/node-explorer)
- **NearScope:** [NearScope](https://nearscope.net/)

---

### Support
- **Telegram:** [NEAR Validators](https://t.me/near_validators)
- **Discord:** [NEAR Protocol Discord](https://discord.gg/nearprotocol)

