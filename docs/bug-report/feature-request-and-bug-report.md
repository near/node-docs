---
id: feature-request-and-bug-report
title: Issue Reporting Guide
sidebar_label: Issue Reporting Guide
description: How to report bugs and request features for NEAR nodes
---

# Issue Reporting Guide

This guide provides a structured approach to reporting issues and requesting features for NEAR nodes. Following these steps helps ensure your reports are processed efficiently and receive appropriate attention.

## Before You Report

### 1. Check Existing Issues

Before creating a new report, search for similar issues:

- **GitHub Issues**: Check the [nearcore repository](https://github.com/near/nearcore/issues) for existing bug reports or feature requests
- **Documentation**: Review the [troubleshooting guide](../troubleshooting/common-errors.md) for common solutions
- **Community Channels**: Search through community discussions for similar problems

### 2. Try Community Support

For immediate help, try these channels in order:

1. **Telegram**: Join the [@near_validators](https://t.me/near_validators) chat for fast community support
2. **Zulip**: Visit the [community support channel](https://near.zulipchat.com/#narrow/channel/469556-community-support)

## How to Report Issues

### Bug Reports

For node operation issues, follow this process:

#### Step 1: Gather Information
Before reporting, collect the following:

- **Node version**: `near --version`
- **Operating system**: OS type and version
- **Hardware specs**: CPU, RAM, storage details
- **Network**: Mainnet, testnet, or localnet
- **Node type**: Validator, RPC, archival, indexer
- **Configuration**: Relevant config files (remove sensitive data)
- **Debug Information**: See next section.

#### Step 2: Collect Debug Information
To enable effective troubleshooting, gather comprehensive system diagnostics:
The commands below will compile system data, logs, and configuration files into a designated directory. This diagnostic package can be provided to the NEAR team to facilitate faster issue identification and resolution.


**Setup Debug Collection:**

These are a couple of variables to make the command execution easier.
```bash
# Set your paths
DEBUG_INFO=<path to the folder where all the debug files will be dumped>
NEAR_HOME=<path to your neard home directory, typically ~/.near>
NEARD_BIN_PATH=<path to your neard binary>
NEARD="$NEARD_BIN_PATH --home $NEAR_HOME"

# Create debug folder
mkdir -p $DEBUG_INFO
```

**Configuration Files:**
```bash
# Copy configuration
cp $NEAR_HOME/config.json $DEBUG_INFO/config.json

# Get running configuration (requires debug RPC enabled)
# Set rpc.enable_debug_rpc = true in config.json first
curl -s "http://localhost:3030/debug/client_config" > $DEBUG_INFO/running_config.json
```

**Enhanced Logging:**
Enable detailed logging by modifying `log_config.json` in $NEAR_HOME
```bash
cat > $NEAR_HOME/log_config.json << EOF
{
    "opentelemetry": "info",
    "rust_log": "debug",
    "verbose_module": null
}
EOF

# If neard is running, signal it to pick up new log config
sudo kill -s SIGHUP $(pidof neard)

# Collect relevant logs around the time the issue occurred.
```

**Database Information:**
```bash
# Node version and database state
$NEARD -V > $DEBUG_INFO/neard_version.txt

# Database column scan (works for any node type)
$NEARD view-state scan-db-column --column BlockMisc > $DEBUG_INFO/neard_view-state_scan-db-column_BlockMisc.txt

# For archival nodes
$NEARD cold-store head > $DEBUG_INFO/neard_cold-store_head.txt
```

**Metrics Collection:**

Query the `neard` binary for metrics. The following script will help you automate this by sending a request every 10 seconds. 

Save this as `collect_metrics.sh` and execute `./collect_metrics.sh -e http://localhost:3030/metrics -o $DEBUG_INFO -n 6` while the node is running.
```bash
#!/bin/bash

# Default values
ENDPOINT="http://localhost:3030/metrics"
OUTDIR=$(mktemp -d -t metrics_XXXX)
NUM_SAMPLES=-1

usage() {
  echo "Usage: $0 [-e endpoint] [-o outputdir] [-n number_of_samples]"
  echo "  -e  Metrics endpoint (default: http://localhost:3030/metrics)"
  echo "  -o  Output directory (default: temp directory)"
  echo "  -n  Number of samples to collect (default: infinite)"
}

# Parse options
while getopts "e:o:n:h" opt; do
  case $opt in
    e) ENDPOINT="$OPTARG" ;;
    o) OUTDIR="$OPTARG/metrics" ;;
    n) NUM_SAMPLES="$OPTARG" ;;
    h) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done

mkdir -p "$OUTDIR"
echo "Output directory: $OUTDIR"

collect() {
  TIMESTAMP=$(date -u +"%Y%m%d_%H%M%S_UTC")
  curl -s "$ENDPOINT" > "$OUTDIR/metrics_$TIMESTAMP.txt"
}

COUNT=0
while [[ $NUM_SAMPLES -lt 0 || $COUNT -lt $NUM_SAMPLES ]]; do
  collect
  ((COUNT++))
  echo "Samples collection, iteration #$COUNT."
  if [[ $NUM_SAMPLES -lt 0 || $COUNT -lt $NUM_SAMPLES ]]; then
    echo -n " Waiting 10s..."
    sleep 10
  fi
done
```

Collecting multiple samples provides better insight into node behavior, but for a quick snapshot, use this single command:
```bash
# Single metrics snapshot
curl -s "http://localhost:3030/metrics" > $DEBUG_INFO/metrics_$(date -u +"%Y%m%d_%H%M%S_UTC").txt
```

**Archive and Submit:**
```bash
# Create compressed archive
zip -r -9 debug_info.zip $DEBUG_INFO
```

#### Step 4: GitHub Issue
Create the **[GitHub issue](https://github.com/near/nearcore/issues)** and attach the relevant data.

### Feature Requests

For new features or enhancements:

#### Step 1: Create GitHub Issue
Submit your feature request at:
**[https://github.com/near/nearcore/issues](https://github.com/near/nearcore/issues)**

#### Step 2: Provide Details
Include the following information:

- **Problem description**: What problem does this feature solve?
- **Proposed solution**: How should the feature work?
- **Use case**: Who would benefit from this feature?
- **Priority**: Why is this important for the community?

#### Step 3: Review Process
Your request will be:
- Reviewed by the NEAR team
- Prioritized based on community impact and development resources

## Getting Help

<blockquote class="info">
<strong>Quick Help</strong><br /><br />
For immediate assistance, try the community channels first. The <a href="https://t.me/near_validators">@near_validators</a> Telegram chat is particularly active and helpful for node operation issues.
</blockquote>

### Community Resources
- **Telegram**: [@near_validators](https://t.me/near_validators) - Fast community support
- **Zulip**: [Community support channel](https://near.zulipchat.com/#narrow/channel/469556-community-support)
- **GitHub**: [nearcore issues](https://github.com/near/nearcore/issues)


## Best Practices

### Do's
- ✅ Search for existing issues before creating new ones
- ✅ Provide detailed, reproducible steps
- ✅ Include relevant logs and configuration
- ✅ Use clear, descriptive titles
- ✅ Be patient - the team reviews all submissions

### Don'ts
- ❌ Report the same issue multiple times
- ❌ Include sensitive information (private keys, passwords)
- ❌ Submit vague or incomplete reports
- ❌ Expect immediate responses for non-critical issues

---

<blockquote class="tip">
<strong>Tip</strong><br /><br />
The NEAR team actively monitors all channels and appreciates community feedback. Your reports help improve the node experience for everyone!
</blockquote>
