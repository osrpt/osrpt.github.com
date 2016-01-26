---
layout: post
title: 在 VPS 上使用 Git 做自动部署
tags:
- git
- vps
- deploy
---

### 服务器设置

文件目录： `/var/www/domain.com`

服务器仓库：`/var/repo/site.git`

#### 创建仓库

`
cd /var
mkdir repo && cd repo
mkdir site.git && cd site.git
git init --bare
`

`--bare` 的意思是该目录只作为版本控制，但是不实际包含源代码文件。

#### 设置钩子

进入钩子目录，已经有很多钩子例子，具体可以参考[官方文档](http://git-scm.com/book/en/Customizing-Git-Git-Hooks)：


`
cd hooks
`

创建一个 `post-receive` 文件：

`
touch post-receive
`

编辑 `post-receive` 文件，写入：

`
#!/bin/sh
git --work-tree=/var/www/domain.com --git-dir=/var/repo/site.git checkout -f
`

设置为可以执行：

`
chmod +x post-receive
`

### 本地设置

这里我们会创建一个示例仓库：

`
cd /my/workspace
mkdir project && cd project
git init
`

设置远程路径：

`
git remote add live ssh://user@mydomain.com/var/repo/site.git
`

这样就已经设置好了，当每次使用 `git push live master` 之后服务器就会自动同步文件到对应目录中。

以上部分主要来自: <https://www.digitalocean.com/community/tutorials/how-to-set-up-automatic-deployment-with-git-with-a-vps>
