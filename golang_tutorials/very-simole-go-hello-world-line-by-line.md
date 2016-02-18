---
layout: golang
title: 一步一步实现 Go 语言的 "Hello World"
---

创建一个名字为 `program1.go` 的文件。现在该文件为空白。按照下面提供的方式尝试编译它。

`cmd-prompt>go run program1.go`

你应该会看到这样的异常信息：

<p class="error">
package :
<br/>
program1.go:1:1: expected 'package', found 'EOF'
</p>

在 Go 语言中，所有文件都必须和一个包关连起来。
目前来说你只需要知道在每一个 .go 文件上面都必须有一个 package 语句后面跟一个你想要的包名。
在大型程序中，包是一种非常好的组织一系列逻辑上功能相近代码的方式。
举个例子，如果你想写一个建立所有机动车的虚拟模型的程序，你可以把你的所有小汽车模型放到一个叫做 `cars` 的包里面而把公共汽车放到 `buses` 包内。
帮助将相关连功能组合到一起只是包的一个功能，后面我们还会介绍更多。

现在我们放一个包名然后再试试：

`Full file: program1.go`

    package main

你会看到下面的错误：

<p class="error">runtime.main: undefined: main.main</p>

Go 中的程序需要一个开始点，需要一种能在某个地方识别这种设置的方式。
就像汽车是从点火钥匙启动，计算机从按下开机按钮启动，Go 语言程序从 `main` 函数启动。

下面我们再添加一行并重试：

`Full file: program1.go`

    package main

    func main() {}

`go run program1.go`

现在可以运行成功了，不过由于我们什么都没让它做，所以它自己就静悄悄地退出了。

在此时，你已经有了你的第一个可以运行的程序了。太棒了！虽然它也没做什么，但是它是一个合法的可以运行的程序。

下面让我们更进一步，再添加一行并重试：

`Full file: program1.go`

    package main

    func main() {
        Println("Hello world")
    }

尝试运行，你将得到以下错误：

<p class="error">program1.go:4:undefined: Println</p>

我已经知道 `Println` 是一个用来向屏幕打印字符串的函数。
我试了一下，但是编译器说它还没有被定义。
为什么呢？
还记得我上面说过的包吗？
在这里是该使用它们的时候了。
这些包不会在我们的程序中自动变得可用。
如果我们想使用一个包里面的某个函数，我们必须先引入这个包。
是的，就跟我们进口国外的汽车一样。
你想用车？先进口一个。

打印字符串和一些其他关于读写文本和字符的方法都在包 `fmt` 中，也就是格式化包。

<p class="note">
Go 语言有意保持简单和精简。
如果你以前用的是 Java，你可能习惯冗长的命名方式。
比如说格式化包可能会命名为 `formatting`。
但是，Go 语言在约定上希望保持简洁。
刚开始的时候我不太习惯这种方式，但是经过一段时间的适应，我必须说要这种方式也很好。
代码的简洁加快了阅读速度，我也不觉得有难受的地方。
不过这仅仅是我个人的体验。
</p>

因此，让我们来加一些另外的代码：

`Full file: program1.go`

    package main

    import "fmt"

    func main() {
        fmt.Println("Hello world")
    }

现在我们来运行一下。下面是输出：

<p class="correct">Hello world</p>

Hello, hello!
你已经成功了。
这是你获得的第一个来自 Go 程序的输出。
我们仅仅只是添加了包。
我们引入包并且通过点号告诉程序 `Println` 可以在其中找到。
让我们来稍作讲解。

在英语中，如果你想表示属于某个电脑的键盘，你会说：computer's keyword。

在法语中是：clavier de l'ordinateur

在泰米尔语中：computeroode keyboard

印地语：computer ka keyboard

马拉雅拉姆语：computerinde keyboard

在 Go 语言中：computer.keyboard

你注意到最后一行了吗？
在 Go 语言中，我们使用点号，在左边放上包含其他元素的名字，右边放上元素名字。
来看一下更多例子：`Car.Wheel`, `Mary.Hand`, `Computer.Screen`, `Computer.Keyboard.AKey`, `Computer.Keyboard.AKey.RowNumber`。
如你所见，这种组合可以嵌套很多层。

查看原文：<http://golangtutorials.blogspot.jp/2011/05/very-simple-go-hello-world-line-by-line.html>
