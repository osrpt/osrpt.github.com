---
layout: golang
title: Go 模板
source: http://golangtutorials.blogspot.jp/2011/06/go-templates.html
---

{% raw %}

当一个网络服务返回数据或者 html 页面的时候，通常都有一些标准的内容。
需要在其中根据用户和请求进行一些修改。
模板通常就是一种合并一般文本和特殊文本的方式。
例如说保留模板中通用的文字并根据请求替换特殊的文字。

![templates1.jpg](/images/post/golang/templates1.jpg)

在 Go 语言中，我们使用 `template` 包和方法 `Parse`, `ParseFile`，`Execute` 来从字符串或者文件载入模板并完成合并。
需要合并的内容是一种定义好的类型并且暴露出一些字段，例如要在模板内使用的结构中的字段是以大写字母开头的。

![templates2.jpg](/images/post/golang/templates2.jpg)

典型的模板用法是在服务器端生成的 HTML 代码中。
我们可以打开一个已经定义好的模板文件，然后通过方法 `template.Execute` 合并一些数据并将结果输出到 `io.Writer`，作为其第一个参数。
在 web 方法中，`io.Writer` 实例可以传入到 `http.ResponseWriter` 中。

`Partial Code`

    func handler(w http.ResponseWriter, r *http.Request) {
        t := template.New("some template") //创建一个新模板
        t, _ = t.ParseFiles("tmpl/welcome.html", nil) //打开并解析一个模板文件
        user := GetCurrentlyLoggedInUser() //一个单独定义的获得指定类型数据的方法
        t.Execute(w, user) //替换模板 `t` 中的字段，使用来自 `user` 的值，并输出到实现了接口 `io.Writer` 的 `w` 中
    }

我们也可以看看在这个方法中使用的 HTML 的代码部分。
但是仅为学习的目的，这里没有必要列出杂乱的 HTMl 代码了。
因此我们将使用简单的代码来更清晰地说明模板概念。

+ 使用方法 `template.ParseFiles` 可以传入一个或者多个文件路径，但我这里将使用 `template.Parse`，这个方法可以直接使用字符串，这样让你更容易理解。
+ 我们将从命令行执行而不是写一个网络服务
+ 我们将使用预定义的变量 `os.Stdout` 引用标准输出来打印合并后的数据 —— `os.Stdout` 实现了 `io.Writer`。

### 字段替换 —— {{ .FieldName }}

为了在模板中包含一个字段的值，将它包裹在花括号中并且在前面添加一个点号。
比如，如果 `Name` 是一个结构中的字段并且它的值需要在合并的时候替换，那么需要在模板中使用文本 `{{.Name}}`。
请记住该字段一定要存在并且是被暴露的(例如在类型定义中应该使用大写字母开头)，否则将会产生错误。

`Full program`

    package main

    import (
        "os"
        "text/template"
    )

    type Person struct {
        Name string // 以大写字母开头将其暴露出去
    }

    func main() {
        t := template.New(“hello template”) //使用一个名字来创建一个模板
        t, _ = t.Parse("hello {{.Name}}!") // 解析文本生成模板

        p := Person{Name:"Mary"} // 使用需要的字段定义一个实例

        t.Execute(os.Stdout, p) //使用内容 `p` 合并到模板 `t` 中
    }

<p class="correct">
hello Mary!
</p>

为了完整性，让我们创建一个由于缺少字段而产生错误的示例。
在下面的代码中，我们有一个 `nonExportedAgeField` 字段，该字段使用小写字母开头，所以没有暴露出去。
因此当合并数据的时候将产生错误。
你可以通过 `Execute` 方法的返回得到错误。

`Full program`

    package main

    import (
        "os"
        "text/template"
        "fmt"
        )

    type Person struct {
        Name string
        nonExportedAgeField string //没有以大写字母开头
    }

    func main() {
        p:= Person{Name: "Mary", nonExportedAgeField: "31"}

        t := template.New("nonexported template demo")
        t, _ = t.Parse("hello {{.Name}}! Age is {{.nonExportedAgeField}}.")
        err := t.Execute(os.Stdout, p)
        if err != nil {
            fmt.Println("There was an error:", err.String())
        }
    }

<p class="error">
hello Mary! Age is There was an error: template: nonexported template demo:1: can't evaluate field nonExportedAgeField in type main.Person
</p>

### 模板的 `Must` 方法 —— 用来检查模板文本的有效性

静态方法 `Must` 用来检查模板内容的有效性，例如括号是否匹配，注释是否关闭，变量是否正确地构成。
在下面的例子中，我们有两个有效的模板文字，会无误地解析。
但是第三个由于括号不匹配，将会导致异常。

`Full program`

    package main

    import (
        "text/template"
        "fmt"
        )

    func main() {
        tOk := template.New("first")
        template.Must(tOk.Parse(" some static text /* and a comment */")) // 是一个有效的模板，不会产生错误
        fmt.Println("The first one parsed OK.")

        template.Must(template.New("second").Parse("some static text {{ .Name }}")) 
        fmt.Println("The second one parsed OK.")

        fmt.Println("The next one ought to fail.")
        tErr := template.New("check parse error with Must")
        template.Must(tErr.Parse(" some static text {{ .Name }")) // 由于括号不匹配，将会产生错误
    }

<p class="correct">
The first one parsed OK.
The second one parsed OK.
The next one ought to fail.
panic: template: check parse error with Must:1: unexpected "}" in command
runtime.panic+0xac ...
</p>

{% endraw %}
