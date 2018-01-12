---
layout: post
title: `find` 的一些示例
tags:
- linux
- command
- find
---

## Find Files Bigger or Smaller Than X Size

```
find . -type f -size +4G
find . -type f -size -4G
find . -type f -size +4M
find . -type f -size -4M
```

Between 30MB and 40MB

```
find -size +30M -size -40M
```

Formats:

+ `c’ for bytes
+ ‘w’ for two-byte words
+ `k’ for Kilobytes
+ `M’ for Megabytes
+ `G’ for Gigabytes

FROM: <https://www.ostechnix.com/find-files-bigger-smaller-x-size-linux/>
