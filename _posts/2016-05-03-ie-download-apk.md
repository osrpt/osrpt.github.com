---
layout: post
title: 下载 apk 自动被重命名为 zip 的问题
tags:
- server
- nginx
---

IE 或 EDGE 下载 .apk 的时候发现被重命名为了 .zip，这个问题是因为 mimetype 设置的不对，自动被设置为了 application/octet-stream 。

在 nginx 的 mimetype 中自定义配置 apk 可以解决这个问题。

编辑 `/etc/nginx/mime.types` ，添加一行新配置：

    application/vnd.android.package-archive apk;

然后重启 nginx 服务：

    service nginx reload
