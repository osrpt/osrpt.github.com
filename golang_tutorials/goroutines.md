---
layout: golang
title: Goroutine
source: http://golangtutorials.blogspot.jp/2011/06/goroutines.html
---

Goroutine 让你可以并行地执行任务 -- 在计算机中，“并行” 一词有许多含义，因此，让我们先来消化一下它。
并行可以指在多个硬件设备上运行同一个程序，在多个机器上执行，在一个机器的多个线程上执行。
Go 语言的文档中说："Goroutine 会多路传输到多个操作系统线程上，所以如果一个阻塞，例如等待 I/O，其他的可以继续运行"。
实际上为了提供并行能力 Goroutine 向我们隐藏了许多机器内部的复查性。
这也意味着语言设计者可以在机器上调整 goroutine 以充分利用硬件和 CPU 的能力。

这种并行和我们平常的程序有何不同呢？
在我们使用的大多数程序中，是按照顺序执行的。
考虑到人类操作的缓慢和计算机超高速的处理能力，计算机顺序处理并不会影响使用。
例如说当你使用键盘打字时，你的打字速度是远远低于计算机能处理的速度的 -- 所以如果顺序处理是完全没问题的。
但是在一些其他的特定系统中，这可能是无法接受的 -- 例如说一个需要支撑成千上万用户访问的网络服务器。
这种典型的服务器一般都有强大的计算能力，尽管如此，顺序处理每个用户的请求仍然是无法接受的。

下面让我们用一个简单的例子来说明和了解使用 goroutine 的并行计算。
想像一个运动员会。
有许多的事件同时发送 -- 跳高，跳远，100 米撑杆等。
我们不想在开始一项运动之前必须要等另外一项结束。

![Parallel execution](/images/post/golang/parallel-execution.jpg)

Go 语言中的 goroutine 和普通方法相似，唯一的区别是你在真正的调用之前需要添加一个 `go` 关键词。
假设 `my_function()` 是一个方法，如果想作为一个 goroutine 执行，那么使用 `go my_function()` —— 这样就可以让它作为一个并行的进程执行。
下面让我们举一个并没有有效利用并行执行的简单例子。

`Partial code`

    func add2Numbers(a, b int) {
        fmt.Println( a + b )
    }

    func main() {
        add2Numbers(1, 2) //普通的方法调用
        go add2Numbers(1, 2) // 作为 goroutine 并行执行的普通方法调用
    }

现在让我们来实现运动会的模拟。
我们需要一个方法来说明正在发生一个事件，在方法内我们使用 `Sleep` 来模拟该运动消耗的时间。
在运动比赛中睡觉？
好吧，我得说这不是一个好选择，但是请跟着我继续吧，好吗？
在第一个版本的代码中，我们将使用普通的方法调用，我们将在后面用 `goroutine` 的版本做对比。

`Full code`

    package main

    import (
        "fmt"
        "time"
    )

    func simulateEvent(name string, timeInSecs int64) { 
        // sleep 一段事件来模拟该事件的消耗
        fmt.Println("Started ", name, ": Should take", timeInSecs, "seconds.")
        time.Sleep(timeInSecs * 1e9 )
        fmt.Println("Finished ", name)
    }

    func main() {
        simulateEvent("100m sprint", 10) // 开始 100 米撑杆，将花费 10 秒钟
        simulateEvent("Long jump", 6) // 开始跳远，需要 6 秒钟
        simulateEvent("High jump", 3) // 开始跳高，需要 3 秒钟
    }

<p class="correct">
Started 100m sprint : Should take 10 seconds.
Finished 100m sprint
Started Long jump : Should take 6 seconds.
Finished Long jump
Started High jump : Should take 3 seconds.
Finished High jump
</p>

你可以从上面的输出中看到，每个事件都是顺序执行的。
在下一个事件开始前第一个事件必须要执行完。
现在让我们使用 goroutine 来重写 —— 注意只需要添加关键词 `go` 到每一个方法前面就行了。

`Full code`

    package main

    import (
        "fmt"
        "time"
    )

    func simulateEvent(name string, timeInSecs int64) { 
        // sleep 一段事件来模拟该事件的消耗
        fmt.Println("Started ", name, ": Should take", timeInSecs, "seconds.")
        time.Sleep(timeInSecs * 1e9 )
        fmt.Println("Finished ", name)
    }

    func main() {
        go simulateEvent("100m sprint", 10) // 开始 100 米撑杆，将花费 10 秒钟
        go simulateEvent("Long jump", 6) // 开始跳远，需要 6 秒钟
        go simulateEvent("High jump", 3) // 开始跳高，需要 3 秒钟

        // 让整个程序等一会儿，这样我们的程序就不会退出了
        time.Sleep(12 * 1e9)
    }

<p class="correct">
Started Long jump : Should take 6 seconds.
Started 100m sprint : Should take 10 seconds.
Started High jump : Should take 3 seconds.
Finished High jump
Finished Long jump
Finished 100m sprit
</p>

从输出中可以看出来，相对于前面版本的顺序执行，现在是并行执行的了。
跳远事件不必等 100 米撑杆事件先完成了，跳高事件也没有等待其他任何事件。

需要注意的是 goroutine 在主程序推出之后就不能存在了 —— 在上面的程序中如果我们在程序的最后不添加 `time.Sleep(12 * 1e9)` 来等待 12 秒钟，程序将会停止并且终止所有的 goroutine。
在 web 服务这样的程序中，程序将永远运行等待用户的连接。

<p class="note">
上面的输出中有一个奇怪的地方，我们先触发了 100m 撑杆跳，但是先打印出来的是跳远。
我重复执行后得到了同样的输出。
我不确定为什么会这样。
从这里可以学到的一个重点是不要在编码上依赖一个 goroutine 是否开始。
它们应该是执行上面独立的单元，通过 Go 语言的 channel 来通信。

可能是 100m 撑杆跳先执行了，但是它的打印过程比另外一个稍微耗时更长一点，不过这两个 goroutine 实例仍然是按照顺序执行的。
在任何情况下，不要依赖这个顺序。
我使用安装在我的 Windows 7 中的 Ubuntu 10.4 虚拟机可以重现这个问题。
</p>

<p class="note">
关于并行计算需要小心的提示。
有许多的复杂性需要考虑 —— 例如当多个进行在同一份数据上工作时，最后可能影响数据，这时会发生什么？
我们如何可靠地和不同的并行进程通信？
如何按照正确的顺序上发送和接收数据？
这些问题中有的没有简单的办法，Go 语言也不保证它可以处理任何问题 —— 但是它能够解决一些并且针对其他问题它也提供了可以采用的原则上的好指导。
在其他章节中我们将看一些其他例子和它们的解决方案。
</p>
