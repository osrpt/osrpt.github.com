---
layout: default
title: c# ERROR:“.”(十六进制值 0x00)是无效的字符
---

>Thread.Sleep(0) relinquishes the thread’s current time slice immediately, voluntarily handing over the CPU to other threads. Framework 4.0’s new Thread.Yield() method does the same thing — except that it relinquishes only to threads running on the same processor.

>Sleep(0) or Yield is occasionally useful in production code for advanced performance tweaks. It’s also an excellent diagnostic tool for helping to uncover thread safety issues: if inserting Thread.Yield() anywhere in your code makes or breaks the program, you almost certainly have a bug.

Thread.Sleep(0) 和 Thread.Yield()的用法
