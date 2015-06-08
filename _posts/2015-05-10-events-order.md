---
layout: post
title: 事件顺序
tags:
- event
- target
- translate
---

在 [事件介绍](http://www.quirksmode.org/js/introevents.html) 那篇文章中我问了一个初看无法理解的问题：“如果一个元素和它的一个祖先元素监听同一个事件，哪一个会先被触发？” 毫无奇怪的是，这跟不同的浏览器有关。

这个问题的基本信息很简单，建设你有个包含子元素的元素：

    -----------------------------------
    | element1                        |
    |   -------------------------     |
    |   |element2               |     |
    |   -------------------------     |
    |                                 |
    -----------------------------------

并且它们都有一个 `onClick` 事件监听器。如果用户点击了 `element2` 那么将在 `element1` 和 `element2` 上都触发一个点击事件。但是哪一个将会被先触发呢？哪一个监听器将首先执行呢？换句话说，就是事件的顺序是怎么样的。

##两种模型

毫不奇怪，在当时 Netscape 和 Microsoft 有着不同的看法：

+ Netscape 认为 `element1` 上面的事件先发生。这叫做 `事件捕获(event capturing)`。
+ Microsoft 坚持 `element2` 上的事件应该优先。称之为 `事件冒泡(event bubbling)`。

这两种顺序是完全相反的。IE 浏览器只支持事件冒泡。Mozilla, Opera 7 和 Konqueror 两种都支持。旧的 Opera 和 iCab 两种都不支持。

###事件捕获

当使用事件捕获的时候：

                   | |
    ---------------| |-----------------
    | element1     | |                |
    |   -----------| |-----------     |
    |   |element2  \ /          |     |
    |   -------------------------     |
    |        Event CAPTURING          |
    -----------------------------------

`element1` 的监听器首先被触发，`element2` 的后触发。

###事件冒泡

当使用事件冒泡的时候：

                   / \
    ---------------| |-----------------
    | element1     | |                |
    |   -----------| |-----------     |
    |   |element2  | |          |     |
    |   -------------------------     |
    |        Event BUBBLING           |
    -----------------------------------

`element2` 上的监听器首先被触发，`element1` 的后触发。

###W3C 模型

W3C 非常明智地决定在这场争执中保持中立。任何在 [W3C 事件模型](http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/) 下发生的事件首先被捕获，直到到达目标元素，然后又冒泡。

                     | |  / \
    -----------------| |--| |-----------------
    | element1       | |  | |                |
    |   -------------| |--| |-----------     |
    |   |element2    \ /  | |          |     |
    |   --------------------------------     |
    |        W3C event model                 |
    ------------------------------------------

而你，web 开发工程师，可以选择注册一个在捕获阶段或者冒泡阶段的事件触发器。这通过在 [高级模型页面](http://www.quirksmode.org/js/events_advanced.html) 上介绍的 `addEventListener()` 方法完成。
如果它的最后一个参数是 `true` 那么事件监听器被设置到捕获阶段。
如果是 `false`, 则设置到冒泡阶段。

假设你使用：

    element1.addEventListener('click',doSomething2,true)
    element2.addEventListener('click',doSomething,false)

<未完...>

From: <http://www.quirksmode.org/js/events_order.html>

