---
layout: post
title: WPF教程：类型转换器和标记扩展[译]
---
###目录
+ 介绍
+ 类型转换器
    * 自定义类型转换器
        - 一个转换地理点的类型转换器
    * 标记扩展
        - 异常
    * 空扩展
    * 数组扩展
    * 静态扩展
    * 类型扩展
    * 引用
    * 静态资源扩展
    * 动态资源扩展
+ 什么是资源？
+ 在静态资源和动态资源中做出选择？
+ 绑定
+ 相对资源
+ 模板绑定
+ 多重绑定
+ 自定义标记扩展
+ 总结

###介绍
在之前的文章中，我已经讨论了WPF的基础架构，然后逐步开始学习布局面板，转换，介绍了不同的控件，容器，UI转换等。在这篇文章中，我将讨论每个创建XAML应用前的开发人员应该了解的关于XAML最重要的东西。

标记扩展是一种对XAML的扩展，你可以用来对基于XAML的程序应用自定义的规则。在你的设计中，你如果有任何的想对你的程序施加的自定义行为，你都可以使用标记扩展来实现。这里我们将讨论你可以怎样使用标记扩展对XAML生成自定义的行为。

XAML或者说可扩展应用程序标记语言实际上是一种定义了特殊架构的XML格式的语言。现在你可能经常想知道，标记到底能怎样扩展。XAML中到底有什么样的能力使其与XML大不相同。似的，它是因为有着大量的功能的XAML转换器把普通的XAML转换成了丰满的UI设计。

大家都知道XAML实际上是文本格式。它的标签和XML非常相似，每个属性的值都是字符串。尽管你想把一个对象赋给一个字符串，但是因为对象只能有一个字符串，所以你不能这样做。标记扩展将允许你处理这些情况。所以你可以说一个标记扩展实际上是一种把普通的XML扩展成为一个完成的可扩展的标记的方式——即是XAML。

* [WPF Tutorial : Beginning [^]](http://www.codeproject.com/KB/WPF/wpf1.aspx)
* [WPF Tutorial : Layout-Panels-Containers & Layout Transformation [^]](http://www.codeproject.com/KB/WPF/wpf2.aspx)
* [WPF Tutorial : Fun with Border & Brush [^]](http://www.codeproject.com/KB/WPF/wpf3.aspx)
* [WPF Tutorial - TypeConverter & Markup Extension [^]](http://www.codeproject.com/KB/WPF/wpf4.aspx)
* [WPF Tutorial - Dependency Property [^]](http://www.codeproject.com/KB/WPF/wpf5.aspx)
* [WPF Tutorial - Concept Binding [^]](http://www.codeproject.com/KB/WPF/wpf6.aspx)
* [WPF Tutorial - Styles, Triggers & Animation [^]](http://www.codeproject.com/KB/WPF/wpf7.aspx)

由于XAML把任何东西都当成字符串，有事我们需要把这些字符串转换为有效的值。举个例子：当我们使用 `Margin` 的时候，我们需要声明 margin 元素的每个值。在这种情况下，转换非常的简单和直接，我们可以使用类型转换器而不是使用标记扩展。在我们讨论标记扩展前，首先我们来讨论一下类型转换器。

###类型转换器

在上文中我已经说过了，XML的标记扩展不能对元素的数据施加限制。意思就是你在XAML中只能声明对象的属性为字符串数据。但是XAML提供了一个灵活的方式来创建类型转换器，这样就可以对数据施加限制了。甚至像 Single 和 Double这样的原语你都不能在XAML中描述。类型转换器扮演了一个重要的角色来把这种限制加到XAML转换器上。

![TYPECONVERTERMAIN.JPG](/images/post/wpf4/TYPECONVERTERMAIN.JPG)