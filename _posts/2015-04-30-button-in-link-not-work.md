---
layout: post
title: a 标签中包含 button 导致链接失效的问题
tags:
- html
- compatibility
---

某个页面将 button 包含在 a 标签中，在 IE8 下发现失效，点击链接后无法跳转。

经过查询资料，发现：

> + The interactive element button must not appear as a descendant of the a element.
> + The interactive element button must not appear as a descendant of the button element.
> + Any button element descendant of a label element with a for attribute must have an ID value that matches that for attribute.

来源：<http://www.w3.org/TR/html-markup/button.button.html#button.button>

所以：button 不能包含在 a 标签中，这将会导致无法跳转。

解决办法：

1. 不要使用 button，可以给 a 标签设置样式，让它看起来是一个 button。
2. 给 button 添加 onClick = "javascript:location.href='target'" 属性。
3. 使用 JavaScript 监听 button 的点击事件。

*注意：尽量不要使用 JavaScript 来实现，因为这会影响到搜索引擎的 SEO 效果。*


###参考

1. <http://stackoverflow.com/questions/802839/button-inside-of-anchor-link-works-in-firefox-but-not-in-internet-explorer>
