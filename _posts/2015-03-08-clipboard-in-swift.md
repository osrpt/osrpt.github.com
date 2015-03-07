---
layout: post
title: Swift 中的剪贴板操作
---

实例化一个剪贴板：

    var nsPasteBoard:NSPasteboard = NSPasteboard.generalPasteboard()

###设置剪贴板内容

    nsPasteBoard.clearContents()
    nsPasteBoard.writeObjects(["Hello, NSPasteboard"])

###获取剪贴板上的文本

    var str:String = nsPasteBoard.stringForType("public.utf8-plain-text")
