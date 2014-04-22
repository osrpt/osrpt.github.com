---
layout: post
title: WPF教程（五）：依赖属性
---

[源代码下载](/images/post/wpf5/BindingDP.zip)

###目录

+ 介绍
+ 新的属性系统
    * 依赖属性和CLR属性的区别
    * 依赖属性的优势
+ 怎样定义依赖属性
    * 为属性定义元数据
    * 注意集合类型的依赖属性
    * 属性值继承
+ 结论

###介绍

WPF带来了很多传统 Windows 应用程序没有的新特性和选择。我们已经讨论了一些 WPF 的特性，是时候更进一步介绍其他特性了。当你读完这个系列之前的文章，我希望你已经或多或少地了解了 WPF 的体系结构，边框，效果，转换，标记扩展等。如果还没有，你可以下面的链接查看以前的文章：

* [WPF Tutorial : Beginning [^]](http://www.codeproject.com/KB/WPF/wpf1.aspx)
* [WPF Tutorial : Layout-Panels-Containers & Layout Transformation [^]](http://www.codeproject.com/KB/WPF/wpf2.aspx)
* [WPF Tutorial : Fun with Border & Brush [^]](http://www.codeproject.com/KB/WPF/wpf3.aspx)
* [WPF Tutorial - TypeConverter & Markup Extension [^]](http://www.codeproject.com/KB/WPF/wpf4.aspx)
* [WPF Tutorial - Dependency Property [^]](http://www.codeproject.com/KB/WPF/wpf5.aspx)
* [WPF Tutorial - Concept Binding [^]](http://www.codeproject.com/KB/WPF/wpf6.aspx)
* [WPF Tutorial - Styles, Triggers & Animation [^]](http://www.codeproject.com/KB/WPF/wpf7.aspx)

在这篇文章中，我将介绍一种新的支撑 WPF 属性系统的属性系统。我们将介绍通过全新的依赖属性你可以怎么容易地创建自定义回调，附加属性，应用动画和样式等。最后，我将讨论前文中遗留的绑定选择问题。我希望你能喜欢这篇文章，就像这个系列中其他的文章一样。

###新的属性系统

好吧，看到这个标题你可能觉得有点经验。是的， WPF 带来了一种全新的定义控件属性的技术。新的属性单元是依赖属性，包装类也就是可以创建以来属性的类叫做 `DependencyObject` 。我们使用它来把一个依赖属性注册进属性系统来确保对象包含了这个属性，然后我们可以随时获得或设置这些属性的值。我们甚至可以使用普通 CLR 属性来包装一个依赖属性然后使用 GetValue 和 SetValue 来获取或设置传入的值。

这个几乎和 CLR 属性系统相同。所以，新的属性系统的好处是什么呢？让我们来看一下依赖属性和 CLR 属性的区别。

为了使用依赖属性，你的类必须继承自 `DependencyObject` ，它定义了一个观察者来保存定义在 `DependencyObject` 中的新的属性系统。

####依赖属性和 CLR 属性的区别

CLR 属性仅仅只是一个私有变量的包装器。它使用 `Get/Set` 方法来获取或设置变量的值。坦白地说， CLR 属性仅仅只是提供了一块可以在属性 get 或 set 时执行你写的代码的地方。因此 CLR 属性系统是非常直接了当的。

而另一边，依赖属性系统的能力是巨大的。依赖属性的想法是通过外部扩展值来计算属性的值。外部扩展输入可以是样式，主题，系统属性，动画等等。所以，你可以说一个依赖属性和 WPF 引入的大部分内置属性一起工作。

![mbos.JPG](/images/post/wpf5/mbos.JPG)

####依赖属性的优势

从事实上来说，依赖属性有比普通 CLR 属性更多的优势。在创建我们自己的依赖属性前让我们先看一些：

1. **属性值继承**：属性值继承意味着可以在继承中重写依赖属性，这样最后值将由最高优先级的确定。
2. **数据验证**：当属性值改变的时候，我们可以自动触发属性验证。
3. **参与动画**：依赖属性可以是动画的。WPF 动画有许多功能来在间隔时间内改变值。定义一个依赖属性，你就可以让这个属性支持动画。
4. **参与样式**：样式是定义控件的元素。我们可以在依赖属性上使用 `Style Setter` 。
5. **参与模板**：模板是定义元素整体结构的元素。通过定义依赖属性，我们可以在模板中使用它。
6. **回调**：在依赖属性中可以有回调，这样如果属性有任何改变都回触发回调。
7. **资源**：依赖属性可以使用资源。所以在 XAML 中，你可以定义在依赖属性中使用的资源。
8. **重写元数据**：你可以使用 `PropertyMetaData` 来定义依赖属性的某些行为。这样就能重写元数据来实现继承而不要求必须重新定义或实现整个属性定义。
9. **设计支持**：依赖属性受到 Visual Studio 设计器的支持。你可以在设计器的属性窗口中看到一个控件的依赖属性列表。

上面这些特性中的一些只有依赖属性支持。动画，样式，模板，属性值继承等只能使用依赖属性加入。如果在这些情况下使用 CLR 属性，编译器将产生错误。

###怎样定义一个依赖属性

终于到了写代码的时候了，让我们看一下可以怎样定义一个依赖属性：

    public static readonly DependencyProperty MyCustomProperty = 
    DependencyProperty.Register("MyCustom", typeof(string), typeof(Window1));
    public string MyCustom
    {
        get
        {
            return this.GetValue(MyCustomProperty) as string;
        }
        set
        {
            this.SetValue(MyCustomProperty, value);
        }
    }

我在上面的代码中定义了一个简单的依赖属性。你可能觉得奇怪为什么一个依赖属性剧场被定义为 static 的。是的，跟你一样，第一次看到的时候我也被吓到了。但是当我了解了依赖属性后，我开始知道为什么一个依赖属性是在类级别的了，你可以说 Class A 有一个属性 B。所以属性 B 将被类 A 的所有对象拥有。依赖属性这样就为类 A 创建了一个对所有这些属性的观察者并且保存在这里。所以注意到依赖属性应该使用 static 声明是非常重要的。

依赖属性的命名习俗是他应该跟传入的第一个参数同名。在我们的例子中，我们将在程序中使用的包装器 `MyCustom` 的名字应该传入作为 `Register` 方法的第一个参数，同时依赖属性的名字是在原来包装器的名字上添加一个 `Property` 后缀。在我们的例子中，依赖属性的名字是 `MyCustomProperty` 。如果你不这样做，程序中的某些方法将出现异常。

同样应该注意的是不要在包装器重写自己的逻辑代码，因为它不会在属性被调用的时候每次都被调用。它会自己在内部调用 `GetValue` 和 `SetValue` 。如果你想在依赖属性被访问的时候执行自己的逻辑，应该使用回调。

####为属性定义元数据

定义好嘴简单的依赖属性之后，让我们来对它做一些增强。为了给依赖属性添加元数据，我们使用类 `PropertyMetaData` 的对象。如果你是在一个 `FrameworkElement` 中而不是像我这样在 `UserControl` 或 `Window` 中，你应该使用 `FrameworkMetaData` 而不是 `PropertyMetaData`。让我们看一下代码：

    static FrameworkPropertyMetadata propertymetadata = 
    new FrameworkPropertyMetadata("Comes as Default",
     FrameworkPropertyMetadataOptions.BindsTwoWayByDefault | 
    FrameworkPropertyMetadataOptions.Journal,new 
    PropertyChangedCallback(MyCustom_PropertyChanged),
    new CoerceValueCallback(MyCustom_CoerceValue),
    false, UpdateSourceTrigger.PropertyChanged);
    
    public static readonly DependencyProperty MyCustomProperty = 
    DependencyProperty.Register("MyCustom", typeof(string), typeof(Window1),
    propertymetadata, new ValidateValueCallback(MyCustom_Validate));
    
    private static void MyCustom_PropertyChanged(DependencyObject dobj, 
    DependencyPropertyChangedEventArgs e)
    {
          //当依赖属性改变的时候将被调用
          MessageBox.Show(string.Format(
             "Property changed is fired : OldValue {0} NewValue : {1}", e.OldValue, e.NewValue));
    }
    
    private static object MyCustom_CoerceValue(DependencyObject dobj, object Value)
    {
        //当依赖属性的值被重新计算时调用，返回最近设置的值。
        MessageBox.Show(string.Format("CoerceValue is fired : Value {0}", Value));
        return Value;
    }
    
    private static bool MyCustom_Validate(object Value)
    {
        //对给依赖属性设置的值进行自定义的验证
        //根据验证通过与否返回 true 或 false
        MessageBox.Show(string.Format("DataValidation is Fired : Value {0}", Value));
        return true;
    }
    
    public string MyCustom
    {
        get
        {
            return this.GetValue(MyCustomProperty) as string;
        }
        set
        {
            this.SetValue(MyCustomProperty, value);
        }
    }

这段代码稍微有点复杂了。我们定义了一个 `FrameworkMetaData` 并且我们已经为依赖属性设置了初始值为 `Comes as Default` ，所以如果我们不改变依赖属性的值，它将一直把这个值作为默认值。 `FrameworkPropertyMetaDataOption` 可以用来为依赖属性计算元数据的类型。让我们看一下枚举的一些选项：

+  *AffectsMeasure*：调用对象放置处的 Layout 元素的 `AffectsMeasure`
+  *AffectsArrange*：调用布局元素的 AffectsArrange
+  *AffectsParentMeasure*：调用父元素的 AffectsMeasure
+  *AffectsParentArrange*：调用父元素的 AffectsArrange
+  *AffectsRender*：当值改变的时候重新渲染控件
+  *NotDataBindable*：禁用数据绑定
+  *BindsTwoWayByDefault*：默认地，数据绑定是 `OneWay（单向）` 的。使用这个让你的属性默认是双向绑定的。
+  *Inherits*：确保子控件从基类继承值。

你可以使用 `|` 来应用多个选项，就像标志那样。

当属性值被改变时将调用 `PropertyChangedCallback` 。`CoerceValue` 将会在值被改变之前被调用。意思就是当 `CoerceValue` 被调用后返回的值将会被赋给属性。在 `CoerceValue` 被调用前，验证代码块将先执行，这样就确保了传入给属性的值是否合法。在验证中，你需要返回 true 或者 false 。如果返回值是 false ，运行时将产生一个异常。所以你运行上面的代码后， MessageBox 将以下面的顺序返回：

+ **ValidateCallback**：你需要放入验证传入的数据也就是参数 Value 的逻辑代码。返回 True 将采用这个值， false 将抛出一个异常。
+ **CoerceValue**：可以根据传入的值修改或者改变值。它同样接收依赖属性作为一个参数。你可以在 `CoerceValue` 中调用依赖属性关联的 `CoerceValueCallback` 。
+ **PropertyChanged**：这是当值被修改之后你最后看到的消息框。你可以从 `DependencyPropertyChangedEventArgs` 中获得 `OldValue` 和 `NewValue` 。

####关于集合类型的依赖属性需要注意的

`CollectionType` 依赖属性是当你想维护一个集合的依赖属性。我们在项目中经常需要这样做。一般来说，当你创建了一个依赖属性并且传入了初始值，初始值不会是你创建的每个对象实例的初始值。反而，依赖属性的初始值应该是注册的类型的初始值。这样，如果你想创建一个集合的依赖对象并且你希望你的对象有自己的初始值，你需要给每个单独的集合项分配初始值而不是使用元数据定义。举个例子：

    public static readonly DependencyPropertyKey ObserverPropertyKey = DependencyProperty.RegisterReadOnly("Observer", typeof(ObservableCollection<Button>),typeof(MyCustomUC),new FrameworkPropertyMetadata(new ObservableCollection<Button>()));
    
    public static readonly DependencyProperty ObserverProperty = 
         ObserverPropertyKey.DependencyProperty;
    
    public ObservableCollection<Button> Observer
    {
        get
        {
            return (ObservableCollection<Button>)GetValue(ObserverProperty);
        }
    }

在上面的代码中，我使用 `RegisterReadonly` 声明了一个 `DependencyPropertyKey` 。`ObservableCollection` 实际上是一个集合的最后是一个依赖对象的  `Button` 。

现在如果你使用这个集合，你将发现当你创建 UserControl 的对象，它们中的每一个都是指向同一个依赖属性而不是由自己的依赖属性。根据定义，每个依赖属性根据类型来分配内存，如果对象2创建了依赖属性的一个实例，它将覆盖对象1的集合。因此这个对象将像一个单例类一样。为了处理这种情况，你需要在类的新实例创建的时候重新设置集合。因为属性是制度的，你需要使用 `DependencyPropertyKey` 调用方法 `SetValue` 创建新的实例。

    public MyCustomUC()
    {
        InitializeComponent();
        SetValue(ObserverPropertyKey, new ObservableCollection<Button>());
    }

对每个实例来说，每个集合都将被重置因此你可以给每个创建的 UserControl 一个唯一的集合。

####属性值继承

依赖属性支持属性值继承。通过定义，当你创建了一个自己的依赖属性，你可以容易地使用依赖属性关联的 `AddOwner` 方法为所有的子控件继承依赖属性。

每个依赖属性都有 `AddOwner` 方法，用来创建一个对另外一个已经定义的依赖属性的连接。比如你有一个依赖对象 A ，它有一个属性叫做 `Width` 。如果你想依赖对象 B 的值继承 A 的值。

    public class A :DependencyObject
    {
        public static readonly DependencyProperty HeightProperty =  DependencyProperty.Register("Height", typeof(int), typeof(A), new FrameworkPropertyMetadata(0, FrameworkPropertyMetadataOptions.Inherits));
        
        public int Height
        {
            get
            {
                return (int)GetValue(HeightProperty);
            }
            set
            {
                SetValue(HeightProperty, value);
            }
        }
        
        public B BObject { get; set; }
    }
    
    public class B : DependencyObject
    {
        public static readonly DependencyProperty HeightProperty;
    
        static B()
        {
            HeightProperty = A.HeightProperty.AddOwner(typeof(B),new FrameworkPropertyMetadata(0, FrameworkPropertyMetadataOptions.Inherits));
        }
    
        public int Height
        {
            get
            {
                return (int)GetValue(HeightProperty);
            }
            set
            {
                SetValue(HeightProperty, value);
            }
        }
    }

在上面的代码中，你可以看到，类 B 使用 `AddOwner` 继承了依赖属性 Height 而不是在类中声明同样的。这样当 A 声明的时候，如果声明 A 的高度，它将自动传给被继承的对象 B 。

这跟普通的对象一样。当你声明了窗口的前景色，它将自动继承给所有的子元素，因此每个控件都有了同样的前景色。

**更新：**

虽然所有的依赖属性都可以使用属性值继承，但实际上只有附加属性 `AttachedProperties` 是有效的。我现在才知道属性值继承只有当属性作为附加属性时才有效。如果你同时给附加的属性设置了默认值和 `FrameworkMetaData.Inherits` ，子元素将自动继承父元素的属性值并且子元素可以修改值。查看 [MSDN](http://msdn.microsoft.com/en-us/library/ms753197.aspx) 获得详情。所以我上面的例子其实并不太合适，但是你看完下一节之后应该可以很容易自己创建一个。

####附加属性

附加属性是另外一个有趣的概念。附加属性允许你在对象外面给对象附加一个属性，并且用这个对象来定义属性的值。有点迷惑？好的，让我们来看一个例子：

假设你有一个 `DockPanel` ,其中包含一些你想显示的控件。现在 `DockPanel` 注册了一个附加属性：

    public static readonly DependencyProperty DockProperty = DependencyProperty.RegisterAttached("Dock", typeof(Dock), typeof(DockPanel),new FrameworkPropertyMetadata(Dock.Left, new PropertyChangedCallback(DockPanel.OnDockChanged)),new ValidateValueCallback(DockPanel.IsValidDock));

可以看出，上面的代码中 `DockProperty` 作为附加属性 `Attached` 定义在 `DockPanel` 中。我们使用 `RegisterAttached` 方法来注册附加的依赖属性。这样任何 `DockPanel` 的子 UI 元素将获的附加的 `Dock` 属性从而可以自定义其值并能自动传播到 `DockPanel` 上。

下面让我们来声明一个附加依赖属性：

    public static readonly DependencyProperty IsValuePassedProperty = DependencyProperty.RegisterAttached("IsValuePassed", typeof(bool), typeof(Window1),new FrameworkPropertyMetadata(new PropertyChangedCallback(IsValuePassed_Changed)));

    public static void SetIsValuePassed(DependencyObject obj, bool value)
    {
        obj.SetValue(IsValuePassedProperty, value);
    }

    public static bool GetIsValuePassed(DependencyObject obj)
    {
        return (bool)obj.GetValue(IsValuePassedProperty);
    }

这里我定义了一个值为 `IsValuePassed` 的依赖属性。对象被绑定到 `Window1` 上，所以你可以从任何 UI 元素上传递值给 `Window1` 。

所以在我的代码中， `UserControl` 可以传递值给窗口：

    <local:MyCustomUC x:Name="ucust" Grid.Row="0" local:Window1.IsValuePassed="true"/>

在上面的代码中你可以看到 `IsValuePassed` 的值可以在外部 UserControl 被设置，同时值会传递给窗口。如你所见，我在对象中添加了两个静态方法 `get` 和 `set` 。这可以用来确保值是从适当的对象传递过来的。例如，你想从一个 `Button` 上传递这个值，你可以这样写：

    private void Button_Click(object sender, RoutedEventArgs e)
    {
         Window1.SetIsValuePassed(this, !(bool)this.GetValue(IsValuePassedProperty));
    }

同样的方式，`DockPanel` 定义了 `SetDock` 方法。

###总结

总的来说，依赖属性是一个你应该在编写 WPF 应用之前就了解的最重要也是最有意思的概念。有很多场景下你需要定义依赖属性。在这篇文章中，我已经带你基本了解了依赖属性每个方面。我希望这篇文章对你有帮助。感谢阅读。期待得到你的反馈。