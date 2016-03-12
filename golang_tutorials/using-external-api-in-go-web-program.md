---
layout: golang
title: 在 Go 网络程序中使用外部 API —— Google 的短地址 API
source: <http://golangtutorials.blogspot.jp/2011/11/using-external-api-in-go-web-program.html>
---

在这篇教程中，我们将学会如何在我们的 Go 程序中使用外部 API。
我们将使用的是 URL 缩短 API。
你可以在 <http://goo.gl/> 试用其功能。
输入一个 URL 地址，例如 <http://golangtutorials.blogspot.com/> 然后会得到一个缩短的地址，可以更好地嵌入到像 twitter 这样的服务中。
Google 使用的这个技术可以让其他开发者在自己的应用中将其作为 api 使用（在限制内是免费的）。
你可以在这个地址了解更多：<http://code.google.com/apis/urlshortener/>。

这个程序本身是非常简单的，所以这是一个学习的好步骤。
我将使用在 AppEngine 教程中同样的例子作为开始（[查看 AppEngine 教程](http://golangtutorials.blogspot.com/2011/11/using-external-api-in-go-appengine.html)）。
可以通过以下文章回顾一下我们已经学到的内容：

+ 写一个 Web 应用：</golang_tutorials/web-programming-with-go-first-web-hello.html>
+ goinstall: <http://golangtutorials.blogspot.jp/2011/10/go-packages-and-goinstall-creating-and.html>
+ 模板：</golang_tutorials/go-templates.html>
+ 谷歌 Api Go 客户端：<http://code.google.com/p/google-api-go-client/>

### 第一步：确定环境设置正确

+ 设置环境变量 `GOPATH` 指向你想要的目录（如果你还没有这样做的话）
+ 外部源代码将会下载到目录 `$GOPATH/src` 中包会安装到 `$GOPATH/pkg` 中。

### 第二步：安装 API

+ 使用下面的命令安装 API： `goinstall google-api-go-client.googlecode.com/hg/urlshortener/v1`
+ 将会下载所有源代码到 `$GOPATH/src` 目录中。
