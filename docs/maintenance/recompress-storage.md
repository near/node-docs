---
id: recompress-storage
title: Recompressing archival node storage
sidebar_label: Recompressing archival node storage
sidebar_position: 4
description: How to recompress archival node’s storage to reduce its size.
---

# Recompressing archival node storage

The nearcore 1.26.0 release introduces various improvements to node’s
storage layer.  Among better performance, the changes result in
*significant* reduction of the storage on archival nodes: from 7.9 TB
to 3.1 TB on mainnet and from 4.3 TB to 1.5 TB on testnet.

However, to take full advantage of the savings, some manual steps need
to be taken.  This document describes those steps.  Note that if
you’re not running an archival node, you don’t need to do anything.

One of the improvements is changing of the compression algorithm used
by the databases.  Because of that, the whole process is referred to
as ‘recompressing the storage’.


## Performing the operation

The operation can be performed at any time.  That is, it does not need
to happen directly after the node upgrade.  In fact, it might be
better to schedule it some number of days after binary upgrade.  Such
delay gives time to make sure that the binary release works correctly
before introducing another change.

### Required free space

Recompressing storage works by creating *a new* database.  As
a result, it requires noticeable amount of free disk space.
Specifically 4 TB for mainnet and 2 TB for testnet archival nodes.

If your host does not have enough free space you will need to resize
one of the existing partitions (if you are running in the cloud and
can resize disks freely) or temporarily attach a new disk.

At the end of the process it will be possible to delete the old
database freeing a lot of space.  Note however that while increasing
disk size in the cloud is often a simple operation, shrinking it might
be more complicated.  You need to plan accordingly based on your
node’s setup.

### Stopping the node

While the recompression takes place the database cannot be modified.
In other words, the node needs to be shut down.  The operation takes
around twelve hours on mainnet and six hours on testnet.  If you
require a continuous access to an archival node, you will need to set
up a redundant node if one is not already available.

Procedure for stopping a node depends on configuration of your system.
For example, if neard is run as a systemd service, the command to stop
it might look like:

```console
$ sudo systemctl stop neard.service
```

### Executing the recompression

The recompression is done by executing `recompress-storage` command of
`neard` binary.  If the command is interrupted the whole operation
needs to be run from scratch.  Because of that, it’s best to run it
inside of a screen or tmux session or through nohup utility.  For
example:

```console
$ NEAR_HOME=$HOME/.near  # change to point to near home directory
$ export NEAR_HOME

$ screen
$ # Inside of screen session:
$ neard recompress-storage --output-dir="${NEAR_HOME:?}/data.new"
```

Once recompression finishes successfully, the new database needs to be
put in place of the old one.  This is simply done by renaming the
`data.new` directory:

```console
$ NEAR_HOME=$HOME/.near  # change to point to near home directory
$ export NEAR_HOME

$ mv -- "${NEAR_HOME:?}/data"     "${NEAR_HOME:?}/data.bak"
$ mv -- "${NEAR_HOME:?}/data.new" "${NEAR_HOME:?}/data"
```

The `data.bak` backup might be worth keeping at least until
verification described in the next section is completed.  If the
verification fails, it will be easy to recover database prior to
recompression.  Otherwise `data.bak` can be deleted.

#### Disk size considerations

As mentioned above, the operation requires up to 4 TB of free disk
space.  The above commands assume that near home directory has it but
if it doesn’t you will have to write new database in a different
location adjusting `--output-dir` flag accordingly.

For example, if the archival node is running in cloud environment an
easy way could be to create a new disk and mount it under a new
location, e.g. `/mnt`.  This could look something like:

```console
$ NEAR_HOME=$HOME/.near  # change to point to near home directory
$ export NEAR_HOME

$ # After attaching new disk to the virtual machine; e.g. at /dev/sdx:
$ dev=/dev/sdx

$ sudo mkfs.ext4 "${dev:?}"
$ sudo mount "${dev:?}" /mnt
$ sudo chown -R $USER /mnt
$ neard recompress-storage --output-dir=/mnt/data
$ # ... recompress comences ...

$ rm -rf -- "${NEAR_HOME:?}/data"
$ cp -R -- /mnt/data "${NEAR_HOME:?}"
$ sudo umount /mnt
```

If you’re using a different configuration with a separate disk mounted
at `~/.near` directory, copying is not necessary and can be handled by
swapping the mount points.  Note that in this instance the new disk
needs to be an SSD.

```console
$ cp ~/.near/*.json /mnt
$ sudo umount ~/.near
$ sudo umount /mnt
$ sudo mount "${dev:?}" ~/.near
```

The details will depend on the configuration of the system you’re
using.

### Verification

At this point it is possible to start the archival node again.
However, we recommend performing sanity checks on the new database
before doing that.  This can be done with help of `view-state` command
as follows:

```console
$ NEAR_HOME=$HOME/.near  # change to point to near home directory
$ export NEAR_HOME

$ head=$(neard view-state view-chain |
         sed -ne 's/ *height: *\([0-9]*\),$/\1/p')
$ test -n "$head" || echo 'Unable to read chain head'
$ echo TIP: "$head"
TIP: 63870907

$ start=$((head - 1000))
$ neard view-state apply-range --start-index=$start --shard-id=0
$ neard view-state apply-range --start-index=$start --shard-id=1
$ neard view-state apply-range --start-index=$start --shard-id=2
$ neard view-state apply-range --start-index=$start --shard-id=3
```

If the commands report no errors or differences, it’s safe to start
the node again.  This verification should take around 15 minutes.


## What has been changed

The 1.26.0 release introduced three main changes which reduced size of
the storage.

Firstly, we’ve incorporated Zstandard (zstd) compression algorithm
which by itself reduces size of the database by around a quarter.
However, normally existing data remains intact unless it’s changed or
compacted.  Since RPC nodes rewrite most of the storage every five
epochs, their database will be recompressed after two and a half days.
On the other hand, archival nodes benefit from it being done manually
since otherwise the size reduction would take a long time to present
itself.

Secondly, we’ve started garbage collecting partial encoded chunks on
archival nodes.  RPC nodes already garbage collected that data so this
change doesn’t affect them.  The encoded chunks are needed when other
nodes sync their state but can be reconstructed from other objects in
the database.  They constitute around a quarter of the database’s size
thus garbage collecting them results in a big reduction in storage
size at the cost of slight computation increase when node sends old
blocks to other archival nodes which attempt to sync their state.

Thirdly, we’ve stopped generating trie changes on archival nodes.
Those objects are needed on RPC nodes but can be omitted on archival
nodes.  They accounted for around a quarter of the database’s size.


## Do I need to do anything?

You don’t need to do anything if you’re running an RPC node or if you
don’t care about storage cost.  If you have SSD disk space laying
around you may continue running your node without performing the
recompression.

Note also that if you are operating an archival node but are worried
about scheduling (e.g. you’re busy dealing with other issues and thus
have no time to deal with neard database changes) you can postpone the
recompression.
