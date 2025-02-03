
## Run a Node on Linux

### Recommended Hardware Specifications

CPU	x86_64 (Intel, AMD) processor with at least 8 physical cores
CPU Features: 	CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI
RAM:	16GB DDR4
Storage:	2TB NVMe SSD
1Gb networkbandwidth.
Distribution: Ubuntu 22.04


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

```
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near/near-cli-rs/releases/latest/download/near-cli-rs-installer.sh | sh &&
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near-cli-rs/near-validator-cli-rs/releases/latest/download/near-validator-installer.sh | sh && 
source $HOME/.cargo/env 
```

#### Clone Nearcore repo 

First get lastest version available :
```
Nearcore_Version=$(curl -s https://api.github.com/repos/near/nearcore/releases/latest | jq -r .tag_name)
```

Clone the nearcore repo, choose the latest stable branch for mainnet and build the nearcore from source
```
cd ~ && git clone https://github.com/near/nearcore && cd nearcore/ && git checkout $Nearcore_Version
make release
echo 'export NEAR_ENV=mainnet' >> ~/.bashrc
source ~/.bashrc
```

During the building time, let's make a wallet.

We recommand to use a partner wallet like Meteor, MyNearWallet or SenderWallet.  

https://app.mynearwallet.com/  

https://wallet.meteorwallet.app/

![](file:///C:/Users/ddealmeida/Downloads/wallet_creation.png)  
  
Add at least 31 NEAR to this wallet.  
30 Near will be used for the wallet creation  
1 Near will be use for the fees of transactions  
  
/!\ This 30 Near can't be recovered if you decided to stop your validator.


When this wallet is created and build is done, follow this step:  
  
#### Wallet Authorization  

A full access key needs to be installed locally to be able transactions via NEAR-CLI.
```
near login 
```

``Note: This command launches a web browser allowing for the authorization of a full access key to be copied locally.``

1 – Copy the link in your browser
![](file:///C:/Users/ddealmeida/Downloads/login.png)

2 – Grant Access to Near CLI, fill your validator address and press Enter


3 - Choose “Store the access key in my keychain” from the CLI command.  
  
If you got error, you can retry near login with “Store the access key in my legacy keychain (compatible with the old near CLI)”


#### Initialize & Start the Node  
  
Time to think about your validator name.  
  
Your validator node will finish with a poolv1.near  
Example, i want to have a validator pool named "panda", i will set panda.poolv1.near  
Or i want to have a name "validator_near", my full poolname  will be validator_near.poolv1.near


Reminder:

<pool_id> – your pool name, for example panda  
<full_pool_id> – xxx.poolv1.near, where xxx is your pool_id like panda.poolv1.near  
<accountId> or accountId – xxx.near where xxx your account name, for example validator_near.near

```
cd ~/nearcore && target/release/neard init --chain-id="mainnet" --account-id=<full_pool_id>
```

Set your <full_pool_id>, example: xxx.poolv1.near, where xxx is your pool_id



validator_key.json generated after the above command in ~/.near/ folder must be something like this:



The account_id must match the staking pool contract id  or you will not be able to sign/verify blocks.


Tips before launching the node, if you want to reduce the size used by the data folder.  
You can run this command :  
  
This will reduce the number of epoch store from 5 (default) to 3, without any issue for your node.
```
jq '.gc_num_epochs_to_keep = 3' ~/.near/config.json > ~/.near/config.json.tmp && mv ~/.near/config.json.tmp ~/.near/config.json
```


#### Neard Service

Let's setup Systemd so the node will always run with the system

```
sudo bash -c 'cat > /etc/systemd/system/neard.service << EOF
[Unit]
Description=NEARd Daemon Service

[Service]
Type=simple
User=root
WorkingDirectory=/root/.near
ExecStart=/root/nearcore/target/release/neard run
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
##### Using NEAR Peer-to-peers state sync

NEAR has decentralized state sync, a torrent like protocol for nodes to sync data with each others without relies on snapshot providers, to sync with p2p state sync, you would need to get the latest boot nodes list from the NEAR network and update to config.json file and then start the neard service, here is the command:

```
curl -s -X POST https://rpc.mainnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | \
jq --arg newBootNodes "$(curl -s -X POST https://rpc.mainnet.near.org -H "Content-Type: application/json" -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | jq -r '.result.active_peers as $list1 | .result.known_producers as $list2 |
          $list1[] as $active_peer | $list2[] |
          select(.peer_id == $active_peer.id) |
          "\(.peer_id)@\($active_peer.addr)"' | paste -sd "," -)" \
   '.network.boot_nodes = $newBootNodes' ~/.near/config.json > ~/.near/config.tmp && mv ~/.near/config.json ~/.near/config.json.backup && mv ~/.near/config.tmp ~/.near/config.json
```
after that, just restart the node ( sudo systemctl restart neard) and you will see something like this:

p2pstate-sync

Wait for sometime (maybe 10 hours) and you are done, follow the next step to become an active validator!

 

##### Sync data with snapshot:

To sync data faster, we can download the snapshot of recent NEAR epochs instead of waiting for node sync with other peers, this process will take a few hours, the expected data size will be around 580GB.

Run this to download snapshot and start the node (huge thanks FastNEAR for maintaining this):

```
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/fastnear/static/refs/heads/main/down_rclone.sh | DATA_PATH=~/.near/data CHAIN_ID=mainnet RPC_TYPE=fast-rpc bash && sudo systemctl restart neard
```
The command will sync data and restart the neard!

If you need to make a change to service in the config.json file, the node also need to be reloaded:

```
sudo systemctl restart neard
```

Watch logs:
```
journalctl -n 100 -f -u neard | ccze -A
```

Image

Check the running status of the validator node. If you see something like the image above, it means the node is fully synced, and you are ready to become an active validator!

#### Becoming an active Validator
In order to become a validator and enter the validator set to help secure the network and earn rewards, a minimum set of success criteria must be met:

 - The node must be fully synced
 - The validator_key.json must be in place
 - The contract must be initialized with the public_key in validator_key.json
 - The account_id must be set to the staking pool contract id  
 - There must be enough delegations to meet the minimum seat price. See the seat price here or just run this command     
```
near-validator validators network-config mainnet next
 ```
- A proposal must be submitted by pinging the contract
- Once a proposal is accepted a validator must wait 2-3 epoch to enter the validator set
- Once in the validator set the validator must produce great than 90% of assigned blocks or your node will be kick out

Check the running status of the validator node. If “Validator” is showing up, your pool is selected in the current validators list.

##### Deploy your staking pool contract
NEAR uses a staking pool factory with a whitelisted staking contract to ensure delegators’ funds are safe. In order to run a validator on NEAR, a staking pool must be deployed to a NEAR account and integrated into a NEAR validator node. Delegators must use a UI or the command line to stake to the pool. A staking pool is a smart contract that is deployed to a NEAR account.

Note: STAKING POOL CONTRACT WONT HAVE WRITE ACCESS TO ALL SUB ACCOUNTS FUNDS OR DATA, this also applies for any sub accounts on NEAR, that means your staking balance is SAFU!

##### Deploy a Staking Pool Contract

Calls the staking pool factory, creates a new staking pool with the specified name, and deploys it to the indicated accountId.

``` 
near contract call-function as-transaction poolv1.near create_staking_pool json-args '{"staking_pool_id": "<pool_id>", "owner_id": "<accountId>", "stake_public_key": "<public_key>", "reward_fee_fraction": {"numerator": 5, "denominator": 100}}' prepaid-gas '100.0 Tgas' attached-deposit '30 NEAR' sign-as <accountId> network-config mainnet sign-with-keychain
``` 
From the example above, you need to replace:

**pool_id**: Staking pool name example “panda”  
**owner_id**: The NEAR account that will manage the staking pool. Usually your main NEAR account.  
**public_key**: The public key in your validator_key.json file.  
**5**: The fee the pool will charge (e.g. in this case 5 over 100 is 5% of fees), usually validators take 5% fee, if you set the fee so high, no one will stake to your node 😉   
**accountId**: The NEAR account deploying the staking pool.  
Be sure to have at least 30 NEAR available, it is the minimum required for storage.

Final command will look something like this:
```
near contract call-function as-transaction poolv1.near create_staking_pool json-args '{"staking_pool_id": "panda", "owner_id": "validator_near.near", "stake_public_key": "ed25519:xxx", "reward_fee_fraction": {"numerator": 5, "denominator": 100}}' prepaid-gas '100.0 Tgas' attached-deposit '30 NEAR' sign-as validator_near.near network-config mainnet sign-with-keychain
```  

To change the pool parameters, such as changing the amount of commission charged to 1% in the example below, use this command:
```
near contract call-function as-transaction <full_pool_id> update_reward_fee_fraction json-args '{"reward_fee_fraction": {"numerator": 1, "denominator": 100}}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' sign-as <account_id> network-config mainnet sign-with-keychain
```
Note: full_pool_id: <pool_id>.poolv1.near , it’s panda.poolv1.near in this case

You will see something like this:

img
If there is a “True” at the End. Your pool is created.

Congrats! You have now configure your Staking pool up and running 🚀🚀🚀🚀

#### Manage your staking pool contract
Few useful commands you should know:

Retrieve the owner ID of the staking pool
```
near contract call-function as-read-only <full_pool_id> get_owner_id json-args {} network-config mainnet now  
```
Issue this command to retrieve the public key the network has for your validator
```
near contract call-function as-read-only <full_pool_id> get_staking_key json-args {} network-config mainnet now  
```  
  
  
If the public key does not match you can update the staking key like this (replace the pubkey below with the key in your validator.json file)
```
near contract call-function as-transaction <full_pool_id> update_staking_key json-args '{"stake_public_key": "<public key>"}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' sign-as <accountId> network-config mainnet sign-with-keychain  
```
Working with Staking Pools
NOTE: Your validator must be fully synced before issuing a proposal or depositing funds.

#### Proposals and Pings   
In order to get a validator seat you must first submit a proposal with an appropriate amount of stake. Proposals are sent for epoch +2. Meaning if you send a proposal now, if approved, you would get the seat in 3 epochs. You should submit a proposal every epoch to ensure your seat. To send a proposal we use the ping command. A proposal is also sent if a stake or unstake command is sent to the staking pool contract.

To note, a ping also updates the staking balances for your delegators. A ping should be issued each epoch to keep reported rewards current on the pool contract. You could set up a ping using a cron job with a ping script here.  
  
Ping are done by Metapool too, you don't need anymore to use a script ping but you can. You need at least 1 ping to be visible for the first time.


Replace <full_pool_id> and <account_id> before execution:

```
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
This will ping you node every 8h

List crontab to see it is running:
```
crontab -l
```

Review your logs
```
cat $HOME/logs/near_ping.log
```

Now you only need to have enough token staked to start earning Rewards.  


#### Network optimizations
To optimize the network settings for better validator performance, execute the following commands:

```
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

#### How to have Logo, description, contact details on Nearscope - Near Staking
Adding pool information helps delegators and also helps with outreach for upgrades and other important announcements: https://github.com/zavodil/near-pool-details.

The available fields to add are: https://github.com/zavodil/near-pool-details/blob/master/FIELDS.md.

The identifying information that validators need to provide are: name, description, url, telegram, twitter…

Example commands:

Change validator name and description: 

Replace <full_pool_id> with your pool address, for example: panda.poolv1.near
Replace <accountId> with your authenticated wallet address, validator_near.near for this case
near contract call-function as-transaction pool-details.near update_field json-args '{"pool_id": "<full_pool_id>", "name": "name", "value": "PandaPool"}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' sign-as <accountId> network-config mainnet sign-with-keychain
near contract call-function as-transaction pool-details.near update_field json-args '{"pool_id": "<full_pool_id>", "name": "description", "value": "PandaPool Description"}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' sign-as <accountId> network-config mainnet sign-with-keychain
View your validator infos from CLI:

near contract call-function as-read-only pool-details.near get_fields_by_pool json-args '{"pool_id":"<full_pool_id>"}' network-config mainnet now
 

View validator infos on NEARScope or NEARBlocks:

The info will show like this: (source: NearScope)
Pasted image 20240929194648.png

#### How to update new node version
When there is a new node version, you will get a notification on the Telegram Validator group, run this command to update the node.  
  
[CODE_RED_<network_id>] where <network_id> is either MAINNET or TESTNET. This represents the most dire and urgent situation. Usually it means that the network has stalled or crashed and we need validators to take immediate actions to bring the network up. Alternatively it could mean that we discovered some highly critical security vulnerabilities and a patch is needed as soon as possible. If it is about mainnet, we expect that validators will react immediately to such alerts, ideally within 30 minutes.

[CODE_YELLOW_<network_id>] where <network_id> is either MAINNET or TESTNET. This represents a less urgent announcement. Usually it means the release of a protocol change or a fix of a moderate security issue. In such cases, validators are not expected to take immediate actions but are still expected to react within days.

[CODE_GREEN_<network_id>] where <network_id> is either MAINNET or TESTNET. This usually means some general announcement that is more informational or doesn’t require actions within a short period of time. It could be an announcement of a release that improves performance or a fix some minor issues.


```
cd ~/nearcore && git fetch && export NEAR_RELEASE_VERSION=<node_version> && git checkout $NEAR_RELEASE_VERSION && make release && sudo systemctl stop neard && sudo systemctl start neard
```
Replace <node_version> with the correct nearcore release version.

#### Monitor the node performance
Take a look at : https://github.com/LavenderFive/near_prometheus_exporter and https://github.com/LavenderFive/near-monitoring

#### Monitor the node (Telegram BOT)):
Take a look here: https://t.me/nearvalidatorwatcherbot

#### How to withdraw your rewards  
Logged on a wallet with the wallet you created few steps  before, unstake (take 3epoch) and withdraw.

#### Useful commands
Get active epoch data like : list of active validators and the current seat price, their current performance: near-validator validators network-config mainnet now
Next epoch validators list: near-validator validators network-config mainnet next
View validator staked balance: near-validator staking view-stake <full_pool_id> network-config mainnet now
  
#### Troubleshoot
  
##### No peers
If you don't have any peers, run this script:  
```  
neard  `curl -X POST https://rpc.mainnet.near.org \  -H "Content-Type: application/json" \
  -d '{
        "jsonrpc": "2.0",
        "method": "network_info",
        "params": [],
        "id": "dontcare"
      }' | \
jq '.result.active_peers as $list1 | .result.known_producers as $list2 |
$list1[] as $active_peer | $list2[] |
select(.peer_id == $active_peer.id) |
"\(.peer_id)@\($active_peer.addr)"' |\
awk 'NR>2 {print ","} length($0) {print p} {p=$0}' ORS="" | sed 's/"//g'`
````  
  
##### Warn message  
  
Warn message can be ignored. You don't really need to worry about it.  
  
##### Always kicked  
  
Make sure the config file have store.load_mem_tries_for_tracked_shards  with true value

#### Usefull links: 
NEAR Chain Status Twitter: https://x.com/NEARChainStatus   

https://near-staking.com/
https://nearblocks.io/node-explorer
https://nearscope.net/  
  
####  Support:
Telegram: https://t.me/near_validators  
Discord: https://discord.gg/nearprotocol
