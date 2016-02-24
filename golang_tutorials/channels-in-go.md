---
layout: golang
title: Go 中的 channel
source: http://golangtutorials.blogspot.jp/2011/06/channels-in-go.html
---

goroutine 允许你让一段代码相对于其他并行执行。
但是为了让它有用，还有一些先决条件 —— 我们得能够把数据传递到运行中的进程中并且还要可以在运行中的程序把数据创建好时能获取出来。
channel 提供了实现方式，并且它独立于 goroutine 工作。

一个 channel 可以理解为一个有指定大小和容积的管道或者传送带。
在一端可以向上放东西而在另一端可以取到。

![channel](/images/post/golang/channels.jpg)

我们将使用一个蛋糕制作和打包工厂的例子来说明。
有一台制作蛋糕的机器，另外一台可以将蛋糕放进盒子里面。
它们通过传送带来通信 —— 制作机把蛋糕放到传送带上，当打包机发现一个蛋糕后就拿走并放进盒子里面。

在 Go 语言中，`chan` 关键词用来定义一个 channel。
`make` 关键词用来创建，并且同时需要说明能够承载的数据的类型。

`Partial code`

    ic := make(chan int) // 可以发送和接收 int 的 channel
    sc := make(chan string) // 可以发送和接收 string 的 channel
    myc := make (chan my_type) // 可以发送和接收自定义结构类型的 channel

你可以把操作符 `<-` 放在 channel 前后来指示在 channel 上发送或者接收数据。
如果 `my_channel` 是一个传输 `int` 的 channel，你可以使用 `my_channel <- 5` 来发送数据，并且可以通过 `my_recvd_value <- my_channel` 把数据接收到变量中。
把 channel 想像成一个传送带来了解使用的方向：指向 channel 的箭头表示向其中放入数据而一个朝向外面的箭头表示从中取出数据。

`Partial code`

    my_channel := make(chan int)

    // 在某个 goroutine 中 —— 将数据放到 channel 上
    my_channel <- 5 

    // 在其他的 goroutine 上 —— 从 channel 上取走数据
    var my_recvd_value int
    my_recvd_value = <- my_channel

你也可以在 `chan` 关键词周围指定 channel 数据流动的方向。我们将在后面看到这种方式的用处。

`Partial code`

    ic_send_only := make (<-chan int) // 一个只能发送数据的 channel —— 向外的箭头表示发送
    ic_recv_only := make (chan<- int) // 一个只能接收数据的 channel —— 向内的箭头表示接收

在 channel 上（我们的传送带）可以运送的数据数量非常重要。
它说明了一次可以工作的数量。
即使生产者非常能干可以产生很多数据，但是如果接收者能力不足以接受，这样也无法工作。
将会有很多蛋糕掉在地上被浪费掉。
（由于 channel 实际上没有动，我不太喜欢用传送带举例——但是它对于说明掉在地上的蛋糕非常好！）
在并行计算中，这个叫做生产者-消费者同步问题。

我们目前为止定义的 channel 默认是同步的 channel。
一个数据放到 channel 上，它必须要等待另外一方拿走才能继续放下一个。
下面让我们来实现我们的蛋糕制作和打包工厂。

由于 channel 是在 goroutine 之间通信的，所以有两个方法叫做 `makeCakeAndSend` 和 `receiveCakeAndPack`。
每一个都接收同一个 channel 的引用作为参数，这样它们可以通过它来通信。

`Full code`

    package main

    import (
        "fmt"
        "time"
        "strconv"
    )

    var i int

    func makeCakeAndSend(cs chan string) {
        i = i + 1
        cakeName := "Strawberry Cake " + strconv.Itoa(i)
        fmt.Println("Making a cake and sending ...", cakeName)
        cs <- cakeName // 发送一个草苺蛋糕
    }

    func receiveCakeAndPack(cs chan string) {
        s := <-cs // 从 channel 上获取任何一个蛋糕
        fmt.Println("Packing received cake: ", s)
    }

    func main() {
        cs := make(chan string)
        for i := 0; i<3; i++ {
            go makeCakeAndSend(cs)
            go receiveCakeAndPack(cs)

            // sleep 一小会儿，以使程序不会立即退出并且可以清晰地看到输出
            time.Sleep(1 * 1e9)
        }
    }

<p>
Making a cake and sending ... Strawberry Cake 1 
Packing received cake: Strawberry Cake 1 
Making a cake and sending ... Strawberry Cake 2 
Packing received cake: Strawberry Cake 2 
Making a cake and sending ... Strawberry Cake 3 
Packing received cake: Strawberry Cake 3
</p>

在上面的代码中，我们进行了三次调用蛋糕制作并且立即打包。
我们知道在我们调用打包的时候已经有一个蛋糕准备好了。
虽然这个代码有点弄虚作假 —— 在调用打印 “Making a cake and sending ...” 和实际的发送蛋糕到 channel 之间有一点时间延迟。
我们在每次循环中使用的 `time.Sleep()` 产生了一个暂停，让我们的制作和打包可以一个接一个地进行。
由于我们的 channel 是同步的，每次只允许有一个，在产生一个新蛋糕并放到 channel 上之前必须先从 channel 上移走一个蛋糕并打包。

让我们修改一下代码，让它更像我们通常使用的代码。
典型的 goroutine 可能在其中重复运行一段代码，运行操作，通过 channel 和其他 goroutine 交换数据。
在下面的例子中，我们将循环移到 goroutine 中并且只调用一次 goroutine。
一段时间后，从输出可以看出，我们制作了三个蛋糕并且打包。

`Full code`

    package main

    import (
        "fmt"
        "time"
        "strconv"
    )

    func makeCakeAndSend(cs chan string) {
        for i := 1; i<=3; i++ {
            cakeName := "Strawberry Cake " + strconv.Itoa(i)
            fmt.Println("Making a cake and sending ...", cakeName)
            cs <- cakeName // 发送一个草苺蛋糕
        }
    }

    func receiveCakeAndPack(cs chan string) {
        for i := 1; i<=3; i++ {
            s := <-cs // 在 channel 上获取任意一个蛋糕
            fmt.Println("Packing received cake: ", s)
        }
    }

    func main() {
        cs := make(chan string)
        go makeCakeAndSend(cs)
        go receiveCakeAndPack(cs)

        // sleep 一段时间，阻止程序立即停止
        time.Sleep(4 * 1e9)
    }

<p>
Making a cake and sending ... Strawberry Cake 1
Making a cake and sending ... Strawberry Cake 2
Packing received cake: Strawberry Cake 1
Packing received cake: Strawberry Cake 2
Making a cake and sending ... Strawberry Cake 3
Packing received cake: Strawberry Cake 3
</p>

上面是在我电脑上的输出。
你的输出根据在你机器上的 goroutine 执行的不同可能会不一样。
前面已经说过，我们只调用了每个 goroutine 一次，并且传入 channel 命令。
在每个 goroutine 中分别有三个循环，`makeCakeAndSend` 把数据放到 `channel` 上而 `receiveCakeAndPack` 从 `channel` 上取走。
由于调用了这两个 goroutine 后程序会立即结束，所以我们需要人工添加一个暂停时间，直到三个蛋糕都制作完并且打包好。

需要重点理解的是上面我们看到的输出不是 channel 上数据发送和接收正确反应。
发送和接收是同步的 —— 一次一个蛋糕。
但是由于打印消息和 channel 上的数据发送和传输之间有延时，所以输出似乎不是正确的顺序。
所以实际上发送的事情是：

    Making a cake and sending ... Strawberry Cake 1 
    Packing received cake: Strawberry Cake 1 
    Making a cake and sending ... Strawberry Cake 2 
    Packing received cake: Strawberry Cake 2 
    Making a cake and sending ... Strawberry Cake 3 Packing received cake: Strawberry Cake 3 

所以在使用打印日志来分析 goroutine 和 channel 代码的时候一定要注意。
