---
id: running-a-node-windows
title: Run a Node on Windows
sidebar_label: Run a Node (Windows)
sidebar_position: 6
description: How to run a NEAR node on Windows
---

*If this is the first time for you to setup a validator node, head to our [Validator Bootcamp 🚀](/validator/validator-bootcamp). Please head to [Run a node](/rpc/run-rpc-node) for instructions on how to setup a RPC node with neard.*

This doc is written for developers, sysadmins, DevOps, or curious people who want to know how to run a NEAR node on Windows.


<blockquote class="warning">
<strong>Heads up</strong><br /><br />
This documentation may require additional edits. Please keep this in mind while running the following commands.
</blockquote>


1.  If Windows Subsystem for Linux is not enabled, open PowerShell as administrator and run:
    ```sh
    Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
    ```
    Then restart your computer.
2. Go to your Microsoft Store and look for Ubuntu; this is the Ubuntu Terminal instance. Install and launch it.
3. Now you might be asked for username and password, do not use admin as username.
4. Your Ubuntu Instance need initial before next steps
    ```sh
    sudo apt-get update
    sudo apt-get upgrade
    sudo apt-get install build-essential pkg-config libssl-dev
    ```
5. You need to install OpenSSL, which you will need to run the node. To download OpenSSL, please run the following commands in the Ubuntu Terminal:
    ```sh
    cd /tmp
    wget https://www.openssl.org/source/openssl-1.1.1.tar.gz
    tar xvf openssl-1.1.1.tar.gz
    ```
6. After it finished downloading OpenSSL, run the following commands to install:
    ```sh
    cd openssl-1.1.1
    sudo ./config -Wl,--enable-new-dtags,-rpath,'$(LIBRPATH)'
    sudo make
    sudo make install
    ```
    The files will be under the following directory: /usr/local/ssl.
7. Once this is finished, you have to ensure that Ubuntu is going to use the right version of OpenSSL. Now update the path for man pages and binaries. Run the following command:
    ```sh
    cd ../..
    sudo nano /etc/manpath.config
    ```
8. A text file will open, add the following line:
    ```sh
    MANPATH_MAP     /usr/local/ssl/bin      /usr/local/ssl/man
    ```
    Once this is done press ctrl + o . It will ask you to save the file, just press enter. Now press ctrl + x to exit.
9. To make sure that OpenSSL is installed run:
    ```sh
    openssl version -v
    ```
    This should show you the installed version. More info on this can be found here. (https://manpages.ubuntu.com/manpages/bionic/man1/version.1ssl.html)
10. Now you have to run the following commands to install all nessesary software and dependencies:
    ```sh
    sudo apt-get update
    sudo apt-get upgrade
    sudo apt-get install -y git jq binutils-dev libcurl4-openssl-dev zlib1g-dev libdw-dev libiberty-dev cmake gcc g++ protobuf-compiler python3 python3-pip llvm clang
    ```
    Install Rustup
    ```sh
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source $HOME/.cargo/env
    rustup default nightly
    ```
    Great! All set to get the node up and running!
11. Clone the github nearcore

    First we need to check a version which is currently working in `testnet`:
    ```sh
    curl -s https://rpc.testnet.near.org/status | jq .version
    ```
    You'll get something like this: "1.13.0-rc.2". "1.13.0" is a branch which we need to clone to build our node for `testnet`.

    ```sh
    git clone --branch 1.13.0 https://github.com/near/nearcore.git
    ```
12. This created a nearcore directory, change into that one and build a node:
    ```sh
    cd nearcore
    make neard
    ```
13. Initialize the working directory and run the node:
    ```sh
    ./target/release/neard --home ~/.near init --chain-id testnet --download-genesis --download-config rpc
    ./target/release/neard --home ~/.near run
    ```

    For detailed instructions on initializing and running the node (including mainnet), see [Run a Validator Node](/validator/compile-and-run-a-node).

To run this node as a validator, you must configure your validator keys in the `--home` directory (for example by placing `validator_key.json` there) and follow the steps in the [Validator Bootcamp](/validator/validator-bootcamp).

>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
