---
layout: post
title: 直面错误：异常处理
---

谈一点个人在开发中对异常处理的感悟。

### 错就是错，不要将错就错

程序中对错误的处理一定要谨慎，要正视自己的错误，不要写额外的代码去捕获并处理不该在运行时产生的错误。

例如，某个方法调用的时候明确要求需要一个 callback 函数作为参数，程序中就不要去把 callback 设置默认值，然后使用的时候又判断是不是传入了 callback 。
这样将多出很多无效的代码，这种只要运行一次，就能立刻发现的错误不应该捕获并做处理，画蛇添足，适得其反。

### 不要带着错误继续运行

如果程序出现了严重的错误，应该立即停止，不要尝试继续运行，否则会扩大错误。

尤其是对类似 uncaughtException 的异常的全局捕获要更加的慎重，如果不能确定能够继续正常运行，一定要果断地崩溃掉，保护数据。

### 谨慎对待异常处理抛出的异常

例如写入异常 log 文件的代码，要谨慎地对待可能发生的文件操作异常，对写入 log 时发生的异常要单独处理，不能再继续写入 log，否则将产生死循环。

如果将 log 写入数据库，一定要特别小心类似数据库连接失败这种异常，很可能导致死循环，将服务器资源耗光。

### 异常分级

合理地对异常分级，并且使用不同的汇报方式有利于对异常的及时处理。

系统严重异常，例如：数据库连接失败，缓存服务失败导致无法命中，磁盘已满等应该立即发送邮件，短信等方式报警。

普通异常，例如：数据验证失败，404 页面等，应该使用次一级的方式汇报。

### 举例

#### 1. 对 uncaughtException 的错误掩盖

在刚刚开发 node.js 时，发现可以直接全局捕获 `uncaughtException`，这样就避免了到处处理异常，于是在程序中这样写：

    process.on('uncaughtException', function(err) {
        console.error('Error caught in uncaughtException event:', err);
    });

某一次数据库连接发生异常，在这里进入了死循环，瞬间产生了几千封报错邮件发到我的邮箱中。

这里其实就是不正常地掩盖错误，要正确地捕获异常并且处理，不应该盲目掩盖异常并且试图重启程序。

程序发生 `uncaughtException` 是说明发生了严重的错误，程序中包含严重 Bug，应该立即 crash 掉并修复 Bug 重新上线，即使这是线上服务也该如此。

一般来说 crash 掉比带着错误运行带来的损失更小。

#### 2. 一个顽固 bug 的解决

在我们的 web app 中，偶尔发生一个异常，在某些情况下会导致页面截图失败，服务端发现了这个问题，但是排查了很久都没有找到问题所在。

一旦发生这个 Bug,用户的文件图片将会变成空白，这个 Bug 看起来影响并不严重，因为数据仍然似乎并没有丢失，只是预览图丢失了。

但是这个明显是一个错误，完全超出了预期，所以服务端做了限制，一旦检测到这个情况，立即返回错误，前台客户端提示给用户。

虽然这个错误可以掩盖过去，不提示用户，直接提示用户会降低用户体验，但是考虑到用户数据已经受损，可能产生非预期的结果，仍然一直坚持提示错误，让用户停止工作。

经过几个月的排查仍然没有进展，几乎每天都要收到几封报错邮件提示产生了该异常。

直到某一天一个用户报告了另外一个异常现象，在排查过程中发生了这个 bug，用户提醒是不是因为 `<` 产生的。
一试之下果然是这个原因，找到问题所在后很快就顺利解决了这个 Bug。之前完全没想到是这个原因导致的。
经过检查代码，发现这个隐藏的 Bug 可能导致了其他多个一直困扰我们的问题，终于得到顺利解决。

所以对于这种顽固的偶然性 Bug，不能试图去掩盖错误，任何异常发生都是有原因的，只是暂时没有发现，即使暂时找不到，也不能放弃或者试图去掩盖自己的错误，有些 Bug 表面看起来微小，其实可能导致了更大的未发现的 Bug，一定要慎重对待每一个 Bug。
