---
layout: post
title: 优化 JavaScript 的推荐文章
tags:
- JavaScript
---

## 优化 JavaScript 执行

<https://developers.google.com/web/fundamentals/performance/rendering/optimize-javascript-execution>

总结：

+ 使用 `requestAnimationFrame` 实现视觉变化，替代 `setTimeout` 和 `setInterval`
+ 使用 WebWorker 来在主线程之外进行重度计算
+ 使用 Chrome 的分析工具来检查卡顿
+ 避免微优化
