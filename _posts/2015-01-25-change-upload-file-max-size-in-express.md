---
layout: post
title: 修改 node.js 中上传文件大小限制
---

如果需要上传大文件，express 和 nginx 中都默认做了限制，都需要修改。

### express

    var express = require("express");
    var app = express();
    app.use(express.bodyParser({
        limit: '10mb'
    });

### 修改 nginx 设置

需要修改 `nginx.conf` 文件，并重启 nginx 服务:

    http {
        
        ...
        client_max_body_size 10M;
        ...
        server {
            ...
        }
    }

我修改后直接使用 `service nginx reload` 发现没有生效，使用 `service nginx restart` 时才发现配置文件出错，因为 `service nginx reload` 其实没有重新加载配置，需要注意。

如果 nginx 发现 config 文件错误，将不会重启而且不提示任何错误，所以需要 restart 而不是 reload。 <http://stackoverflow.com/a/18588998>
