---
id: hardware-archival
title: Hardware Requirements for Archival Split-Storage Node
sidebar_label: Hardware Requirements
sidebar_position: 1
description: NEAR Archival Node Hardware Requirements
---

This page covers the minimum and recommended hardware requirements for engaging with the NEAR platform as an Archival node.

# Mainnet

## Recommended Hardware Specifications {#recommended-hardware-specifications}

| Hardware       | Recommended Specifications                                      |
| -------------- |-----------------------------------------------------------------|
| CPU            | 8-Core (16-Thread) Intel i7/Xeon or equivalent with AVX support |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI                 |
| RAM            | 32GB DDR4                                                       |
| Hot Storage    | 3 Terabyte SSD                                                  |
| Cold Storage   | 90 Terabyte  NON-SSD Persistent Disks                           |

## Minimal Hardware Specifications {#minimal-hardware-specifications}

| Hardware       | Minimal Specifications                                          |
| -------------- |-----------------------------------------------------------------|
| CPU            | 8-Core (16-Thread) Intel i7/Xeon or equivalent with AVX support |
| RAM            | 24GB DDR4                                                       |
| Hot Storage    | 3 Terabyte SSD                                                  |
| Cold Storage   | 85 Terabyte NON-SSD Persistent Disks                            |

## Cost Estimation {#cost-estimation}

Estimated monthly costs depending on cloud provider:

| Cloud Provider | Machine Size    | Linux                      |
| -------------- | --------------- |----------------------------|
| AWS            | m5a.4xlarge     | $300 CPU + $1200 storage † |
| GCP            | n2d-standard-16 | $400 CPU + $2100 storage † |
| Azure          | Standard_d16-v3 | $334 CPU + $400 storage †  |

_( † ) The storage cost will grow overtime as an archival node stores more data from the growing NEAR blockchain._

# Testnet

## Recommended Hardware Specifications {#recommended-hardware-specifications-testnet}

| Hardware       | Recommended Specifications                                      |
| -------------- |-----------------------------------------------------------------|
| CPU            | 8-Core (16-Thread) Intel i7/Xeon or equivalent with AVX support |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI                 |
| RAM            | 24GB DDR4                                                       |
| Hot Storage    | 1.5 Terabyte SSD                                                  |
| Cold Storage   | 15 Terabyte NON-SSD Persistent Disks                            |

## Minimal Hardware Specifications {#minimal-hardware-specifications-testnet}

| Hardware       | Minimal Specifications                                          |
| -------------- |-----------------------------------------------------------------|
| CPU            | 8-Core (16-Thread) Intel i7/Xeon or equivalent with AVX support |
| RAM            | 16GB DDR4                                                       |
| Hot Storage    | 1 Terabyte SSD                                                  |
| Cold Storage   | 15 Terabyte NON-SSD Persistent Disks                            |

## Cost Estimation {#cost-estimation-testnet}

Estimated monthly costs depending on cloud provider:

| Cloud Provider | Machine Size    | Linux                     |
| -------------- | --------------- |---------------------------|
| AWS            | m5a.2xlarge     | $160 CPU + $350 storage † |
| GCP            | n2-standard-8   | $280 CPU + $600 storage † |
| Azure          | Standard_D8s_v5 | $180 CPU + $150 storage † |

_( † ) The storage cost will grow overtime as an archival node stores more data from the growing NEAR blockchain._

<blockquote class="info">
<strong>Resources for Cost Estimation</strong><br /><br />

All prices reflect *reserved instances* which offer deep discounts on all platforms with a 1-year commitment.
We cannot guarantee the prices mentioned above as they may change at any moment.

- AWS
  - cpu: https://aws.amazon.com/ec2/pricing/reserved-instances/pricing
  - storage: https://aws.amazon.com/ebs/pricing
- GCP
  - cpu: https://cloud.google.com/compute/vm-instance-pricing
  - storage: https://cloud.google.com/compute/disks-image-pricing
- Azure — https://azure.microsoft.com/en-us/pricing/calculator

</blockquote>

> Got a question?
> <a href="https://stackoverflow.com/questions/tagged/nearprotocol"> > <h8>Ask it on StackOverflow!</h8></a>
