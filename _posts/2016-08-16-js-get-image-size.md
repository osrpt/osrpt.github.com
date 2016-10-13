---
layout: post
title: Get image size in JavaScript
tags:
- javascript
---

SVG 图片的尺寸获取按照常规方式有问题，应该使用以下方式：

  function getImageSize(src, cb) {
    var img = document.createElement('img');
    img.src = src;
    img.onload = function () {
      cb(null, {
        width: this.width,
        height: this.height
      });
    };
  }

<a href="/static/image-size.html">查看示例</a>
