---
id: exposing-validators-metrics-to-pagoda
title: Exposing Validators' Metrics to Pagoda
sidebar_label: Exposing Validators' Metrics to Pagoda
sidebar_position: 8
---

## Exposing Validator Metrics[^1]

The following instructions are applicable for mainnet validator nodes. 

> Note: We take security seriously, so we put a lot of effort into doing things right on this front. Also, as we appreciate your eventual concerns, we are happy to disclose architecture on our end, so you can put your mind at ease.

### How are we going to use the data?

The collected data will be used to monitor the health and performance of the network in general. We will use the data to look into performance of low-level details of running details, both in aggregate and of individual nodes.

However, note that we are not planning to investigate performance issues or missing blocks of individual nodes. We are only interested in the issues affecting the chain in general.

### Prerequisites
- *Linux* node [running validator](https://near-nodes.io/validator/compile-and-run-a-node#mainnet)
- Up to date distribution
- Root access to box (to configure firewall)
- Public IPv4 address

If you haven't done it yet, please [install jq](https://stedolan.github.io/jq/download/).

Debian based systems
```shell
sudo apt install jq
```

[Redhat/Centos](https://www.cyberithub.com/how-to-install-jq-json-processor-on-rhel-centos-7-8/)
```shell
sudo yum install jq -y
```

### 1. Configure firewall

We kindly asking you to expose port 3030 to our scrapper, which is running from following addresses:

- **35.204.219.60**
- **34.90.9.220**

It's highly recommended to deny traffic from other sources.
Based on your current setup, you can follow step for iptables or nftables configuration.
Please don't forget to make this change persistent, though particular steps are not in scope of this short document.

#### 1.1 iptables

```shell
# Define chain to allow particular source addresses
iptables -N trusted-pagoda-scrappers
iptables -A trusted-pagoda-scrappers -s 35.204.219.60 -j ACCEPT
iptables -A trusted-pagoda-scrappers -s 34.90.9.220 -j ACCEPT
iptables -A trusted-pagoda-scrappers -j DROP

# Accept incoming packets for neard only from trusted sources
iptables -A INPUT ! -i lo -p tcp --dport 3030 -j trusted-pagoda-scrappers
```


#### 1.2 nftables

```shell
# Define chain to allow particular source addresses
nft 'add chain ip filter trusted-pagoda-scrappers'
nft 'add rule ip filter trusted-pagoda-scrappers ip saddr 35.204.219.60 accept'
nft 'add rule ip filter trusted-pagoda-scrappers ip saddr 34.90.9.220 accept'
nft 'add rule ip filter trusted-pagoda-scrappers drop'

# Accept incoming packets for neard only from trusted sources
nft 'add rule ip filter INPUT iifname != "lo" tcp dport 3030 jump trusted-pagoda-scrappers'
```


### 2. Configure neard 

Rpc needs to listen on port **3030**, and we also like the debug page to be enabled.

```shell
T=$(mktemp) &&\
jq '.rpc.addr = "0.0.0.0:3030" | .rpc.enable_debug_rpc = true' \
~/.near/config.json > $T &&\
cat $T > ~/.near/config.json && rm $T
```

If you don't have `jq`, you can always edit configuration file manually


### 3. Restart neard

Perhaps you have systemd unit, then simply do
```shell
sudo systemctl restart neard
```

If you started neard manually, you can use something like following (assuming bash)
```bash
PID=$(pgrep neard)
WORKDIR=$(readlink "/proc/$PID/cwd")
mapfile -d '' -t COMMAND < "/proc/${PID}/cmdline"
kill $PID && cd "$WORKDIR" && eval "${COMMAND[@]}"
```

### 4. DNAT

If your validator is not running on public IP, please configure DNAT to forward port 3030.

### 5. Share you public IP with us

TBD


### 6. Enjoy aggregated metrics

TBD


### 7. Can I volunteer to have my metrics scraped?

Yes, ping us using TBD method and follow the same instructions in this doc.


## Overall architecture

As promised, here's a description of the network layout at our end, including some security measures.

![](/images/network_layout.svg)

First of all, there's a dedicated GCP project. That's where we have created VPC with a private subnet, and the instance running Prometheus scraper.
This instance is based on Ubuntu 22.04.LTS and is kept up to date, including all security updates.
On top of that, it is running in a very restricted environment. The firewall grants only egress HTTP to port 3030 on your end and denies all other incoming traffic. 
The only exception is the ssh port for maintenance. That is, however, allowed only through the GCP IAP tunnel.
To allow populating the Grafana dashboard, we also allowed HTTPS egress to a specific Grafana host.

On the Grafana side, all metrics are anonymized, the Dashboard is read-only, and it's accessible only to Authorized Users. Therefore there is no way to de-anonymise data and use them for anything nasty.

[^1]: This document has [published version](https://pagodaplatform.atlassian.net/wiki/spaces/DOCS/pages/149979169/Exposing+validators+metrics+to+Pagoda) which lives by its own life now.
