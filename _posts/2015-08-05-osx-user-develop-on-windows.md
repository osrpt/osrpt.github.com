---
layout: post
title: OSX users Develop on Windows
---

最近需要在 Windows 上做一些开发，这样就需要在 OSX 和 Windows 之间不停切换，下面是一些关于如何更好协调的问题。

### 远程访问 Windows

我有一台 Thinkpad 笔记本，使用 Macbook 以后就闲置了，这次想利用起来。
这样也可以保证 Windows 系统的性能最佳，所以我尝试了很多方式同时使用两部笔记本。
并且希望能用一套键盘鼠标来控制，毕竟频繁切换实在太麻烦了。

总结下来如果要使用另外一台 Windows 设备，最好的方式是使用 Microsoft 的应用 [Microsoft Remote Desktop](https://itunes.apple.com/us/app/microsoft-remote-desktop/id715768417?mt=12)。
这是微软最新的远程访问应用，只有美国 App Store 上可以下载到。所以要切换 App Store 的区去下载。

微软还有一个旧的远程访问应用，并不好用，不建议尝试了。

TL;DR: 使用 Microsoft Remote Desktop

### 虚拟机

OSX 主要有以下几种虚拟机软件：

+ Virtual Box
+ VMWare Fusion
+ Paralles Desktop

Virtual Box 是免费应用，另外两个付费。我先试用了 Virtual Box，但是使用过程中几度遇到问题，不得不重装虚拟机系统。
后来试用了 Paralles Desktop，发现确实非常非常好用。
虽然 PD 非常贵，但是确实物超所值。
PD 可以直接设置按键绑定，解决了下面将要说的按键绑定问题。

TL;DR: 如果经济允许，使用 Paralles Desktop。否则，使用 Virtual Box。

### Emacs 按键绑定

OSX 系统自带了许多 Emacs 快捷键绑定，[点击查看](/2014/12/16/mac-edit-shortcut.html)。
使用习惯了以后就离不开了，可以使用一些软件在 Windows 上设置 Emacs 按键绑定，具体可以查看下面的文章。

<http://emacsblog.org/2007/05/10/emacs-key-bindings-in-windows/>
