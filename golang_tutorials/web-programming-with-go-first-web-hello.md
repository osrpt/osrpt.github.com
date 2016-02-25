---
layout: golang
title: Go 网络变成 —— 第一个网络的 Hello world
source: http://golangtutorials.blogspot.jp/2011/06/web-programming-with-go-first-web-hello.html 
---

如果你已经学习了本系列中前面的文章，来到 Go 网络编程你会感到很轻松。
让我们直接跳到这部分然后分析代码。
也有可能有些人第一次来就是看的这篇文章，所以让我们花点时间浏览一下 Go 编程和网络变成的基本概念。

网络服务是一种在计算机上等待用户连接以请求信息或者执行的程序。
到达计算机和服务的方式是通过 URL —— 一个网络上唯一的地址用来标识需要做什么。
例如说，下面的地址：`http://onebigbank.com:80/deposit` 说明了可能有一个叫做 `deposit` 的服务在一台叫做 `onebigbank.com` 的电脑的 `80` 端口上可以通过 `http` 协议访问。
我们也可以附加参数和变量，这样该服务可以利用这些数据工作。

让我们写一个基本的 Go 程序然后分析代码。
在这个程序中，我们将在本机上开启一个简单的服务。
我们让服务运行在 9999 端口上。
当你从 `http://localhost:9999` 请求本机时 （使用 `http://127.0.0.1:9999` 是一样的），它会在屏幕上打印一个文本信息。

`Full program: webhello.go`

    package main

    import (
        "net/http" //package for http based web programs
        "fmt"
    )

    func handler(w http.ResponseWriter, r *http.Request) { 
        fmt.Println("Inside handler")
        fmt.Fprintf(w, "Hello world from my Go program!")
    }

    func main() {
        http.HandleFunc("/", handler) // redirect all urls to the handler function
        http.ListenAndServe("localhost:9999", nil) // listen for connections at port 9999 on the local machine
    }

+ 使用 `go run webhello.go` 运行程序
+ 你的网络服务已经运行起来了并且等待连接
+ 在浏览器上打开 `http://localhost:9999`
+ 你将看到一个网页上写着：`Hello world from my Go program!`。

希望你那里也可以顺利运行。
现在你已经写了第一个可以运行的 Go 网络程序了，带着荣耀，享受一下阳光的照耀吧。
......完成了吗？
是的，下面让我们来分析一下我们在代码中做了什么。
如果你已经了解过网络变成，你可能已经熟悉大部份代码并且了解运行流程了，如果你不知道，下面就是一些细节。

+ 和所有需要执行的 Go 语言程序一样，我们的程序有一个包名 `main`。
+ 为了输出信息，它导入了包 `fmt`。
+ 为了使用网络 http 相关的方法，我们导入了 `http` 包。我们通过 `http.function_name` 来使用。
+ 在主程序内，我们将任何输入请求重定向到 `handler` 方法。我们通过 `http.HandleFunc` 并传入两个参数来完成 —— 第一个是输入地址的一部分，第二个能够处理的一个方法。
+ 我们通过 `http.ListenAndServe("localhost:9999", nil)` 让程序监听在端口 `9999` 上面，并等待用户的连接。
+ 当一个用户连接后，程序返回一个文本信息到浏览器
+ 所有请求信息可以通过参数 `http.Request` 来获得。你可以得到 URL，输入值和其他详细信息。
+ 通过参数 `http.ResponseWriter` 来输出信息。
+ 代码 `http.HandleFunc("/", handlery)` 意思是所有以我们放入到 `http.ListenAndServe` 中地址开头的请求都会重定向到 `hanlder` 方法。

下面让我们扩展我们的示例，使用不同的地址请求不同的东西。
在下面的版本中，我们将有两个处理器：一个打印输入的信息，另外一个将输入转为大写。

`Full program`

    package main

    import (
        "net/http"
        "fmt"
        "strings"
    )

    func helloHandler(w http.ResponseWriter, r *http.Request) {
        remPartOfURL := r.URL.Path[len("/hello/"):] //get everything after the /hello/ part of the URL
        fmt.Fprintf(w, "Hello %s!", remPartOfURL)
    }

    func shouthelloHandler(w http.ResponseWriter, r *http.Request) {
        remPartOfURL := r.URL.Path[len("/shouthello/"):] //get everything after the /shouthello/ part of the URL
        fmt.Fprintf(w, "Hello %s!", strings.ToUpper(remPartOfURL))
    }

    func main() {
        http.HandleFunc("/hello/", helloHandler)
        http.HandleFunc("/shouthello/", shouthelloHandler)
        http.ListenAndServe("localhost:9999", nil)

当你执行程序以后，访问以下两个连接：

<http://localhost:9999/hello/Mary>

<p class="correct">
Hello Mary!
</p>

<http://localhost:9999/shouthello/Mary>

<p class="correct">
Hello MARY!
</p>
