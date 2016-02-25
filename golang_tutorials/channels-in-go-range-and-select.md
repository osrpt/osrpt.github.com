---
layout: golang
title: Go 语言的 channel —— range 和 select
source: http://golangtutorials.blogspot.jp/2011/06/channels-in-go-range-and-select.html
---

### channel 和 range

这是 Go 中的 channel 的第二篇教程。
如果你还没有看过第一部分， [Go 语言的 Channels](/golang_tutorials/channels-in-go.html)，请先阅读它。

数据接收者在判断什么时候停止接收数据上有问题。
是否还有更多数据会到来还是所有数据已经完了？
是该等呢还是继续前进呢？
一种方法是不断地测试数据源检查 channel 是否关闭，但是这样可能效率不高。
Go 语言提供了 `range` 关键字，当用在 channel 上时，将会一直等待直到 channel 关闭。

`Full code`

    package main
    import (
        "fmt"
        "time"
        "strconv"
    )

    func makeCakeAndSend(cs chan string, count int) {
        for i := 1; i <= count; i++ {
            cakeName := "Strawberry Cake " + strconv.Itoa(i)
            cs <- cakeName //send a strawberry cake
        }
    }

    func receiveCakeAndPack(cs chan string) {
        for s := range cs {
            fmt.Println("Packing received cake: ", s)
        }
    }

    func main() {
        cs := make(chan string)
        go makeCakeAndSend(cs, 5)
        go receiveCakeAndPack(cs)

        //sleep for a while so that the program doesn’t exit immediately
        time.Sleep(3 * 1e9)
    }

<p class="correct">
Packing received cake: Strawberry Cake 1
Packing received cake: Strawberry Cake 2
Packing received cake: Strawberry Cake 3
Packing received cake: Strawberry Cake 4
Packing received cake: Strawberry Cake 5
</p>

我们告诉蛋糕制造机我们需要 5 个蛋糕，但是打包机并不知道。
在之前的版本中，我们为打包机硬编码了准确数据。
但是在上面的代码中通过使用 `range` 关键词，我们不用再那样做了 —— 现在当 channel 关闭后，`for` 循环自动中止。

### channel 和 select

在多个 channel 上使用 `select` 关键字是一种在不同 channel 之间的 「你准备好了吗」探测机制。
`case` 可以是发送或者接收数据 —— 当一个发送者或者接收者使用 `<-` 开始，那么这个 channel 就是准备好了。
也可以包含一个 `default` 块，意味着总是准备好的。
`select` 关键字的工作方式大约是这样的：

+ 检查每一个 `case` 代码块
+ 如果其中任何一个在发送或者接收数据，执行相应的代码
+ 如果多余一个在发送或者接收数据，随机选择一个并执行相应代码
+ 如果任何一个都还没有准备好，等待
+ 如果有 `default` 块，并且每个 `case` 块都还没准备好，执行 `default` 块。（我不太确定这一点，但是根据代码测试，似乎 default 拥有最低优先级）

在下面的例子中，我们扩展了我们的蛋糕制造厂，可以模拟制造多种口味的蛋糕 —— 草苺味和巧克力都可以造！
但是打包机制仍然不变。
并且制造一个蛋糕花费的时间比打包一个要多，意味着我们可以使用同一个打包机来打包不同种类的蛋糕以提高效率。
由于蛋糕来自不同的 channel ，所以打包机不知道蛋糕被放在 channel 上的准确时间，也不知道是放在哪个或哪几个 channel 上。
它可以使用 `select` 关键字在所有的 channel 上等待 —— 一旦某个 channel 准备好接收蛋糕/数据，它将执行它的代码。

请注意我们怎样使用返回多值语句： `case cakeName, strbry_ok := <- strbry_cs`。
第二个返回值是一个 bool 值，当值为 `false` 时指示该 channel 已经关闭。
当它为 `true` 时表示有一个值被传输。
我用它来判断我是否需要停止等待所有的蛋糕。

`Full code`

    package main

    import (
        "fmt"
        "time"
        "strconv"
    )

    func makeCakeAndSend(cs chan string, flavor string, count int) {
        for i := 1; i <= count; i++ {
            cakeName := flavor + " Cake " + strconv.Itoa(i)
            cs <- cakeName //send a strawberry cake
        }
        close(cs)
    }

    func receiveCakeAndPack(strbry_cs chan string, choco_cs chan string) {
        strbry_closed, choco_closed := false, false

        for {
            //if both channels are closed then we can stop
            if (strbry_closed && choco_closed) { return }
            fmt.Println("Waiting for a new cake ...")
            select {
            case cakeName, strbry_ok := <-strbry_cs:
                if (!strbry_ok) {
                    strbry_closed = true
                    fmt.Println(" ... Strawberry channel closed!")
                } else {
                    fmt.Println("Received from Strawberry channel.  Now packing", cakeName)
                }
            case cakeName, choco_ok := <-choco_cs:
                if (!choco_ok) {
                    choco_closed = true
                    fmt.Println(" ... Chocolate channel closed!")
                } else {
                    fmt.Println("Received from Chocolate channel.  Now packing", cakeName)
                }
            }
        }
    }

    func main() {
        strbry_cs := make(chan string)
        choco_cs := make(chan string)

        //two cake makers
        go makeCakeAndSend(choco_cs, "Chocolate", 3)  //make 3 chocolate cakes and send
        go makeCakeAndSend(strbry_cs, "Strawberry", 3)  //make 3 strawberry cakes and send

        //one cake receiver and packer
        go receiveCakeAndPack(strbry_cs, choco_cs)  //pack all cakes received on these cake channels

        //sleep for a while so that the program doesn’t exit immediately
        time.Sleep(2 * 1e9)
    }

<p class="correct">

Waiting for a new cake ... 
Received from Strawberry channel. Now packing Strawberry Cake 1 
Waiting for a new cake ... 
Received from Chocolate channel. Now packing Chocolate Cake 1 
Waiting for a new cake ... 
Received from Chocolate channel. Now packing Chocolate Cake 2 
Waiting for a new cake ... 
Received from Strawberry channel. Now packing Strawberry Cake 2 
Waiting for a new cake ... 
Received from Strawberry channel. Now packing Strawberry Cake 3 
Waiting for a new cake ... 
Received from Chocolate channel. Now packing Chocolate Cake 3 
Waiting for a new cake ... 
... Strawberry channel closed! 
Waiting for a new cake ... 
... Chocolate channel closed!
</p>
