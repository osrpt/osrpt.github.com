---
layout: post
title: Linux Tips
tags:
- Linux
- Tips
---

###监控日志文件

    tail -f error.log

如果有新的日志写入到文件中，将会自动打印在屏幕上。

###统计文件夹内文件数量

    ll | wc -l

###Go back to previous directory

    cd -

###备份文件夹

    tar -cvpzf /mybackupfolder/backup.tar.gz    /imp-data

参数说明：

    c = create
    v = Verbose mode
    p = Preserving Files and Directory Permissions.
    z = This will tell tar that compress the files further to reduce the size of tar file.
    f = It is allows to tar get file name.

From: <http://www.broexperts.com/2012/06/how-to-backup-files-and-directories-in-linux-using-tar-cron-jobs/>

###删除 svn 上丢失的文件

    svn status | grep '^!' | cut -d ' ' -f2- | xargs svn delete

解释：

+ `svn status` 获取所有文件的状态，丢失的文件以 `!` 开头
+ 使用 `grep '^!'` 查询到所有以 `!` 开头的行
+ 使用 `cut` 命令分隔，取第二列
+ 使用 `xargs` 命令把参数一行一行地传递给 `svn delete` 命令，这里 `xargs` 命令会自动去掉每一行的收尾空白

###curl 获取某个 URL 的 header

    curl -s -I http://blog.sibo.me

解释：

+ `-I` 只获取 headers
+ `-s` silent

###批量修改文件后缀名

修改 `*.react.js` 为 `*.jsx`:

    find . -name '*.react.js' -exec sh -c 'mv "$0" "${0%.react.js}.jsx"' {} \;
