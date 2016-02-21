---
layout: golang
title: 结构的方法
---

我们已经了解到了结构可以包含数据。
结构同样可以以方法的形式包含行为。
在结构上添加方法的定义和一个普通的函数定义非常类似，唯一的区别是你需要添加说明结构类型。

一个命名为 `my_func` 的没有参数且返回 `int` 的函数使用类似下面的定义：

`Partial code`:

    func my_func() int {
       //code
    }

而一个命名为 `my_func` 的没有参数且返回 `int` 的，关连到一个结构的方法或函数使用类似下面的定义。

`Partial code`

    type my_type struct { }

    func (m my_type) my_func() int {
       //code
    }

现在让我们扩展前面定义的 `Rectangle` 结构，添加一个 `Area` 方法。
这次我们需要显示地指明 `Area` 方法是通过 `func (c Rectangle) Area() int` 方法定义在 Rectangle 上的。

`Full code`

    package main

    import "fmt"

    type Rectangle struct {
        length, width int
    }

    func (r Rectangle) Area() int {
        return r.length * r.width
    }

    func main() {
        r1 := Rectangle{4, 3}
        fmt.Println("Rectangle is: ", r1)
        fmt.Println("Rectangle area is: ", r1.Area())
    }

<p class="correct">
Rectangle is: {4 3}
Rectangle area is: 12
</p>

许多 OOP 语言都有一种使用 `this` 或者 `self` 隐式地引用当前实例的概念。
Go 没有这样的关键字。
当给一种类型定义一个函数或者关连一个方法时，它通过命名变量的方式 -- 在这个例子中即是 `(r Rectangle)`, 在方法中使用变量 `r`。

在上面调用 `Area` 的时候，`Rectangle` 的实例通过值传递进入。
你也可以通过传递引用的方式。
在调用方法的时候，调用的实例是值还是指针没有区别，因为 Go 会自动为你进行转换。

`Full code`

    package main

    import "fmt"

    type Rectangle struct {
        length, width int
    }

    func (r Rectangle) Area_by_value() int {
        return r.length * r.width
    }

    func (r *Rectangle) Area_by_reference() int {
        return r.length * r.width
    }

    func main() {
        r1 := Rectangle{4, 3}
        fmt.Println("Rectangle is: ", r1)
        fmt.Println("Rectangle area is: ", r1.Area_by_value())
        fmt.Println("Rectangle area is: ", r1.Area_by_reference())
        fmt.Println("Rectangle area is: ", (&r1).Area_by_value())
        fmt.Println("Rectangle area is: ", (&r1).Area_by_reference())
    }

<p class="correct">
Rectangle is: {4 3}
Rectangle area is: 12
Rectangle area is: 12
Rectangle area is: 12
Rectangle area is: 12
</p>

在上面的例子中，我们定义了两个相似的方法，一个将 `Rectangle` 的实例作为指针使用，另外一个使用值。
我们一次通过值 `r1` 调用方法，另外一次通过地址 `&r1`。
由于 Go 会自动转换，所以结果完全一样。

为了扩展这个示例，我们使用同样的方式再添加一个方法。
在下面的例子中，我们添加了一个方法 `Perimeter` 来计算 `Rectangle` 的周长。

`Full code`

    package main

    import "fmt"

    type Rectangle struct {
        length, width int
    }

    func (r Rectangle) Area() int {
        return r.length * r.width
    }

    func (r Rectangle) Perimeter() int {
        return 2* (r.length + r.width)
    }

    func main() {
        r1 := Rectangle{4, 3}
        fmt.Println("Rectangle is: ", r1)
        fmt.Println("Rectangle area is: ", r1.Area())
        fmt.Println("Rectangle perimeter is: ", r1.Perimeter())
    }

<p class="correct">
Rectangle is: {4 3}
Rectangle area is: 12
Rectangle perimeter is: 14
</p>

你可能已经开始觉得你可以给任何类型添加方法了，例如说 `int` 或者 `time.Time` -- 不，不可以。
你仅仅只有在定义在同一个包内时可以给一种类型添加方法。

`Partial code`

    func (t time.Time) first5Chars() string {
        return time.LocalTime().String()[0:5]
    }

<p class="error">
cannot define new methods on non-local type time.Time
</p>

但是，如果你确实需要扩展方法，你可以很容易地通过我们已经学过的匿名字段来完成。

`Full code`

    package main

    import "fmt"
    import "time"

    type myTime struct {
        time.Time //anonymous field
    }

    func (t myTime) first5Chars() string {
        return t.Time.String()[0:5]
    }

    func main() {
        m := myTime{*time.LocalTime()} //since time.LocalTime returns an address, we convert it to a value with *
        fmt.Println("Full time now:", m.String()) //calling existing String method on anonymous Time field
        fmt.Println("First 5 chars:", m.first5Chars()) //calling myTime.first5Chars
    }

<p class="correct">
Full time now: Tue Nov 10 23:00:00 UTC 2009
First 5 chars: Tue N
</p>

### 匿名字段上的方法

在前面的问题中我们已经引入了另外一个新东西 -- 在匿名成员上调用方法。
由于 `time.Time`la 是在 `myTime` 中的一个匿名成员，我们可以像是使用 `myTime` 的方法一样使用 `Time` 的方法。
例如：我们可以使用 `myTime.String()`。
让我们用前面的例子写一个小程序。

在下面的例子中我们将回到前面的 house，在 `House` 中我们定义了一个 `Kitchen` 的匿名成员。
我们已经知道我们可以直接访问匿名成员的方法，就像它们是属于包装类的一样。
既然 `House` 有一个匿名成员 `Kitchen`，那么反过来也就是它有一个方法 `totalForksAndKnives()`，所以 `House.totalForksAndKnives` 是一个合法的调用。

`Full code`:

    package main

    import "fmt"

    type Kitchen struct {
        numOfForks int 
        numOfKnives int
    }

    func(k Kitchen) totalForksAndKnives() int {
        return k.numOfForks + k.numOfKnives
    }

    type House struct {
        Kitchen //anonymous field
    }

    func main() {
        h := House{Kitchen{4, 4}} //the kitchen has 4 forks and 4 knives
        fmt.Println("Sum of forks and knives in house: ", h.totalForksAndKnives())  //called on House even though the method is associated with Kitchen
    }

<p class="correct">
Sum of forks and knives in house: 8
</p>
