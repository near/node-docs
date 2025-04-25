---
id: maintenance
title: Node Update and Network Upgrade
sidebar_label: Node Update and Network Upgrade
sidebar_position: 2
description: NEAR Node Update and Network Upgrade
---

## Nearcore Releases {#updating-a-node}

As a decentralized network, every update to NEAR Protocol needs some coordination between end users, platforms, developers, and validators.

NEAR merges nearcore updates from nearcore release on Github: https://github.com/near/nearcore/releases. For each nearcore release, the release notes indicate the nature of the release:
```
CODE_COLOR: CODE_YELLOW_MAINNET  // This field indicates the release tag (see below).
RELEASE_VERSION: 1.23.0          // This field indicates the nearcore version.
PROTOCOL_UPGRADE: TRUE           // This indicates that is a protocol upgrade and therefore a required upgrade.
DATABASE_UPGRADE: TRUE           // This field indicates that database migration is needed.
SECURITY_UPGRADE: FALSE          // This field indicates this release does not contain a security upgrade.
```


## Nearcore Release Schedule {#nearcore-planned-updates}

The nearcore release schedule is shown on the public [NEAR Community Google Calendar](https://calendar.google.com/calendar/u/0/embed?src=nearprotocol.com_ltk89omsjnc2ckgbtk6h9157i0@group.calendar.google.com).

Typically, `testnet` and `mainnet` releases are five weeks apart to allow nearcore to be tested thoroughly on `testnet` before promotion to `mainnet`. From time to time, due to changes in engineering calendar and the nature of the release, release dates may change. Please refer to the [NEAR Community Google Calendar](https://calendar.google.com/calendar/u/0/embed?src=nearprotocol.com_ltk89omsjnc2ckgbtk6h9157i0@group.calendar.google.com) for the most updated release dates.
- `testnet` Wednesday at 15:00 UTC. The release tag is mapped with `x.y.z-rc.1`
- `mainnet` Wednesday at 15:00 UTC. The release tag is mapped with `x.y.z`

## Nearcore Emergency Updates {#nearcore-emergency-updates}

We may issue a `[CODE_YELLOW_TESTNET]` or `[CODE_YELLOW_MAINNET]` if the network is suffering minor issues, or a new software release introduces incompatibilities and requires additional testing.

NEAR Protocol team will use the tag `[CODE_RED_TESTNET]` or `[CODE_RED_MAINNET]` in the Validator Announcement channel on [Discord](https://discord.gg/xsrHaCb), followed by email instructions for coordination. Some updates may follow a confidential process, as explained on [nearcore/SECURITY.md](https://github.com/near/nearcore/blob/master/SECURITY.md) docs.

NEAR's team will be mostly active on [Github](https://github.com/near/nearcore), and with limited participation on Discord and Telegram.


## Runtime Alerts {#runtime-alerts}

To keep our network healthy and minimize the damage of potential incidents, the NEAR team would like to establish a process with which we communicate updates and emergency situations with validators so that they can respond promptly to properly sustain the operations of the network. To this end, we propose that we use different tags in important messages to validators so that they can be easily picked up by automated systems on validators’ end.

The tags we propose are as follows:

`[CODE_RED_<network_id>]` where `<network_id>` is either `MAINNET` or `TESTNET`. This represents the most dire and urgent situation. Usually it means that the network has stalled or crashed and we need validators to take **immediate** actions to bring the network up. Alternatively it could mean that we discovered some highly critical security vulnerabilities and a patch is needed as soon as possible. If it is about mainnet, we expect that validators will react immediately to such alerts, ideally within 30 minutes.

`[CODE_YELLOW_<network_id>]` where `<network_id>` is either `MAINNET` or `TESTNET`. This represents a less urgent announcement. Usually it means the release of a protocol change or a fix of a moderate security issue. In such cases, validators are not expected to take immediate actions but are still expected to react within days.

`[CODE_GREEN_<network_id>]` where `<network_id>` is either `MAINNET` or `TESTNET`. This usually means some general announcement that is more informational or doesn’t require actions within a short period of time. It could be an announcement of a release that improves performance or a fix some minor issues.

Call-to-actions for technical teams if the network is stalling and there's the need to coordinate a manual node restart. Such messages begin with `[CODE_RED_MAINNET]` or `[CODE_RED_TESTNET]`, and will be posted in the read-only Validator Announcement channel on [Discord](https://discord.gg/xsrHaCb). The same message may be repeated in other channels, to have higher outreach.


>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
