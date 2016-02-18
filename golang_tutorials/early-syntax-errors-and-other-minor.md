---
layout: post
title: 早期语法错误和一些小错误
---

有时候我们知道程序是怎么正确工作的，但是我们不知道为什么出现错误。
这里我将罗列一些可能遇到的错误，这样你可能稍微花点时间就能弄明白发生了什么。

### 不必要的导入

复制下面的代码并执行：

`Full file: ErrProg1.go`

    package main

    import "fmt"
    import "os" //excessive - we are not using any function in this package

    func main() {
        fmt.Println("Hello world")
    }

输出：

<p class="error">prop.go:4: imported and not used: os</p>

Go 语言对代码格外的吝啬：如果你不用，就不要拿。
在这段代码中，你已经说明了你想要引入 `os` 包，但是你又没有用。
这是不允许的。
如果你不用，就应该移除这行引入代码。
只要删掉第四行的 `import "os"`，这个程序就可以运行了。

### 精确的命名 -- 大小谢敏感

`Full file: ErrProg2.go`

    package main

    import "fmt"

    func main() {
        fmt.println("Hello world")
    }

输出：

<p class="error">
prog.go:6: cannot refer to unexported name fmt.println
prog.go:6: undefined: fmt.println
</p>

注意这里我们写的是：`fmt.println` 而不是 `fmt.Println`。
Go 语言是大小写敏感的，意思就是如果要用一个名字，就应该用定义时完全一致的名字。
如果名字是 John，就只能使用 John，而不能是 john, joHn，或其他组合。
所以，下面是一些其他不允许的范例：

`非法的代码：`

    Package main
    iMport "fmt"
    import "Fmt"
    Func main() {}
    Fmt.Println
    fmt.println

### 使用分号分隔不同行

如果你之前使用过 C, C++, Java, Perl, 等。
你可能已经注意到 Go 语言中没有要求在每一行的结尾加上分号。
在 Go 语言中，新行的标志自动插入到每一行的末尾。
但是如果你在同一行放了两个聚鱼，那么你需要用分号来分隔它们。
让我们看个例子：

`Full file: ErrProg3.go`

    package main

    import "fmt"

    func main() {
        fmt.Println("Hello world") fmt.Println("Hi again")
    }

输出：

<p class="error">
prog.go:6: syntax error: unexpected name, expecting semicolon or newline or }
</p>

只需要把这两个 Println 语句分别放到两行中，就可以运行了：

`部分代码：`

    func main() {
        fmt.Println("Hello world")
        fmt.Println("Hi again")
    }

为了说明这样做的目的，试试下面的代码：

`整个代码：`

    package main

    import "fmt"

    func main() {
        fmt.Println("Hello world"); fmt.Println("Hi again")
    }

输出：

<p class="correct">
Hello world
Hi again
</p>

在 Go 语言中分号可以在每行末尾用但这不是必须的。
不过如果你在一行里面有多个语句，你就需要使用分号分割。

所以下面的代码也是合法的，将会得到一样的输出：

`Full file: ErrProg4.go`

    package main;

    import "fmt";

    func main() {
        fmt.Println("Hello world"); fmt.Println("Hi again");
    };

输出：

<p class="correct">
Hello world
Hi again
</p>

但是要小心不要随便使用分号。

### 不必要的分号

让我们来精简一下程序，不过加上一些分号。试试下面的代码：

`Full file`

    package main

    import "fmt";;

    func main() {
        fmt.Println("Hello world")
    }

输出：

<p class="error">
prog.go:3: empty top-level declaration
</p>

再一次说明了 Go 语言对代码极其节俭。
在这段代码中，import 语句后有两个分号。
第一个是可以接受的 -- 虽然没有必要，不过还是可以有。
但是两个？不行！
这是 Go 语言放新行的方式。
这个分号说明了这是一个语句的结束，但是在第二个分号前没有合法的语句。
所以只需要移除掉第二个分号，程序就可以正常运行了。

### 语法以及其他

编译器要求你遵守正确的语法。
有许许多多的可能的语法错误，全部列出来不是一个好主意。
这里我会列一些。
只要你了解了这些，大多数剩下的也很相似。

    package 'main' //ERROR - no quotes for the package name: package main
    package "main" //ERROR - no quotes for the package: package main

    package main.x  //ERROR - packages names in go are just one expression.  So either package main or package x.
    package main/x  //ERROR - packages names in go are just one expression.  So either package main or package x.

    import 'fmt' //ERROR - needs double quotes "fmt"
    import fmt //ERROR - needs double quotes "fmt"

    func main { } //ERROR - functions have to be followed by parantheses: func main() {}

    func main() [] //ERROR - where curly braces are required, only those are allowed.  They are used to contain blocks of code.  func main() {}

    func main() { fmt.Println('hello world') } //ERROR - use double quotes for strings: func main() { fmt.Println("hello world") }

查看原文：<http://golangtutorials.blogspot.jp/2011/05/early-syntax-errors-and-other-minor.html>
