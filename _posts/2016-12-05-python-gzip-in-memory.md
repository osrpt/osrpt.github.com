---
layout: post
title: 使用 Python 在内存中进行 gzip 压缩
tags:
- python
- gzip
---


```
import cStringIO
import gzip

sio = cStringIO.StringIO()
gzipped = gzip.GzipFile(fileobj=sio, mode='w')
content = myzip.open(n).read()
gzipped.write(content)
gzipped.close()
print sio.getvalue() // result
sio.close()
```
