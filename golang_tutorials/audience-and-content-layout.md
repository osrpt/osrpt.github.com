---
layout: golang
title: 受众和内容编排
source: http://golangtutorials.blogspot.jp/2011/05/audience-and-content-layout.html
---

### Go 语言编程教程系列--受众

我预计使用 Go 语言编程的人群即将迎来显著增长。
但是，现在在世界上仅仅只是早期阶段。
在我尝试学习这门语言的时候，由于这门语言的语法有所不同而且它有一些惯用法导致我受到了一些轻微的挫折，不过一旦当你了解了以后，你会发现它非常棒。
以你的 c/java/c++ 背景对阅读并理解它的程序帮助不大。
所以我想到可能会有不同能力的人阅读这些文章。
因此我大胆尝试去迎合更多的受众，从初学者到有经验的人这些所有需要偶尔参考一些示例代码的人。
我通过将内容分开面向许多专门等级
我使用区分标志和编排方式，将内容分开以面向不同经验等级的人，这样就可以达到我的目的。

### 内容编排

初学者：为初学者准备的内容。
那些刚刚开始学习编程和刚刚开始学习 Go 语言的人都应该从这里开始。

下面的内容是为初学者准备的：

中级水平：那些以前学过编程但是刚刚接触 Go 语言的人应该从这里开始。
这部份将包含一些略微高级的主题和示例。
但是在现在看来，我感觉这部份内容会较少。
Go 语言非常的简单且只有在基于单独的应用设计时才会触及到复杂问题。

下面部分是为专家准备的。

还有一些其他的布局风格：


<p class="error">这种样式的输出表示我们不想要的输出 -- 即错误输出。</p>

<p class="correct">这种样式的输出表示我们想要的输出 -- 即正确输出。</p>

<p class="note">附加注解或者选择看起来像这样。</p>

    //下面是 Go 语言代码的样式

    package main

    import (
            "fmt"
    )

    func main() {
            fmt.Println("This is easily readable.")
    }

某些系统命令，文件名，目录路径，或者一些标题会像下面这样：

`filename`, `ln -l`, `/a/path/to/a/directory`
