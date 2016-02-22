---
layout: golang
title: Go 语言中面向对象的精华总结 -- 没有痛点
---

如果你还没有了解过相关的主题，请现在先去了解。
在这里我将总结我们已经学过的内容因此这是一个快速引用，尤其是对这些已经习惯于面向对象编程的人。

+ [Go 语言的结构](/golang_tutorials/structs-in-go-instead-of-classes-in.html)
+ [结构中的匿名字段](/golang_tutorials/anonymous-fields-in-structs-like-object.html)
+ [结构的方法](/golang_tutorials/methods-on-structs.html)
+ [Go 语言中的继承](/golang_tutorials/inheritance-and-subclassing-in-go-or.html)
+ [Go 语言中的接口](/golang_tutorials/interfaces-in-go.html)
+ [Go 语言中的多态](/golang_tutorials/polymorphism-in-go.html)

面向对象变成的基本信条是封装，继承，和多态。
但是它们不是 OOP 语言独占的。
Go 语言允许你在不处理它们复杂性的情况下获得这些重要的特性。
必须再次强调 Go 不是面向对象的。
所以你可能需要再次调整你的思路但这是值得的。
需要继承 Go 语言哲学和这些 OOP 语言哲学不一样。
所以即使我都喜欢，这样对比仅仅是为了理解和学习。

**封装**: 一种限制或者提供数据访问的能力和将行为或方法绑定到数据上的能力。
对 Go 语言来说一些主要的特性是：

+ 有两种级别的访问 -- 在包内，和公开。
+ 如果一个字段，类型，或者方法是以大写字母开头，那么它会被公开给包外。如果使用小写字母开头，就只能在包内可见。
+ 导出/公开项：`MyStruct`，`MyMethod`，`MyField`
+ 仅限于包内可见的项：`myStruct`,`myMethod`, `myField`
+ 可以通过将函数关连到类型来定义其方法/行为。 `func (m my_type) my_func() int {}`
+ 在当前包内，你可以给类型添加未定义的方法。

**继承**: 是一种一个类型拥有等级上它上面的类型的特性的能力。对 Go 语言来说，一些主要的特性如下：

+ 继承是通过匿名成员获得的 -- 匿名成员看起来好像将其行为附加到了组装类上。
+ 数据字段和方法都对派生类型都可用。在包外，只有使用大写字母开头的类型，字段和方法被继承了。在包内，所有的都被继承了。
+ 多重继承是可能的 -- 通过包含每一个父类型的匿名字段。`type Child struct { Father; Monther }`

**多态**：当一个类型在连接到不同的实例时展现不同的行为，这个类型可以说是展现出了多态性。

+ Go 语言中的接口可以用来实现多态。一个类型的变量可以赋值给任何它实现了的接口的变量。

查看原文：<http://golangtutorials.blogspot.jp/2011/06/summary-of-object-oriented-programming.html>
