---
layout: post
title: Get image size in JavaScript
tags:
- javascript
---

获取一般图片的尺寸比较简单，以下方法就可以了：

  function getImageSize(src, cb) {
    var img = document.createElement('img');
    img.src = src;
    img.onload = function () {
      cb(null, {
        width: this.width || img.naturalWidth || img.width,
        height: this.height || img.naturalHeight || img.height
      });
    };
  }

但是 SVG 不能像普通图片一样处理，浏览器会返回不同值，尚未找到一种方式获取到未缩放的 SVG 图片的原始大小。

<a href="/static/image-size.html">查看示例</a>
