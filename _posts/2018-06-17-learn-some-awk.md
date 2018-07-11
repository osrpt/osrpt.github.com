---
layout: post
title: AWK 基础知识
tags:
- awk
- unix
---

## `$0` is the line:

> `awk '{print $0}'`

An [identity operation](https://en.wikipedia.org/wiki/Identity_function) - it copies the input to the output without changing it.

## Whitespace to split the line to `$1`, `$2`, `$3`, ...

> $ echo 'this is a test' | awk '{print $3}'
> a

Awk parses the line in to fields for you automatically, using any whitespace (space, tab) as a delimiter, merging consecutive delimiters. 
Those fields are available to you as the variables $1, $2, $3, etc.

logs.txt:

07.46.199.184 [28/Sep/2010:04:08:20] "GET /robots.txt HTTP/1.1" 200 0 "msnbot"
123.125.71.19 [28/Sep/2010:04:20:11] "GET / HTTP/1.1" 304 - "Baiduspider"

> $ awk '{print $1}' logs.txt

Output:

07.46.199.184

123.125.71.19

## `$NF` identify a field based on it's position from the last

> $ echo 'this is a test' | awk '{print $NF}'
> test

From right to left.

> awk '{print $1, $(NF-2) }' logs.txt

Output:

07.46.199.184 200

123.125.71.19 304

## `$NR` row number

> awk '{print NR ") " $1 " -> " $(NF-2)}' logs.txt

Output:

1) 07.46.199.184 -> 200

2) 123.125.71.19 -> 304

## `BEGIN{FS="x"}`

> $ awk '{print $2}' logs.txt | awk 'BEGIN{FS=":"}{print $1}'

Output:

[28/Sep/2010

[28/Sep/2010


Use with sed:

> $ awk '{print $2}' logs.txt | awk 'BEGIN{FS=":"}{print $1}' | sed 's/\[//'

Output:

28/Sep/2010

28/Sep/2010

## if

> $ awk '{if ($(NF-2) == "200") {print $0}}' logs.txt

Output:

07.46.199.184 [28/Sep/2010:04:08:20] "GET /robots.txt HTTP/1.1" 200 0 "msnbot"

## summing up

> $ awk '{a+=$(NF-2); print "Total so far:", a}' logs.txt

Output:

Total so far: 200

Total so far: 504

## END

> $ awk '{a+=$(NF-2)}END{print "Total:", a}' logs.txt

Output:

Total: 504

Only the last line, just like tail -n1.
