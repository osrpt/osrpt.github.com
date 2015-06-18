---
layout: post
title: 事件顺序[译]
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

如果用户点击了 `element2` 那么将发生如下事情：

1. `click` 时间在捕获方式中开始。该事件将查找是否有 `element2` 的祖先元素有一个针对捕获语法的 `onclick` 事件监听器。
2. 该事件找到了一个 `element1.doSomething2()` 并且触发它。
3. 事件继续向下到达目标本身，没有发现更多的捕获方式的事件监听器。事件开始进行冒泡方式，并且触发以冒泡方式注册在 `element2` 上的 doSomething()`。
4. 事件继续向上传播，并且触发目标元素的祖先元素上以冒泡方式注册的监听器。在这个示例中已经没有了。

反过来就是：

    element1.addEventListener('click',doSomething2,false)
    element2.addEventListener('click',doSomething,false)

现在如果用户点击了 `element2` ，那么将发生下面的事情：

1. `click` 事件首先在捕获方式上开始。该事件将查找 `element2` 的祖先元素是否有注册 `onclick` 监听器，这里并没有找到任何一个。
2. 事件传播到元素本身。事件转为冒泡，并且执行以冒泡方式注册在 `element2` 上的 `doSomething()`。
3. 事件再次向上传播，并查找是否有 `element2` 的祖先元素以冒泡方式注册的监听器。
4. 该事件在 `element1` 上找到了一个。现在 `doSomething` 将执行。

####和传统模型和睦相处

在支持 **W3C DOM** 模型的浏览器中，一个传统的事件注册方式

    element1.onclick = doSomething2;

被当城冒泡方式。

###使用事件冒泡

很少有 Web 开发者有意地使用事件捕获或事件冒泡。在他们现在开发的 Web 页面中，基本都不需要让一个冒泡的事件被多个不同的监听器捕获。
如果用户一次点击导致多个事情发生，就可能会感到迷惑，并且一般来说你通常都想分开你的事件监听器脚本。
当用户在一个元素上点击时，发生对应的事情，当点击另外一个元素时，发生其他的事情。

当然这在以后可能会有变化，并且将模型保持为面向未来友好的是一件好事。
但是在目前事件捕获和冒泡的主要实际使用是默认方法的注册。

###这总是发生的

你首先需要知道的是事件捕获或冒泡是总是会发生的。如果你为你的整个 document 定义了一个 `onclick` 事件监听：

    document.onclick = doSomething;
    if (document.captureEvents) document.captureEvents(Event.CLICK);

这样 document 上的任何元素的 `click` 事件都会冒泡到 document 上，并且触发这个事件监听器。
除非一个之前的事件监听齐显示地阻止了冒泡，这样就不会再传播到 document 了。

###使用

因为任何事件都结束于 document ，所以默认的 事件捕获变得可行。假设你有这样一个页面：

    ------------------------------------
    | document                         |
    |   ---------------  ------------  |
    |   | element1    |  | element2 |  |
    |   ---------------  ------------  |
    |                                  |
    ------------------------------------

    element1.onclick = doSomething;
    element2.onclick = doSomething;
    document.onclick = defaultFunction;

现在如果用户点击了 element1 或者 2，doSomething 就会被执行。如果你想的话，你可以在这里面停止事件冒泡。
如果你不这样做，事件就会冒泡到 `defaultFunction`。
如果用户在任何其他地方点击，`defaultFunction` 也会被执行。
这有时候会很有用。

设置 document 级别的事件在拖拽脚本中是有用的。
典型地，一个发生在层上的 `mousedown` 事件会选中这个层，并且这个层会对 `mousemove` 事件做出响应。虽然一般 `mousedown` 事件会注册在这个层上以预防浏览器 Bug，但是其他两个事件都是注册在整个 document 上的。

记住浏览器科学第一法则：任何事情都可能发生，如果你准备不足，它通常都会真的发生。
所以可能用户会移动他的鼠标非常远，这样脚本就跟不上了，所以鼠标就已经不在这个层上了。

+ 如果 `onmousemove` 监听器是注册在这个层上的，那么这个层就已经不能对鼠标移动做出响应了，这就导致了用户的困惑。
+ 如果 `onmouseup` 监听器是注册在层上，当用户已经放下了层，这个事件可能仍然没有被触发，还在继续响应鼠标移动。这将可能导致更大的困惑。

所以在上面这个例子中事件冒泡是非常有用的，因为把事件监听器注册在 document 级别上可以确保他们始终都会被执行。

###关闭

但是通常来说，你可能想关闭所有的事件捕获和冒泡，来让方法不要互相干涉。另外，如果你的页面结构非常复杂（例如包含了很多嵌套的表格），你可能想通过关闭冒泡来节省系统资源。
浏览器需要遍历事件触发者的每个祖先元素来检查是否有一个事件监听器。
即使一个都没有，这个遍历仍然是耗时的。

在 `Microsoft` 模型中，你需要设置事件的 `cancelBubble` 属性为 `true`:

    window.event.cancelBubble = true;

在 `W3C` 模型中你必须要调用事件的 `stopPropagation` 方法：

    e.stopPropagation();

这样就阻止了事件的冒泡语法。一个跨浏览器的方法是：

    function doSomething(e)
    {
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    }

如果浏览器不支持 `cancelBubble`，设置也没有什么坏影响。
浏览器只是简单创建了这个属性。
当然它实际上是没有取消点冒泡的，不过这样设置也是安全的。

###currentTarget

在上面我们可以看出来，一个事件包含了一个 `target` 或者 `srcElement` 用来包含一个对事件发生元素的引用。在我们的例子中，就是用户点击的 element2。

理解在事件捕获或者冒泡过程中这个 `target` 始终保持不变是非常重要的：它始终引用着 element2。

但是假设我们像这样注册事件监听器：

    element1.onclick = doSomething;
    element2.onclick = doSomething;

如果用户点击 `element2` 那么 `doSomething` 就会被执行两次。但是我们怎么知道当前是哪一个元素捕获了这个事件呢？
`target/srcElement` 上没有线索，他们始终是指向原始触发事件的元素：element2。

为了解决这个问题 `W3C` 添加了一个属性 `currentTarget` 。它包含了到当前触发事件元素的引用：这正是我们想要的。非常不幸的是 `Microsoft` 模型不包含类似属性。

你也可以使用 `this` 关键字。在上面的例子中它会引用事件触发的元素，就像 `currentTarget` 一样。

###Microsoft 模型的问题

但是当你使用 Microsoft 事件注册模型的时候 `this` 关键字不是引用到 HTML 元素的。而且 Microsoft 模型又缺乏类似 `currentTarget` 的属性，这意味着这样的脚本：

    element1.attachEvent('onclick',doSomething)
    element2.attachEvent('onclick',doSomething)

中你 **无法** 知道当前是哪个元素触发了这个事件。这就是 Microsoft 模型在事件注册上最严重的问题，由于这个原因，我永远都不会这样用，即使不仅仅是 IE/Win 应用。

我希望 Microsoft 能够尽快添加一个类型 `currentTarget` 的属性，或者甚至遵守标准？Web 开发者需要这个信息。

###继续

如果你希望继续了解所有的事件页面，你应该继续查看 [鼠标事件](http://www.quirksmode.org/js/events_mouse.html)页面。

-EOF-

原文地址: <http://www.quirksmode.org/js/events_order.html>

