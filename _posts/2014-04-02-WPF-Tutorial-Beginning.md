---
layout: post
title: WPF教程：入门[译]
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
就像名字表示的那样，WPF是在.NET Framework 3.0引进的一个新框架，包含了很多可以更快速和方便地编写程序的类库。它使用了Direct3d技术来呈现界面。由于充分利用了机器硬件的优势，所以界面更加平滑。如果只能使用传统的GDI技术，就不能使用如此多的高级图形特性，所以Windows Form经常是效率低下的。另外要说明的是：Windows Form使用了操作系统原生的组件来创建程序，这样极大地限制了用户的自定义能力。WPF组件实际上是画在屏幕上的，所以在有必要的时候可以非常方便地进行自定义。

###WPF特性
WPF带来了非常多的高级特性，下面我们来看一些：

####设备独立的像素控制（DPI）
WPF引入了对程序的DPI设置。对一个窗口来说，计算屏幕上的每一英寸能容纳多少像素是非常重要的。这个通常依赖操作系统和硬件支持。任何用户都可以很容易地修改这些设置，这样导致了程序看起来非常丑陋。Windows Form程序使用DPI来控制程序的像素，每个空间都可以改变它的尺寸和外观。

WPF独立于DPI的设置。下面我们来看一个示例：

![WPFDPI](/images/post/wpf1/WPFDPI.JPG)

假设你画了一个上图中那样的盒子，1英寸长，屏幕设置为96DPI。现在如果屏幕设置为120DPI，盒子将看起来变小了。这是因为Windows Form程序依赖DPI设置。

WPF使用了基于密度的方法，意思就是如果像素密度修改了，元素也会自动调整，这就是DIP（依赖设备）。如上图中看到的那样，如果DPI变高，盒子将使用更多的像素来保持同样的大小。

####内置的对图形和动画的支持
WPF程序依赖DirectX环境，一种主要用来支持图形显示和动画能力的技术。有单独的库进行图形和动画处理。画出来的图形都是矢量的并且面向对象的。意思就是：如果在WPF中画一个矩形，可以很容易地从程序中通过持有的引用把这个矩形给移除掉。在Windows Form程序中，一旦你画了一个矩形，你就不能再单独选中这个矩形了。WPF使用的方式与传统的方式有非常大的差异。我们将在文章的后面更详细地讨论图形和动画。

####重新定义了风格和控件模板
除了图形和动画功能，WPF带来了极其灵活的风格和模板定义。如果你了解CSS技术，你应该知道Style是一个规定组件如何呈现的定义集合。如果是传统的Windows Form程序，风格设置被紧紧地绑定在每一个组件上，你必须要为每一个控件单独定义颜色，风格等。当使用WPF，风格文件是完全独立于UI组件的，一旦你定义了一种风格，你很简单地就可以把它用在元素上。

我们经常使用多个基本的控件来构成组件。WPF引入了一种新的模板机制可以让我们用来重新定义组件。举个例子，你定义了一个CheckBox——有一个矩形框和一个标题。使用WPF的模板，你可以重新定义将单选框放入到复选框中，这样就是原型的选择按钮而不是矩形的。非常有意思。我们将在后文单独使用一节来讲解风格和模板。

####每个控件都是基于资源的
另外一个重要的特性是：WPF是基于自愿的。在传统的Windows Form程序中，定义风格是非常复杂的。如果你有1000个按钮，你想让每一个按钮都是金色的，你不得不创建1000个Color对象并应用到每一个按钮上，这样将导致很大的资源浪费。

在WPF中，可以存储每一个风格，控件，动画甚至对象为资源。这些资源只有在程序启动的时候会初始化一遍，然后就可以使用到组件上。你可以把这些资源维护到一个单独的叫做资源字典的文件中，这样整个程序都可以使用。所以WPF程序可以很好的应用主题。

####新的属性系统和绑定功能
下面我必须得介绍一下WPF引入的新的属性系统。每个WPF的元素都定义了大量的依赖属性。这些依赖属性相比传统的属性有非常强的能力。当我定义我自己的新的属性的时候，我可以很容易地注册这个属性到任何我想注册的对象上。这样就可以添加到同一个观察者。因为每个元素都是派生自`DependencyObject`，所以每个元素包含了`Dependency Observer`。一旦你注册了一个属性作为依赖属性，在观察者上就会创建一个空间并且保存属性的值。我们将在本系列文章的后面更加详细地讨论这个问题。

###什么是XAML？
根据定义，XAML是一种基于XML的标记语言，用于声明和设置类的属性。换一种说法就是：XAML是一种被WPF，Silverlight或其他程序使用的可以自己定义类的语言。所以，在你的程序中，你可以声明变量，定义类的属性并直接使用它们。XAML转化器将在呈现程序的时候自动转换它们并且帮你创建对象。

XAML一般用于定义UI界面的布局，包括元素和静态的视觉方面。我们无法直接使用XAML定义程序流。虽然XAML有非常强大的能力，但是它仍然不是一门程序语言而只是用于定义程序的UI界面。XAML使用其他程序语言比如C#,VB.NET等来处理背后的逻辑。

`ExpressionBuilder` 是最好的生成XAML的工具。

###WPF体系结构
对每种新技术来说，对其体系结构的清楚了解都是至关重要的。在开始创建你的应用前，你至少应该对一些概念有所了解。如果你不想详细了解WPF，请跳过这一小节。前文中已经说过了，WPF实际上就是一组建立架构的类库。这些类库可以分为以下几类：

* 管理层(Managed Layer)
* 非管理层(UnManaged Layer)
* 内核API(Core API)

**管理层(Managed Layer)**: WPF的管理层由多个类库构成。这些类库构成了WPF架构，与底层的非管理层的API进行通信来呈现应用的内容。这些组成的类库是：

1. **PresentationFramework.dll**:创建上层的元素：如面板，控件，窗口，风格等
2. **PresentationCore.dll**:提供基础类型比如`UIElement`，PresentationFramework.dll中的所有形状和控件也从这个程序集中的基类派生
3. **WindowsBase.dll:**:这里提供更加基础的超出WPF程序环境的元素例如`Dispatcher`类型，`Dependency`类型。我将在稍后讨论这个。

**Unmanaged Layer (milcore.dll)**:WPF的非管理层就是所谓的`milcore`或者是媒体集成类库核心。他将基本的WPF高层的对象如面板，按钮，动画等翻译为Direct3D所需要的纹理。这是WPF的主要呈现引擎。

**WindowsCodecs.dll**:这是另外一个支持WPF应用呈现的底层API。WindowsCodecs.dll包括了大量的编码/解码器来把图片编码和解码为矢量图形。

**Direct3D**:这是呈现WPF图形的底层API

**Username2**：这是每个程序所用的主要核心API。用于管理内核和进程隔离。

**GDI & Device Drivers**：GDI和Device Drivers专用于需要访问底层API的操作系统。