---
layout: post
title: c# ERROR:“.”(十六进制值 0x00)是无效的字符
tags:
- c#
- exception
---

“.”(十六进制值 0x00)是无效的字符。

 解决方法：常见于socket方式连接（包括HTTP方式）等。报文交互时候，对方会在字符串后面多加’\0’表示字符结束的标语。

 因此需要把\0去掉，如 xmlStr.Trim(‘\0’);
