---
layout: post
title: WPF教程（六）：概念绑定
---

###目录

+ 介绍
+ WPF 中的绑定
    * 数据绑定/对象绑定
        - 为什么使用 ObservableCollection
    * XML 绑定
+ DataContext 的重点
+ 绑定成员
+ 后台代码中的绑定
+ 命令绑定
+ 多重绑定
+ 总结

###介绍

在这篇文章之前，我已经讨论了 WPF 的体系结构，标记扩展，依赖属性，逻辑树/可视化树，布局，转换等。今天，我们将讨论 WPF 最重要的一部分——绑定。WPF 带来了优秀的数据绑定方式，可以让我们绑定数据对象，这样每次对象发生更改都能引发对应的改变。数据绑定最主要的目的是确保 UI 上的改变总是自动和内部的对象结构同步。在进一步讨论前，我们先看一下我们已经讨论过的问题。如果你是第一次看这篇文章，你可以从下面列表中的其他文章开始：

+ [WPF Tutorial : Beginning [^]](http://sibo.me/2014/04/02/WPF-Tutorial-Beginning.html)
+ [WPF Tutorial : Layout-Panels-Containers & Layout Transformation [^]](http://sibo.me/2014/04/08/WPF-Tutorial-Layout-Panels-Containers-Layout-Trans.html)
+ [WPF Tutorial : Fun with Border & Brush [^]](http://sibo.me/2014/04/12/WPF-Tutorial-Fun-with-Border-Brush.html)
+ [WPF Tutorial - TypeConverter & Markup Extension [^]](http://sibo.me/2014/04/16/WPF-Tutorial-TypeConverter-Markup-Extension.html)
+ [WPF Tutorial - Dependency Property [^]](http://sibo.me/2014/04/19/WPF-Tutorial-Dependency-Property.html)
+ [WPF Tutorial - Concept Binding [^]](http://www.codeproject.com/KB/WPF/wpf6.aspx)
+ [WPF Tutorial - Styles, Triggers & Animation [^]](http://www.codeproject.com/KB/WPF/wpf7.aspx)

![binding.jpg](/images/post/wpf6/binding.jpg)

数据绑定技术是在 WPF 技术之前就出现了。在 ASP.NET 中，我们通过绑定数据元素来渲染控件中适当的数据。我们通常传入一个 DataTable 并且绑定模板来获得独立的 DataRow 的数据。另外，在传统的 windows form 应用程序中，我们也可以把属性绑定到数据元素上。给对象的属性添加绑定可以确保当属性值发生改变时内部可以反正到数据。所以一句话说来，数据绑定不是什么新的东西。数据绑定是用来在应用程序中展示数据