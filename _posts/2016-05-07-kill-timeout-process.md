---
layout: post
title: Go 中终止超时的进程
tags:
- go
- exec
---

最近在写 [better-domains](http://domain.sibo.io) 的时候，用了 `os/exec` 执行系统的 `whois` 程序，运行一段时间后会在某次卡住，导致 CPU 占用 100%。

这里如果加上超时判断，当发生超时时自动杀死进程就不会出现该问题了。

```
```


