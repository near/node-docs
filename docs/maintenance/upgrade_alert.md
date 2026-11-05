---
id: upgrade_alert
title: Validator Node Upgrade Alert
sidebar_label: Validator Node Upgrade Alert
description: How to setup an alert for validator nodes upgrading.
sidebar_position: 5
---

# Alerting for Validator Node Upgrades

A new protocol version is adopted when block producers that hold more than 80% of the total block producer stake vote for it during an epoch. A node votes in the blocks it produces. A release that sets a voting date votes for its new protocol version only after that date. If the vote passes at the end of epoch T, the new version takes effect at the start of epoch T+2.

Upgrade before the end of the epoch in which the vote passes (epoch T). The vote can pass in the first epoch after the voting date of a release, so in practice, upgrade before the voting date. If you do not:

- A node whose release does not support the new version stops at the last block of epoch T. This is one epoch before the new version takes effect.
- Block producers whose latest block in epoch T voted for an older version are removed from the validator set of epoch T+2.

The following provides a network upgrade ratio which allows validators to see what percentage of the validator nodes has upgraded to a new protocol version. This ratio counts nodes by their neard version. It is not weighted by stake, so it only approximates the vote.

<blockquote class="warning">
<strong>Heads up</strong><br /><br />

Each node exports the metric `near_protocol_version_votes`. At the end of each epoch, it shows the percentage of block producer stake that voted for each protocol version. It is based on on-chain data, so it is more reliable than the telemetry ratio below.
</blockquote>

Validator nodes periodically submit telemetry data, which is stored in a publicly-accessible PostgresSQL database.
Note that the nodes can opt out of submitting the telemetry data, and the telemetry data isn't guaranteed to be accurate.

With these caveats clarified, let's define an upgrade alert. The instructions were tested only in Grafana.

Step 1. Add a PostgreSQL data source with the following credentials:

* `telemetry_testnet` for testnet and `telemetry_mainnet` for mainnet: https://github.com/near/near-indexer-for-explorer/#shared-public-access

Step 2. Add a dashboard with a Graph panel with the following SQL query. Grafana only supports alerts on the Graph panels, therefore this needs a workaround to fit the Table data into a Graph format.

```
SELECT $__time(time_sec)
  ,upgraded_ratio
FROM (
  SELECT NOW() - INTERVAL '1' SECOND AS time_sec
    ,(
      (
        SELECT CAST(COUNT(*) AS FLOAT)
        FROM nodes
        WHERE agent_version > (
            SELECT MIN(agent_version)
            FROM nodes
            WHERE is_validator
              AND (now() - last_seen) < INTERVAL '15 MINUTE'
            )
          AND is_validator
          AND (now() - last_seen) < INTERVAL '15 MINUTE'
        ) / (
        SELECT COUNT(*)
        FROM nodes
        WHERE is_validator
          AND (now() - last_seen) < INTERVAL '15 MINUTE'
        )
      ) AS upgraded_ratio
  ) AS inner_table
WHERE $__timeFilter(time_sec);
```

Step 3. Go to the alert tab and change the condition to `WHEN last () OF query (A, 10s, now) IS ABOVE 0.65` or similar.

Step 4. Optionally add a table with min and max version of the validator nodes:

```
SELECT (
    SELECT MIN(agent_version)
    FROM nodes
    WHERE is_validator
      AND (now() - last_seen) < INTERVAL '15 MINUTE'
    ) AS min_version
  ,(
    SELECT MAX(agent_version)
    FROM nodes
    WHERE is_validator
      AND (now() - last_seen) < INTERVAL '15 MINUTE'
    ) AS max_version
  ,(
    SELECT COUNT(*)
    FROM nodes
    WHERE is_validator
      AND (now() - last_seen) < INTERVAL '15 MINUTE'
    ) AS num_validators
  ,(
    SELECT COUNT(*)
    FROM nodes
    WHERE agent_version = (
        SELECT MAX(agent_version)
        FROM nodes
        WHERE is_validator
          AND (now() - last_seen) < INTERVAL '15 MINUTE'
        )
      AND is_validator
      AND (now() - last_seen) < INTERVAL '15 MINUTE'
    ) AS upgraded_validators
  ,(
    (
      SELECT CAST(COUNT(*) AS FLOAT)
      FROM nodes
      WHERE agent_version = (
          SELECT MAX(agent_version)
          FROM nodes
          WHERE is_validator
            AND (now() - last_seen) < INTERVAL '15 MINUTE'
          )
        AND is_validator
        AND (now() - last_seen) < INTERVAL '15 MINUTE'
      ) / (
      SELECT COUNT(*)
      FROM nodes
      WHERE is_validator
        AND (now() - last_seen) < INTERVAL '15 MINUTE'
      )
    ) AS upgraded_ratio;
```

Step 5. Optionally add a table with the number of nodes running a newer version than your node:

```
SELECT (
    SELECT COUNT(*)
    FROM nodes
    WHERE is_validator
      AND (now() - last_seen) < INTERVAL '15 MINUTE'
    ) AS num_validators
  ,(
    SELECT COUNT(*)
    FROM nodes
    WHERE agent_version > (
        SELECT agent_version
        FROM nodes
        WHERE moniker = '$YOUR_VALIDATOR_MONIKER'
        )
      AND is_validator
      AND (now() - last_seen) < INTERVAL '15 MINUTE'
    ) AS upgraded_validators
  ,(
    (
      SELECT CAST(COUNT(*) AS FLOAT)
      FROM nodes
      WHERE agent_version > (
          SELECT agent_version
          FROM nodes
          WHERE moniker = '$YOUR_VALIDATOR_MONIKER'
          )
        AND is_validator
        AND (now() - last_seen) < INTERVAL '15 MINUTE'
      ) / (
      SELECT COUNT(*)
      FROM nodes
      WHERE is_validator
        AND (now() - last_seen) < INTERVAL '15 MINUTE'
      )
    ) AS upgraded_ratio;
```
