---
layout: post
title: Magic Mouse (或蓝牙) mac 连接问题修复
tags:
- hardware
- mac
---

TL;DR;

> 关闭 Handoff
> 方法：系统偏好设置 - 通用 - 取消勾选「允许在这台 Mac 和 iCloud 设备之间使用“接力”」

如果在 Mac 上你的 Magic Mouse 或者其它蓝牙设备频繁丢失连接，在你试过所有其它方法后，
不妨试试关闭掉 Handoff，可能会有奇效。

来自：

- <https://www.forbes.com/sites/bradmoon/2017/07/13/this-trick-may-solve-your-mac-bluetooth-connectivity-issues/#33cb8aba5196>

## 后续

后来的事实证明上面的方法没有那么神奇，后来我发现可能跟 
TimeMachine 备份有关，如果你的鼠标经常卡住而且你有使用 TimeMachine 备份，
尝试将备份的磁盘移除，然后再重新连接鼠标。

猜测如果系统繁忙的时候蓝牙连接会不稳定，在我的电脑上 TimeMachine 备份偶尔会造成我的电脑非常卡顿，
如果你的电脑上还有其它可能造成卡顿的任务，尝试停止下来再重新连接鼠标。
