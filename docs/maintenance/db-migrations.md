---
id: db-migrations
title: Safe Database Migrations
sidebar_label: Safe Database Migrations
description: How to do database migrations without corrupting the database
sidebar_position: 3
---

# Database Migrations

## Background

Nodes use [RocksDB](https://rocksdb.org/) database to store blockchain
information locally. Some node releases need to change the format of data stored
in that database, for example to enable new protocol features.  The process of
converting the data to a new format is called **database migration**. Data
formats are also numbered and this is called **database version**.

Node binary can print its supported protocol version and the database version it needs.

For example, here we can see that the node expects database version 28, as indicated by `db 28`:

```
$ ./target/release/neard
neard (release 1.22.0) (build 5a6fb2bd2) (protocol 48) (db 28)
NEAR Protocol Node
```

If an existing database version is lower that what the binary needs, the node
performs a **database migration** at startup. Here is an example of running a
node version `1.24.0` using an instance of database created by a node version
`1.21.1`. You can see several DB migrations triggering sequentially.

```
$ ./target/release/neard
INFO neard: Version: 1.24.0, Build: crates-0.11.0-80-g164991d7a, Latest Protocol: 51
INFO near: Opening store database at "/home/user/.near/data"
INFO near: Migrate DB from version 27 to 28
INFO near: Migrate DB from version 28 to 29
INFO near: Migrate DB from version 29 to 30
INFO near: Migrate DB from version 30 to 31
```

## What can go wrong?

Sometimes a database migration gets **interrupted**. This can happen for many
reasons, such as a machine failing during a long-running database migration, or
the user accidentally stopping the process with `Ctrl-C`. The data stored in the
database has no self-describing metadata for efficiency reasons, therefore it is
impossible to determine which database items were already converted to the new
format, making it impossible to resume or start the migration over. This means
that interrupting a database migration gets the database irrecoverably corrupted.

## Safe database migrations

Starting with neard release `1.26.0`, the node includes a way to **recover the
database instance** even if the database migration gets corrupted. This feature
is enabled by default but requires a manual intervention if a database migration
actually gets interrupted.

One of the possible ways to restore a database is to use a known good state of
the database. Before `1.26.0`, this was mostly done by downloading a
[node database snapshot](/intro/node-data-snapshots).
Starting with `1.26.0`, it can be done locally, which is more convenient and
much faster.

For the demonstration purposes, let's assume that the near home directory is
`/home/user/.near`, and the database location is `/home/user/.near/data`. Then a
safe database migration works the following way:

1. Creates an instant and free snapshot of the existing database in
`/home/user/.near/data/migration-snapshot` using filesystem hard links.
<blockquote class="warning">
If your filesystem doesn't support hardlinks (or you’ve configured the snapshot
to be created on a different file system), this step can take significant
time and double the space used by the database.
</blockquote>
2. Runs the database migration.
<blockquote class="warning">
Even though a newly created snapshot takes no additional space, the space taken
by the snapshot will gradually increase as the database migration progresses.
</blockquote>
3. Deletes the snapshot.

4. Runs the node normally.

If the migration step is interrupted, a snapshot will not be deleted. Upon
restart, the node will detect the presence of the local snapshot, assume that
a database migration was interrupted (thus corrupting the database) and ask the
user to recover the database from that snapshot.

### Recovery

Assuming the corrupted database is in `/home/user/.near/data`, and the snapshot
is in its default location in the database directory (
`/home/user/.near/data/migration-snapshot`) a user may restore the database as
follows:

```sh
# Delete files of the corrupted database
rm /home/user/.near/data/*.sst

# Move not only the .sst files, but all files, to the data directory
mv /home/user/.near/data/migration-snapshot/* /home/user/.near/data/

# Delete the empty snapshot directory
rm -r /home/user/.near/data/migration-snapshot

# Restart
./target/release/neard
```

### Configuration

Starting with upcoming release 1.30, the safe database migrations feature is
configured by a `store.migration_snapshot` option (i.e., a `migration_snapshot`
property of a `store` object).  It can be set to one of the following:

- an absolute path (e.g. `"/srv/neard/migration-snapshot"`) — the snapshot will
  be created in specified location;
- a relative path (e.g. `"migration-snapshot"`) — the snapshot will be created
  in specified sub-directory inside of the database directory;
- `true` (the default) — equivalent to specifying `"migration-snapshot"`
  relative path; or
- `false` — the safe migration feature will be disabled.

Note that the default location of the snapshot is inside the database directory.
This ensures the snapshot is instant and free (so long as the filesystem
supports hardlinks).

Prior to version 1.30, the feature was configured by `use_db_migration_snapshot`
and `db_migration_snapshot_path` options.  They are are now deprecated and if
the node detects that they are set, it will fail a migration with message
explaining how to migrate to new options.

>Got a question?
<a href="https://stackoverflow.com/questions/tagged/nearprotocol">
  <h8>Ask it on StackOverflow!</h8></a>
