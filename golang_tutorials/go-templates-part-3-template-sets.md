---
layout: post
title: Go 模板3 - 模板集
source: http://golangtutorials.blogspot.jp/2011/11/go-templates-part-3-template-sets.html
---

{% raw %}

模板集曾是一个特殊的数据类型，允许你将相关连的模板合并到一个组内。
但它现在不再是作为一个单独的数据类型存在，它包含在模板数据结构中。
因此如果你现在解析一组其中包含了分开的 `{{ define }}...{{ end }}` 块的文件，每个都将成为一个模板。

举个例子一个网页包含了一个 header, body, 和 footer，每一个都可以单独定义到一个文件中。
然后可以通过一次调用将这些模板定义同时解析。
例如，假设下面是定义在一个文件中的文本：

`未完成的模板集示例文件`

    {{define "header"}}
    <html>
    <head></head>
    {{end}}

    {{define "body"}}
    <body>
    </body>
    {{end}}

    {{define "footer"}}
    </html>
    {{end}}

需要注意的关键点：

+ 每一个模板都定义在 `{{ define }}` 和 `{{ end }}` 中
+ 每个模板都有一个唯一的名字 —— 重名将引发错误
+ 在 `{{ define }}` 块之外不允许出现文字 —— 将引发错误
+ 在 `{{ define }}` 块内的空白部分将呈现为自身 —— 在上面的示例中在第一个 html 标签前面有一个换行符，闭合 head 后面也有一个。

当这个文件作为一个模板集被解析后，将会创建一个由模板名字到解析后模板的 map 。
所以上面的代码可以表示为这样：

    tmplVar["header"] = pointer to parsed template of text "<html> … </head>"
    tmplVar["body"] = pointer to parsed template of text "<body> … </body>"
    tmplVar["footer"] = pointer to parsed template of text "</html>"

<p class="note">
在一个集中的模板互相了解。
如果同一个模板需要被不同的集使用，那么需要单独解析。
如果上面的 `footer` 模板需要重复使用，那么作为一个单独的文件并且分开解析。
</p>

下面我们来看一个简单的示例。
在这个例子中，我们将学到怎样：

+ 定义模板 —— 使用 `{{ define }}`
+ 在一个模板中包含另外一个 —— 使用 `{{ template "template name" }}`
+ 解析多个文件并且使用 `template.ParseFiles` 来创建一个集
+ 使用 `template.ExecuteTemplate` 执行和合并模板内容

`完整的模板文件 —— t1.tmpl`

    {{define "t_ab"}}a b{{template "t_cd"}}e f {{end}}

上面的模板将使用模板名 “t_ab” 解析。
其中包含 “a b /missing/ e f”，缺少一些字母。
并且它将包含一个模板 “t_cd”（应该是在同一个集中）。

`完整的模板文件 —— t2.tmpl`

    {{define "t_cd"}} c d {{end}}

上面这个模板文件将会被解析为模板 “t_cd”。

`完整程序：`

    package main

    import (
        "text/template"
        "os"
        "fmt"
    )

    func main() {
        fmt.Println("Load a set of templates with {{define}} clauses and execute:")
        s1, _ := template.ParseFiles("t1.tmpl", "t2.tmpl") //从多个文件创建一个模板集
        //注意 t1.tmpl 是内容为 "{{define "t_ab"}}a b{{template "t_cd"}}e f {{end}}" 的文件
        //注意 t2.tmpl 是内容为 "{{define "t_cd"}} c d {{end}}" 的文件

        s1.ExecuteTemplate(os.Stdout, "t_cd", nil) //仅打印 c d
        fmt.Println()
        s1.ExecuteTemplate(os.Stdout, "t_ab", nil) //执行包含了 t_cd 的 t_ab
        fmt.Println()
        s1.Execute(os.Stdout, nil) //由于这里的模板都是命名的，所以没有默认的模板可用，这里不会打印任何东西
    }

在第一部分，我们的使用 `template.ParseFiles` 解析了当前目录下的模板文件 “t1.tmpl” 和 "t2.tmpl"。
(如果当前目录下有其他类似命名为 t*.tmpl 的文件，如果没有正确的可以解析的模板文件内容，这里可能会产生错误)
在我们的例子中，这里每个文件只有一个模板 —— `t1.tmpl` 中的 `t_ab` 和 `t2.tmpl` 的 `t_cd`。
我们先执行了小的模板 “t_cd”，并且打印其内容。
然后执行了我们的外围模板 “t_ab”，它使用模板 "t_cd" 产生的内容 (因为你使用 `template` 语句要求包含)。
最后，我们使用 `Execute` 执行模板来向我们自己说明没有默认的模板 —— 什么都没有打印。

<p class="correct">
c d 
a b c d e f 
-empty- 
</p>

方法 `template.ParseGlob` 和 `template.ParseFiles` 相似，除了它使用通配符来作为文件名。
在上面的例子中，你可以使用 `template.ParseGlob("t*.tmpl")` 来替换，将得到相同的结果。

{% endraw %}
