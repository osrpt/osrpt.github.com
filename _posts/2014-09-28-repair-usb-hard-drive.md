---
layout: post
title: 修复 U 盘
---

使用 USB 安装方式安装 CentOS 时候把 U 盘改坏了，Mac 下和 Windows 下都无法识别 U 盘。通过以下方式可以解决。

在 Windows 命令行中依次运行以下命令：

    diskpart
    list disk
    select disk # (用磁盘的编号替换这里的#)
    clean
    create partition primary
    format fs=ntfs (如果需要在 Mac 上和 Windows 上都使用的话，ntfs改为fat32)

###参考

1. [How to fix corrupted external hard drive](http://www.tomshardware.com/forum/285552-32-corrupted-external-hard-drive)
2. [DiskPart Commands](http://technet.microsoft.com/en-us/library/cc770877%28v=ws.10%29.aspx)
