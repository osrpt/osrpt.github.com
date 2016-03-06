---
layout: golang
title: Go 模板2
source: http://golangtutorials.blogspot.jp/2011/10/go-templates-part-2.html 
---

{% raw %} 

在以下页面有一些关于模板不太充分的文档：<http://golang.org/pkg/text/template/>，<http://golang.org/pkg/html/template/>。
Html 子模块有一些附加的安全特性，如用于防止代码注入攻击，当在 web 上使用时应该使用该模块。
（在这里，我将使用其中一个，因为它们的接口是一样的。）
它包含了很多可以被模板包解析的结构和格式。
在这里我将使用一些示例来作为补充，因为我没有找到可用的清晰文档。
首先，让我解释一些专门术语。

### 管道 (pipeline)

Unix 用户已经知道管道数据了。
许多命令都可以产生文本输出 —— 一个字符串流。
如果在命令提示符后输入 `ls` 命令，你就可以得到一个当前目录下的文件列表。
这可以解释为 `获取当前目录下的所有所有文件的列表，并且输送到默认的管道，在这里就是命令行屏幕`。
在 unix 命令行中管道 `|` 符号，也就是竖线，允许你 `输送` 字符流到另外一个命令中。例如：

    ls | grep "a"

将获得当前目录下的所有文件，然后输送到 `grep` 命令内，并筛选出包含 “a” 字符的。
当然你可以继续输入这个字符管道到另外一个命令中。
`ls | grep "a" | grep "o"` 将仅列出同时包含 "a" 和 "o" 字母的文件列表。

在 Go 语言中，每个像这样的字符串流都叫做一个管道并且可以输出给另外一个命令。
在下面的例子中我们将使用字符串常量打印两个管道。
注意这些包含在 `{{  }}` 中的常量字符串和没有花括号的静态字符串不一样 —— 静态字符串将会没有任何改变地复制。
而管道数据是可以修改的，虽然在这个例子中我们没有做任何修改。

`Full program - 管道示例`

    package main

    import (
        "text/template"
        "os"
    )

    func main() {
        t := template.New("template test") 
        t = template.Must(t.Parse("This is just static text. \n{{\"This is pipeline data - because it is evaluated within the double braces.\"}} {{`So is this, but within reverse quotes.`}}\n")); 
        t.Execute(os.Stdout, nil)
    }

<p class="correct">
This is just static text. 
This is pipeline data - because it is evaluated within the double braces. So is this, but within reverse quotes.
</p>

### 模板 if-else-end

这里的语法 `if-else` 概念和普通的 `if-else` 语句相似 —— 在 Go 语言中，如果管道是空的，那么 if 条件为 false。
下面的例子中将会说明：

`Full program - 说明模板 if-else`

    package main

    import (
        "os"
        "text/template"
    )

    func main() {
        tEmpty := template.New("template test")
        tEmpty = template.Must(tEmpty.Parse("Empty pipeline if demo: {{if ``}} Will not print. {{end}}\n")) //empty pipeline following if
        tEmpty.Execute(os.Stdout, nil)

        tWithValue := template.New("template test")
        tWithValue = template.Must(tWithValue.Parse("Non empty pipeline if demo: {{if `anything`}} Will print. {{end}}\n")) //non empty pipeline following if condition
        tWithValue.Execute(os.Stdout, nil)

        tIfElse := template.New("template test")
        tIfElse = template.Must(tIfElse.Parse("if-else demo: {{if `anything`}} Print IF part. {{else}} Print ELSE part.{{end}}\n")) //non empty pipeline following if condition
        tIfElse.Execute(os.Stdout, nil)
    }

<p>
Empty pipeline if demo: 
Non empty pipeline if demo: Will print. 
if-else demo: Print IF part. 
</p>

### 点号 - `.`

Go 模板中的点号 (`.`) 将引用当前管道。
这和数据库中查询了所有行时访问当前行的 `cursor` 类似。
如果你使用过 Java 或者 C++，你可以认为这和 `this` 有点相似 —— 好吧，虽然不一样，但是有一点像。

### 模板 with-end

`with` 语句用于将管道的值设置到点号上。如果管道是空的，那么 `with-end` 之间的代码块将被跳过。

`Full program - 说明模板 with-end`

    package main

    import (
        "os"
        "text/template"
        )

    func main() {
        t, _ := template.New("test").Parse("{{with `hello`}}{{.}}{{end}}!\n")
        t.Execute(os.Stdout, nil)

        t1, _ = template.New("test").Parse("{{with `hello`}}{{.}} {{with `Mary`}}{{.}}{{end}}{{end}}!\n") //when nested, the dot takes the value according to closest scope.
        t1.Execute(os.Stdout, nil)
    }

<p class="correct">
hello!
hello Mary!
</p>

### 模板变量

你可以在模板中通过给变量名添加 `$` 前缀来为管道创建局部变量。
变量名必须使用字母数字和下划线构成。
在下面的例子中，我使用了一些合法的变量名。

`Full program - 说明模板变量`

    package main

    import (
        "os"
        "text/template"
    )

    func main() {
        t := template.Must(template.New("name").Parse("{{with $3 := `hello`}}{{$3}}{{end}}!\n"))
        t.Execute(os.Stdout, nil)

        t1 := template.Must(template.New("name1").Parse("{{with $x3 := `hola`}}{{$x3}}{{end}}!\n"))
        t1.Execute(os.Stdout, nil)

        t2 := template.Must(template.New("name2").Parse("{{with $x_1 := `hey`}}{{$x_1}} {{.}} {{$x_1}}{{end}}!\n"))
        t2.Execute(os.Stdout, nil)
    }

<p class="correct">
hello!
hola!
hey hey hey!
</p>

### 预定义的模板方法

有一些在你的代码中可以使用的预定义模板方法。
下面我将说明 `printf` 函数，其功能和 `fmt.Sprintf` 类似。

`Full program - 说明模板方法`

    package main

    import (
        "os"
        "text/template"
        )

    func main() {
        t := template.New("test")
        t = template.Must(t.Parse("{{with $x := `hello`}}{{printf `%s %s` $x `Mary`}}{{end}}!\n"))
        t.Execute(os.Stdout, nil)
    }

<p class="correct">
hello Mary!
</p>

{% endraw %} 
