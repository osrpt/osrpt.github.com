---
layout: post
title: 在 GFW 下使用 pypi
tags:
- python
---

国内的 pypi.python.org 经常无法访问，无法方便地使用 pip 来安装包，豆瓣做了一个国内的镜像，可以使用。

安装单个包：

```
easy_install -i http://pypi.douban.com/simple oss2
pip install -i http://pypi.douban.com/simple oss2
```

如果要始终指定使用豆瓣镜像。

修改（或添加）配置到 `~/.pip/pip.conf`：

```
[global]
trusted-host = pypi.douban.com
index-url = http://pypi.douban.com/simple
```

注意这可能会带来一定的风险，在生产环境使用请自行把握。
