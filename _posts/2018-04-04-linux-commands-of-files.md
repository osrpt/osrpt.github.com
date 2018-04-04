---
layout: post
title: Linux, macOS 文件相关的命令
tags:
- Linux
- macOS
- Command
---

## 在目录中查找文件

在当前目录下查找文件名中包含 `foo` 的文件：

```
find . -name "*foo*"
```

## 批量修改文件的后缀名

将所有的 `.xml` 文件的后缀名修改为 `.html`

```
rename "s/xml/html/" *.xml
```
