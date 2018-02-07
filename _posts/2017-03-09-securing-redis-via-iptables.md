---
layout: post
title: Securing Redis via IPTables
tags:
- redis
- secure
---

```
iptables -A INPUT -p tcp -m tcp --dport 6379 -j DROP
```

to block all other ips.

```
# !/usr/bin/env bash

# redis_secure.sh

# this script will add an ip address to iptables
# allowing the ip address to connect to redis

# should be run with localhost first

IPADDRESS="$1"
if ! test "$IPADDRESS"; then
    echo "Please enter the IP Address you want to be able to connection to Redis."
    exit 1
fi

sudo iptables -A INPUT -s $IPADDRESS -p tcp -m tcp --dport 6379 -j ACCEPT
sudo bash -c 'iptables-save > /etc/sysconfig/iptables'
```

`./redis_secure.sh localhost`

`./redis_secure.sh 127.0.0.1`

## Other iptables commands

Check rules:

`sudo iptables -S `

or

`sudo iptables -L`
