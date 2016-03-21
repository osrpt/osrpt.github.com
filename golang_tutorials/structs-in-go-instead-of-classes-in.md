---
layout: golang
title: Go 语言的结构体 -- 一种面向对象编程中类的替代物
source: http://golangtutorials.blogspot.jp/2011/06/structs-in-go-instead-of-classes-in.html
---

[Go 语言是面向对象编程的语言吗？](https://golang.org/doc/faq#Is_Go_an_object-oriented_language)

先给习惯面向对象编程者一个小说明：第一个要记住的事情是，Go 没有 `class` 关键字。
`struct` 是你将在 Go 中使用的一个类似概念。
像 Java, C#, C++ 和其他一些语言也有结构。
就如它们可以给结构添加方法一样，Go 也可以。
所以这不难掌握。
不过这里也略有不同。

在一些面向对象的语言中，方法是包含在类或者结构中的。
在 Go 中，它们是关连到结构上的。

`部分代码：Java 语言`

    class House {
        public String getHouseName() {  //method defined within class
            //implementation
        }
    }

`部分代码：Go 语言`

    type House struct { }

    func (h House) GetHouseName() string { } //method defined outside of struct, but works on House

下面让我们来学习一下如何在 Go 语言中创建结构和它的方法，不用面向对象编程的方式却能得到面向对象编程的好处。
结构通过关键字 `type` 和 `struct` 定义。

    type my_struct_name struct { }

    type Rectangle struct { }

    type Vehicle struct { }

    type Vehicle1_Car struct { }

上面所有的定义都是合法的，它们都使用了规范的 Go 变量名命名规则。
下面的这些不合法：

    type Hash# struct {} //cannot have special characters
    type 0struct struct {} //cannot start with a number

接着，结构可以包含其他类型的数据。
所以就跟类一样，结构允许你在其中定义真实世界中的项目并分配存储。
下面是一些有效的范例：

    type my_struct_name struct {
        i int
        j int
        s string
    }

    type Rectangle struct {
        length, width int //you can define multiple items of the same type on the same line separated by commas
        area float64
    }

现在是时候使用我们定义的结构了。我们可以打印 Rectangle 的一部分。

    package main

    import "fmt"

    type Rectangle struct {
        length, width int
    }

    func main() {
        r := Rectangle{}
        fmt.Println("Default rectangle is: ", r) //print default zero-ed value
    }

<p class="correct">Default rectangle is: {0 0}</p>

在输出中有一个值得注意的地方：结构中的变量值已经被设置为零值。
例如：int 的零值是 0, string 的是空，等。
这样结构也就有一个初始化的零值。

在下面的例子中，我们将看到不同的初始化结构的方式，设置其中的变量值，并且打印默认值。

    package main

    import "fmt"

    type Rectangle struct {
        length, width int
        name string
    }

    func main() {
        r1 := Rectangle{2, 1, "my_r1"} //initialize values in order they are defined in struct
        fmt.Println("Rectangle r1 is: ", r1)

        r2 := Rectangle{width:3, name:"my_r2", length:4} //initialize values by variable name in any order
        fmt.Println("Rectangle r2 is: ", r2)

        pr := new (Rectangle) //get pointer to an instance with new keyword
        (*pr).width = 6 //set value using . notation by dereferencing pointer.
        pr.length = 8 //set value using . notation - same as previous.  There is no -> operator like in c++. Go automatically converts
        pr.name = "ptr_to_rectangle"
        fmt.Println("Rectangle pr as address is: ", pr) //Go performs default printing of structs
        fmt.Println("Rectangle pr as value is: ", *pr) //address and value are differentiated with an & symbol
    }

<p class="correct">
Rectangle r1 is: {2 1 my_r1}
Rectangle r2 is: {4 3 my_r2}
Rectangle pr as address is: &{8 6 ptr_to_rectangle}
Rectangle pr as value is: {8 6 ptr_to_rectangle}
</p>

这里有几个值得注意的地方：

+ 你可以通过把值按照结构的定义顺序放在花括号中来初始化结构。`r1 := Rectangle{2, 1, "my_r1"}`
+ 你也可以提供名字来初始化：`r2 := Rectangle{width: 3, name: "my_r2", length: 4}`
+ 可以通过 `new` 关键字来把新创建的结构实例赋给一个指针
+ 这样的指针可以通过包含或者不包含 `*` 操作符来获得其中的值
+ Go 语言默认提供了根据结构的值来输出它的方法

### 结构和变量的封装及可见性

其他的一些编程语言使用一些如 `public`, `private`, `package`, `protected` 这样的关键字。
用来让开发者定义不同上下文中的可见性和可访问性。
我觉得这些是必要的，直到我看到了 Go 语言的做法。
Go 语言的做法是如此简单以至于你可能觉得这非常傻瓜化。
让我们进入正题：如果第一个字母是大小，就可以在包外面访问。就是这样简单！

`部分代码：`

    type notExported struct { //this struct is visible only in this package as it starts with small letter
    }

    type Exported struct { //variable starts with capital letter, so visible outside this package
        notExportedVariable int //variable starts with small letter, so NOT visible outside package
        ExportedVariable int //variable starts with capital letter, so visible outside package
        s string //not exported
        S string //exported
    }

你问这是不是不折不扣的傻？我想说这是不折不扣的天才。一个简单而且工作良好的主意。
就一种方式，所有的这些不想要的关键词全部排除掉了。
第二个好处是你只需要看一下变量名就知道它的可访问性了，你不需要滚动到它的定义处去查看可访问性。
在其他语言中，它们把这种方式作为一种命名约定，但是 Go 强制这样做并且工作得很好。
