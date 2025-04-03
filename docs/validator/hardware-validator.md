---
id: hardware-validator
title: Hardware Requirements for Validator Node
sidebar_label: Hardware Requirements
sidebar_position: 1
description: NEAR Validator Node Hardware Requirements
---

This page covers the minimum and recommended hardware requirements for engaging with the NEAR platform as a validator node.

# Mainnet

## Recommended Hardware Specifications {#recommended-hardware-specifications}

### Chunk/Block Producers

| Hardware       | Recommended Specifications                                   |
| -------------- |--------------------------------------------------------------|
| CPU            | x86_64 (Intel, AMD) processor with at least 8 physical cores |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI              |
| RAM            | 48GB DDR4                                                    |
| Storage        | 4TB NVMe SSD                                                 |

### Chunk validators

| Hardware       | Recommended Specifications                                   |
| -------------- |--------------------------------------------------------------|
| CPU            | x86_64 (Intel, AMD) processor with at least 8 physical cores |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI              |
| RAM            | 32GB DDR4                                                    |
| Storage        | 4TB NVMe SSD                                                 |

## Minimal Hardware Specifications {#minimal-hardware-specifications}

### Chunk/Block Producers

| Hardware       | Minimal Specifications                                       |
| -------------- |--------------------------------------------------------------|
| CPU            | x86_64 (Intel, AMD) processor with at least 8 physical cores |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI              |
| RAM            | 48GB DDR4                                                    |
| Storage        | 2.5TB NVMe SSD                                                 |

### Chunk validators

| Hardware       | Minimal Specifications                                       |
| -------------- |--------------------------------------------------------------|
| CPU            | x86_64 (Intel, AMD) processor with at least 8 physical cores |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI              |
| RAM            | 24GB DDR4                                                    |
| Storage        | 2.5TB NVMe SSD                                                 |

## Cost Estimation {#cost-estimation}

Estimated monthly costs depending on cloud provider:

| Cloud Provider | Machine Size     | Linux                   |
| -------------- |------------------|-------------------------|
| AWS            | m5a.2xlarge      | $160 CPU + $160 storage |
| GCP            | n2-standard-8    | $280 CPU + $240 storage |
| Azure          | Standard_D8s_v5  | $180 CPU + $200 storage |

# Testnet

## Recommended Hardware Specifications {#recommended-hardware-specifications}

### Chunk/Block Producers

| Hardware       | Recommended Specifications                                   |
| -------------- |--------------------------------------------------------------|
| CPU            | x86_64 (Intel, AMD) processor with at least 8 physical cores |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI              |
| RAM            | 32GB DDR4                                                    |
| Storage        | 1.5TB NVMe SSD                                               |

### Chunk validators

| Hardware       | Recommended Specifications                                   |
| -------------- |--------------------------------------------------------------|
| CPU            | x86_64 (Intel, AMD) processor with at least 8 physical cores |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI              |
| RAM            | 32GB DDR4                                                    |
| Storage        | 1TB NVMe SSD                                                 |

## Minimal Hardware Specifications {#minimal-hardware-specifications}

### Chunk/Block Producers

| Hardware       | Minimal Specifications                                       |
| -------------- |--------------------------------------------------------------|
| CPU            | x86_64 (Intel, AMD) processor with at least 8 physical cores |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI              |
| RAM            | 24GB DDR4                                                    |
| Storage        | 1.5TB NVMe SSD                                               |

### Chunk validators

| Hardware       | Minimal Specifications                                       |
| -------------- |--------------------------------------------------------------|
| CPU            | x86_64 (Intel, AMD) processor with at least 8 physical cores |
| CPU Features   | CMPXCHG16B, POPCNT, SSE4.1, SSE4.2, AVX, SHA-NI              |
| RAM            | 24GB DDR4                                                    |
| Storage        | 1.5TB NVMe SSD                                               |

## Cost Estimation {#cost-estimation}

Estimated monthly costs depending on cloud provider:

| Cloud Provider | Machine Size     | Linux                   |
| -------------- |------------------|-------------------------|
| AWS            | m5a.2xlarge      | $160 CPU + $80 storage  |
| GCP            | n2-standard-8    | $280 CPU + $120 storage |
| Azure          | Standard_D8s_v5  | $180 CPU + $100 storage |

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

>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
