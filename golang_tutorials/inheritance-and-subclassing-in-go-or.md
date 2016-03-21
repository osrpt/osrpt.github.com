---
layout: golang
title: Go 语言中的继承 -- 或者说是类似实现
source: http://golangtutorials.blogspot.jp/2011/06/inheritance-and-subclassing-in-go-or.html
---

如果你使用过其他面向对象编程语言，你可能已经知道继承和子类是什么了。
简单来说，这是一种让一种类型继承另外一种类型的能力。
`Employee` 包含了所有 `Human` 的所有行为，然后是其他一些自己的行为。
`Ferari` 有所有 `Car` 的行为，然后是一些其他的。
`Aston Martin` 有所有的 `Car` 的行为，还有一些其他的，但是跟 `Ferrari` 的不一样。
如果我们能够概括出 `Car` 的行为并定义，这样 `Ferrari` 和 `Aston Martin` 都可以用，而不是每一个都要自己多做一遍。
一般来说，是从一个高度概括的类型继承。
在 OOP 语言中，如果有一个类和它的子类，那么子类就拥有它父类的所有行为。
而且子类还可以继续定义它特殊的行为。

在编程中这有什么用呢？
假设你有一个 `Car` 类并且它有一个方法叫做 `numberOfWheels`。
如果创建 `Car` 的子类 `Ferrari`，在代码上我们就可以使用 `Ferrari.numberOfWheels()`。
从这个例子中可以看出子类获得了超类的行为和方法。

在前面我们已经学过 [结构中的匿名成员] 和 [结构的方法]，我们可以在 Go 语言中实现同样范式。
如果你跟我一样已经习惯了 OOP 语言，下面的这些例子会有所帮助。

`Full code`

    package main

    import "fmt"

    type Car struct {
        wheelCount int
    }

    // define a behavior for Car
    func (car Car) numberOfWheels() int {
        return car.wheelCount
    }

    type Ferrari struct {
        Car //anonymous field Car
    }

    func main() {
        f := Ferrari{Car{4}}
        fmt.Println("A Ferrari has this many wheels: ", f.numberOfWheels()) //no method defined for Ferrari, but we have the same behavior as Car.
    }

<p>
A Ferrari has this many wheels: 4
</p>

在上面的程序中，我们只给 `Car` 定义了一个方法。
我们接着定义了 `Ferrari` 有一个匿名成员 `Car`，这样 `Ferrari` 就自动可以调用匿名成员的所有公开可见方法。
所以在这里，我们没有父类的子类，但是我们使用了组成。
不过做事是非常相似的 -- 你不需要 OOP 中的方式就已经有了父类的行为。
你必须得统一这非常棒，对吧？
下面让我们引入 `Aston Martin`，是时候添加一些独立的更多特性了。

`Full code`

    package main

    import "fmt"

    type Car struct {
        wheelCount int
    }

    func (car Car) numberOfWheels() int {
        return car.wheelCount
    }

    type Ferrari struct {
        Car
    }

    // a behavior only available for the Ferrari
    func (f Ferrari) sayHiToSchumacher() {
        fmt.Println("Hi Schumacher!")
    }

    type AstonMartin struct {
        Car
    }

    // a behavior only available for the AstonMartin
    func (a AstonMartin) sayHiToBond() {
        fmt.Println("Hi Bond, James Bond!")
    }

    func main() {
        f := Ferrari{Car{4}}
        fmt.Println("A Ferrari has this many wheels: ", f.numberOfWheels()) //has car behavior
        f.sayHiToSchumacher() //has Ferrari behavior

        a := AstonMartin{Car{4}}
        fmt.Println("An Aston Martin has this many wheels: ", a.numberOfWheels()) //has car behavior
        a.sayHiToBond() //has AstonMartin behavior
    }

<p class="correct">
A Ferrari has this many wheels: 4
Hi Schumacher!
An Aston Martin has this many wheels: 4
Hi Bond, James Bond!
</p>

在上面的例子中，`Aston Martin` 和 `Ferrari` 的行为都类似一个 `Car` -- 因为他们都可以调用来自 `Car` 的方法 `numberOfWheels`，就好像是直接包含的一样。
而且，它们还定义了只能它们自己使用的行为。
所以 `Car` 和 `AstonMartin` 都不可以调用 `sayHiToSchumacher`，同样地只有 `AstonMartin` 可以调用 `sayHiToBond` 而 `Ferrari` 和 `Car` 都不可以。

简单来说，通过使用 Go 的匿名成员概念，我们达到了和子类继承相同的构想。
起初会觉得和子类相比这种方式是翻转过来了，因为你把父类放在了子类中。
