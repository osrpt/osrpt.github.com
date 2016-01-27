---
layout: post
title: CSS Transform 导致边沿锯齿状的问题
tags:
- css
---

在网页中垂直居中对齐是一个比较麻烦的事情，我近来一直采用以下方式：

    .vertical-center {
        position: relative;
        top: 50%;
        transform: translateY(-50%);
    }

这种方式比较简单，[兼容性也不错](http://caniuse.com/#feat=transforms2d)。

但是刚刚发现了使用这种方式的一个新问题，我有一个对话框希望在页面中垂直居中，我给对话框添加了 1px 的 border，但是发现该对话框的上下边框线条模糊，左右线条却很清晰。

经过查询后发现这是一个浏览器 Bug，在 Stackoverflow 上也有一些[解决办法](http://stackoverflow.com/questions/6492027/css-transform-jagged-edges-in-chrome)。

我使用 `flex` 之后就没有这个问题了，不过这种方式的兼容性并不好：

    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
