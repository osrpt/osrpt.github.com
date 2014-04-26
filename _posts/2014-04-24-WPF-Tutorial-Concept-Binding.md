---
layout: post
title: WPF教程（六）：概念绑定
---

###目录
* 介绍
* WPF 中的绑定
    + 数据绑定/对象绑定
        - 为什么使用 ObservableCollection
    + XML 绑定
* DataContext 的重要性
* 绑定成员
* 后台代码中的绑定
* 命令绑定
* 多重绑定
* 总结

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

数据绑定技术是在 WPF 技术之前就出现了。在 ASP.NET 中，我们通过绑定数据元素来渲染控件中适当的数据。我们通常传入一个 DataTable 并且绑定模板来获得独立的 DataRow 的数据。另外，在传统的 windows form 应用程序中，我们也可以把属性绑定到数据元素上。给对象的属性添加绑定可以确保当属性值发生改变时内部可以反正到数据。所以一句话说来，数据绑定不是什么新的东西。数据绑定是用来在应用程序中轻松展示数据的，从而可以减少开发人员为了显示数据而编写大量的代码。在这片文章中我将讨论如何在 WPF 中使用数据绑定技术并提供一个简单的示例程序。

###WPF 中的绑定

WPF 推广了数据绑定的概念并引进了很多新特性，这样我们可以更广泛地使用绑定特性。绑定在应用程序和业务层之间建立了联系。如果你希望你的程序遵循严格的设计规则，数据绑定可以帮你实现。我们将在稍后详细讨论如何实现。

绑定可以分为以下几类：

####数据绑定/对象绑定

数据绑定是最主要也是最重要的。WPF 引入了可以声明在 XAML 中的对象 `ObjectDataProvider` 和 `XMLDataProvider` 来增强对象绑定的能力。数据绑定可以通过多种方式实现。就像 [这篇博客](http://coredotnet.blogspot.com/2006/05/wpf-data-binding-tutorial.html) 中说的，我们可以通过 XAML，XAML+C# 或者单独的 C# 代码来使用数据绑定。所以 WPF 有足够的灵活性来处理任何问题。

    <TextBox x:Name="txtName" />
    <TextBlock Text="{Binding ElementName=txtName, Path=Text.Length}" />

上面的代码中展示了最基本的绑定应用。TextBlock 的 Text 属性被绑定到了名字为 txtName 的 TextBox 上面，当你在 txtName 这个输入框中输入任何字符串的时候 TextBlock 将显示字符串的长度。因为标记扩展实际上就是一个有多个属性的类，这里我们声明了属性  ElementName 和 Path 的值。ElementName 确定属性所属的对象。Path 决定在对象中查找的路径。

你可以在 XAML 中很轻松地使用 `ObjectDataProvider` 来保存数据。`ObjectDataProvider` 可以作为资源添加到 XAML 中并且在之后使用 `StaticResource` 来引用。让我们看看下面的代码：

    <StackPanel Orientation="Vertical">
        <StackPanel.Resources>
            <ObjectDataProvider ObjectType="{x:Type m:StringData}" x:Key="objStrings" MethodName="GetStrings"/>
        </StackPanel.Resources>
        <ListBox Name="lstStrings" Width="200" Height="300" ItemsSource="{Binding Source={StaticResource objStrings}}" />
    </StackPanel>

在上面的代码中，ObjectType 将得到一个 Type ，其方法 GetStrings 将被调用。在 ListBox 中，我使用静态资源引用了该对象。现在在下面的代码中，你可以声明一个类：

    public class StringData
    {
        ObservableCollection<String> lst= new ObservableCollection<String>();
    
        public StringData()
        {
            lst.Add("Abhishek");
            lst.Add("Abhijit");
            lst.Add("Kunal");
            lst.Add("Sheo");
        }
    
        public ObservableCollection<String> GetStrings()
        {
            return lst;
        }
    }

这样你就可以看到列表将被这些字符串填充。

**为什么是 ObservableCollection ? 什么又是 INotifyPropertyChanged ， INotifyCollectionChanged ? **

在上面的代码中，我使用了 ObservableCollection 。这很重要。ObservableCollection 在新的列表项插入时将自动发送通知。这里即是通知 ListBox 更新列表。加入你放一个按钮用来给 ObservableCollection 插入数据，绑定将自动被通知从而更新集合。你不需要手动地在列表中插入同样的值。WPF 绑定通常需要当值修改的时候被通知。接口 `INotifyPropertyChanged` 和 `INotifyCollectionChanged` 被用来更新绑定了数据的 UI 元素。 如果创建了一个值改变时需要更新 UI 的属性，你只需要实现接口 INotifyPropertyChanged ，如果是集合（就像 ItemsSource），需要实现 INotifyCollectionChanged 。ObservableCollection 本身已经实现了 INotifyCollectionChanged ，所以他本身就支持当新的项被添加或者旧的项被移除的时候更新控件。我在另外一篇文章中已经详细讨论过了这两个： [修改对象或者集合的通知](http://www.abhisheksur.com/2010/05/object-notifiers-using.html)

相反地， Sacha 有一个非常好的关于抛弃 INotifyPropertyChanged 接口而使用 [切面](http://www.codeproject.com/KB/miscctrl/Aspects.aspx) （INotifyPropertyChanged 就是通过切面来实现的） 的观点。

####XML 绑定

跟对象绑定相似， XAML 也支持绑定。你可以使用 Binding 类内置的属性 XPath 很容易地绑定 XMLDataProvider 提供的数据。让我们看看下面的代码：

    <TextBlock Text="{Binding XPath=@description}"/>
    <TextBlock Text="{Binding XPath=text()}"/>

所以，如果你在节点 XYZ 中，InnerText 可以通过属性 text() 来获取到。 `@` 标记用于属性。这样，使用 XPath 可以很好地处理 XAML 。如果你想阅读更多关于 XAML 绑定的内容，请查看 [WPF 中的 XML 绑定](http://www.abhisheksur.com/2010/07/xml-binding-in-wpf-with-sample-rss.html)

###DataContext 的重要性

你可能觉得有点奇怪为什么我在讨论 WPF 绑定的时候讲到 DataContext 。DataContext 实际上是一个依赖属性。它指向原始数据，我们传递给 DataContext 的对象可以传递给所有的子控件。意思即使如果为 Grid 定义了 DataContext ，然后 Grid 中的所有元素都将得到同样的 DataContext 。

    <Grid DataContext="{StaticResource dtItem}">
        <TextBox Text="{Binding MyProperty}" />
    </Grid>

上面的代码中我为 Grid 定义了一个 DataContext ， Grid 中的 TextBox 可以引用 MyProperty 属性，因为 dtItem 将会自动继承给所有的子元素。当使用绑定的时候， DataContext 是你必须使用的最重要的部分。

###绑定成员

大家已经了解过标记扩展了，实际上绑定也是一种标记扩展。它是一个有着多个属性的 Binding 类。让我们讨论一下绑定类中的一些成员：

1. **Source**：Source 属性持有 DataSource 。默认地，它引用控件的 DataContext 。如果你为绑定放入了 Source 属性，他将替换原来的 DataContext 。
2. **ElementName**：如果想要引用定义在 XAML 中的另外的元素，可以使用 ElementName 。ElementName 是作为 Source 的替代。如果绑定的 Path 没有定义，它将使用作为 Source 传递对象的 ToString 来获得数据。
3. **Path**：Path 定义了获得字符串数据的真实属性路径。如果最后发现不是一个字符串，他将调用 ToString 来获得数据。
4. **Mode**：它定义了数据如何传递。 OneWay 意味着对象只会在 source 更新时才更新，OneWayToSource 则相反。TwoWay 意味着数据双向传递。
5. **UpdateSourceTrigger**：这是绑定中另外一个重要的部分。它定义了 source 合适更新。它的值可以是：
    + **PropertyChanged**：这是默认值。当控件中发生任何更新，另外绑定的元素将反射到同样的更改。
    + **LostFocus**：意思是在属性失去焦点的时候才会得到更新。
    + **Explicit**：如果使用这个值，你必须显示地设置何时更新 Source 。你可以使用绑定表达式的 UpdateSource 来更新控件：

            BindingExpression bexp = mytextbox.GetBindingExpression(TextBox.TextProperty);
            bexp.UpdateSource();

    通过这样的方式，source 将得到更新。

6. **Converter**：