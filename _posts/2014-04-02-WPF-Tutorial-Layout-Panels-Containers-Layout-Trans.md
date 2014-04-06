---
layout: post
title: WPF教程：布局，容器和布局转换[译]
tags:
- wpf
- tutorial
---

###目录
* 介绍
* 窗口
    + 窗口类型
* 容器类型
* 对齐、外边距，内边距
* 容易布局
    + 布局
    + 自定义布局
    + 表格(Grid)
        - 行和列的大小
    + StackPanel
    + WrapPanel
    + DockPanel
    + VirtualizingStackPanel
    + Canvas
    + UniformGrid
    + ScrollViewer
    + GroupBox
    + Expander
    + ViewBox
    + Popup
    + InkCanvas
* 变换
* 结语
* 文章更改历史

###概要
在上一篇文章中，我讨论了一些WPF应用的基础知识，它们是使用WPF的基本架构和内部结构。在本文中，我将讨论编写你的第一个WPF程序的基本的东西和怎么在你的窗口中布局控件。这是每一个想使用WPF的人应该知道的最基础的知识。我将讨论最常用的一些。

* [WPF Tutorial : Beginning [^]](http://www.codeproject.com/KB/WPF/wpf1.aspx)
* [WPF Tutorial : Layout-Panels-Containers & Layout Transformation [^]](http://www.codeproject.com/KB/WPF/wpf2.aspx)
* [WPF Tutorial : Fun with Border & Brush [^]](http://www.codeproject.com/KB/WPF/wpf3.aspx)
* [http://www.codeproject.com/KB/WPF/wpf4.aspx](http://www.codeproject.com/KB/WPF/wpf4.aspx)
* [WPF Tutorial - Dependency Property [^]](http://www.codeproject.com/KB/WPF/wpf5.aspx)
* [WPF Tutorial - Concept Binding [^]](http://www.codeproject.com/KB/WPF/wpf6.aspx)
* [WPF Tutorial - Styles, Triggers & Animation [^]](http://www.codeproject.com/KB/WPF/wpf7.aspx)

###窗口
当你创建WPF程序的时候，你最先注意到的是一个窗口。窗口是用户交互，产生窗口和弹出窗的生命周期的最主要的类。像普通的windows程序一样，它使用基本的API来产生窗口对象。一个窗口有两个部分：

1. `Non-Client Area`：非客户端区域，它显示窗口的外边界，就像我们在其他普通窗口中看到的那样。其中最主要的部分是图标，系统菜单，标题栏，和边框。
2. `Client part`：客户端部分，这是WPF控件呈现的最主要的部分。你可以使用WPF来自定义这部分。

####窗口的类型
WPF窗口有三个类型：

1. `Window`：这是一个普通窗口化程序的基本的类型，每个控件都放在同一个窗口中。跟我之前说的那样，窗口就像平常那样显示。客户端区域可以使用XAML完全进行定制。
2. `NavigationWindow`：这是从基本的窗口类型继承来的特殊窗口，在顶部拥有一个导航面板。如果你想创建一个向导程序，你可以使用导航窗口。你也可以把导航区域自定义为想要的外观。
3. `Page`：基本和导航窗口相似，最主要的区别是，`Page`窗口可以作为`XBAP`程序在浏览器中打开。

![windowTypes.JPG](/images/post/wpf2/windowTypes.JPG)

在上图中，你能够看出普通窗口和导航窗口的区别。导航窗口和普通的窗口有非常大的不同，但是当你的应用需要一些特殊的使用时它将非常有用。

我将说一点儿你怎么在应用中使用页面。

![Pages.JPG](/images/post/wpf2/Pages.JPG)

多个页面可以被创建用在同一个窗口中。从一个页面转到另外一个非常的简单。`Page`类暴露了一个`NavigationService`类的对象，你可以用来在不同的页面间进行导航。`NavigationService`对象还有很多事件，比如`Navigating`, `NavigationFailed`, `NavigationProgress`, `NavigationStopped`，等。你可以用来在页面正在重定向的过程中显示进度条。像`GoBack`, `GoForward`和`Navigate`这些方法是用来导航的最好的方式。

        private void Button_Click(object sender, RoutedEventArgs e)
        {
             this.NavigationService.Navigate(new Uri("Page2.xaml", UriKind.Relative));
        }

如你所见，我只是使用了`NavigationService`服务从一个页面重定向到另外一个页面，而不是调用一个新窗口。

如果想了解更多，你可以查看MSDN的文章：<http://msdn.microsoft.com/en-us/library/ms750478.aspx>

[see more&#10548;](http://www.codeproject.com/Articles/140613/WPF-Tutorial-Layout-Panels-Containers-Layout-Trans)
    
