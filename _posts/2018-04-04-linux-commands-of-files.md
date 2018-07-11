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

## 在目录中查询包含了特殊文字的文件

```
grep -rnw '/path/to/somewhere/' -e 'pattern'
```

FROM: <https://stackoverflow.com/a/16957078/1778658>

## 批量修改文件的后缀名

将所有的 `.xml` 文件的后缀名修改为 `.html`

```
rename "s/xml/html/" *.xml
```

## 在临时目录中找出7天以前的文件然后删除

```
$ find /tmp/* -mtime +7 -exec rm {} \;
```
