---
layout: post
title: \[译\]WPF教程：入门
---

###目录
* 概要
* WPF介绍
* WPF的特性
* 什么是XAML？
* WPF结构
* 在继续前你必须知道的几件事：
    + 什么是Dispatcher和线程关联？
    + 什么是虚拟树和逻辑树？
    + 为什么使用路由事件？
    + 为什么使用依赖对象？
    + WPF如何做硬件加速和图形呈现？
* 对象层次结构
* 创建第一个WPF程序
* 结语

###概要
在我使用了半年多WPF后，是时候写点关于WPF基础方面的东西了。我已经发表了一系列针对具体问题的文章。现在是到了让大家明白为什么说WPF是一款在界面开发上带来革命的产品了。

本文针对初级-中级程序员，所以我尽量给出一些基础的示例。下面是该系列其他的文章的链接，方便大家查看：

* [WPF Tutorial : Beginning [^]](http://www.codeproject.com/KB/WPF/wpf1.aspx)
* [WPF Tutorial : Layout-Panels-Containers & Layout Transformation [^]](http://www.codeproject.com/KB/WPF/wpf2.aspx)
* [WPF Tutorial : Fun with Border & Brush [^]](http://www.codeproject.com/KB/WPF/wpf3.aspx)
* [http://www.codeproject.com/KB/WPF/wpf4.aspx](http://www.codeproject.com/KB/WPF/wpf4.aspx)
* [WPF Tutorial - Dependency Property [^]](http://www.codeproject.com/KB/WPF/wpf5.aspx)
* [WPF Tutorial - Concept Binding [^]](http://www.codeproject.com/KB/WPF/wpf6.aspx)
* [WPF Tutorial - Styles, Triggers & Animation [^]](http://www.codeproject.com/KB/WPF/wpf7.aspx)

###WPF介绍
![wpf](/images/post/wpf1/wpf.jpg)
