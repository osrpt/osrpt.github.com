---
layout: post
title: 禁用 SequelPro 中的 Control+H 快捷键
---

SequelPro 是 OSX 上我认为最好的 MySQL 客户端，但是一直以来都有一个问题困扰着我，就是他的快捷键 Control+H 和 OSX 系统惯用的 ^h 冲突了。
在 OSX 中，^h 可以用来向前删除，这是来自 emacs 的快捷键映射，我长期依赖已经习惯了这一套键盘隐射。
但是在 SequelPro 中如果在文字附近按了这个快捷键会打开帮助窗口，非常难受。

最近在官方的 issues 中找到了解决办法：(Disable keyboard shortcuts (selectively) #1974)[https://github.com/sequelpro/sequelpro/issues/1974]。
但是这里写得不太清楚，用到了一个我不太熟悉的系统功能，所以这里再稍微解释一下。

在 OSX 中可以重新映射应用程序的快捷键。
