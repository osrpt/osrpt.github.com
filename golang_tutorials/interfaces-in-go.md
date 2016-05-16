---
layout: golang
title: Go 语言中的接口
source: http://golangtutorials.blogspot.jp/2011/06/interfaces-in-go.html
---

接口是一种存在于期望的功能实现和它的真实实现之间的约定。
在现实生活中有数不清的我们隐涵地遵守的接口和我们希望别人遵守的接口。
当我们把钱放到银行，我们期望第二天钱仍然在那里，而且可以获得一天的利息，这样我们的钱就变多了。
银行怎样安全地保管钱和它怎么产生利息是我们通常不关心的事情。
这种隐式的合同是我们和银行的接口，同样也是银行和我们的接口。

在编程中，接口遵循类似的模式。
我们将通过一个例子来说明 Go 的接口实现，这和 Java, C++, C# 等不同。
在它们中有面向对象的基础。
Go 是一个面向过程的实现，但是它也工作得很好并且有很多积极的方面。

在我们的例子中，我们将计算不同形状的面积。
矩形是一种形状，正方形是一种形状，圆也是一种形状...... 而形状都有面积。
所以，形状作为一种抽象的概念，可以成为一个接口。
而那些具体的形状比如圆，矩形，三角形等。
可以提供它们的面积。
我们可以提供一种统一的方式获取不同形状的面积。

如果你是一个初学者，可能这样的例子的影响还不够清楚，但是它非常强大。
当你旅行到一个你不懂当地语言的地方，在你需要的时候你想知道信息将非常艰难。
"什么时候火车到站？" -- 如果有一个不管你在世界上哪个地方都能问的问题就好了。
但是很不幸，没有，所以你必须要缩短你的句子，提高音量，摇动手臂，指着某个东西，写在手上等更多事情。
在计算机中也是这样，我们需要处理很多种不同类型的对象并且为了让他们始终如一地交流，我们使用接口。

首先，我们可以创建一个简单的矩形类并且输出它的面积。

`Full code`

    package main

    import "fmt"

    //define a Rectangle struct that has a length and a width
    type Rectangle struct {
       length, width int
    }

    //write a function Area that can apply to a Rectangle type
    func (r Rectangle) Area() int {
       return r.length * r.width
    }

    func main() {
       r := Rectangle{length:5, width:3} //define a new Rectangle instance with values for its properties
       fmt.Println("Rectangle details are: ",r)
       fmt.Println("Rectangle's area is: ", r.Area())
    }

<p class="correct">
Rectangle details are: {5 3}
Rectangle's area is: 15
</p>

在此时，这个代码中还没有接口。
像我们之前提到的，现在让我们来添加接口。
`Area` 方法就是我们将抽象出来放入接口 `Shaper` 中的。

<p class="note">
在 Go 语言中，`er` 是一种惯用的表示接口的方式。
当 `Shape` 是一个接口时最好命名为 `Shaper`。
当 `Convert` 是一个接口时最好命名为 `Converter`。
不这样做也不会影响你的程序执行，但是最好遵守约定，这样其他读到代码的人可以更好地理解其意图。
</p>

`Full code`

    package main

    import "fmt"

    //Shaper is an interface and has a single function Area that returns an int.
    type Shaper interface {
       Area() int
    }

    type Rectangle struct {
       length, width int
    }

    //this function Area works on the type Rectangle and has the same function signature defined in the interface Shaper.  Therefore, Rectangle now implements the interface Shaper.
    func (r Rectangle) Area() int {
       return r.length * r.width
    }

    func main() {
       r := Rectangle{length:5, width:3}
       fmt.Println("Rectangle r details are: ", r)
       fmt.Println("Rectangle r's area is: ", r.Area())

       s := Shaper(r)
       fmt.Println("Area of the Shape r is: ", s.Area())
    }

<p class="correct">
Rectangle r details are: {5 3}
Rectangle r's area is: 15
Area of the Shape r is: 15
</p>

在类似 Java 和 C# 的语言中，想要实现某个接口的类必须显示地说明。
所以在 Java 中，我们需要这样做：

    public class Rectangle implements Shaper { // implementation here }

但是在 Go 语言中，这样显示地说明实现是没有必要的。
你可以在代码中看到。
`Shaper` 接口仅定义了一个单独的方法 `Area() int`。
`Rectangle` 类型有同样签名的一个方法： `func (r Rectangle) Area() int`。
所以 Go 语言自动理解到 `Rectangle` 类型实现了 `Shaper` 接口。
因此你可以将 `Rectangle` 类型转化为 `Shaper` 类型：`s := Shaper(r)` 并且调用 `Area` 方法： `s.Area()`。

目前为止我们获得了和之前一样的结果。现在让我们添加一个 `Square` 类型看看接口是怎样用来让 `Area` 方法一样调用的。

`Full code`

    package main

    import "fmt"

    type Shaper interface {
       Area() int
    }

    type Rectangle struct {
       length, width int
    }

    func (r Rectangle) Area() int {
       return r.length * r.width
    }

    type Square struct {
       side int
    }

    //the Square type also has an Area function and therefore, it too, implements the Shaper interface
    func (sq Square) Area() int {
       return sq.side * sq.side
    }

    func main() {
       r := Rectangle{length:5, width:3}
       fmt.Println("Rectangle details are: ",r)  

       var s Shaper
       s = r //equivalent to "s = Shaper(r)" since Go identifies r matches the Shaper interface
       fmt.Println("Area of Shaper(Rectangle): ", s.Area())
       fmt.Println()

       q := Square{side:5}
       fmt.Println("Square details are: ",q)  
       s = q //equivalent to "s = Shaper(q)
       fmt.Println("Area of Shaper(Square): ", s.Area())
       fmt.Println()
    }

<p class="correct">
Rectangle details are: {5 3}
Area of Shaper(Rectangle): 15

Square details are: {5}
Area of Shaper(Square): 25
</p>

现在我们也有了 `Square` 类型，并且和 `Rectangle` 类型相似，我们可以获得它的面积。
让我们再次获得相似的输出，但是使用循环来说明接口怎样让我们的代码更清晰简单并且更加有伸缩性。
在下面的例子中，我们将创建一个 `Shaper` 的实例数组然后遍历，在每一项上调用 `Area` 方法。
和之前的效果一样，但是现在提升了潜能。

`Full code`

    package main

    import "fmt"

    type Shaper interface {
       Area() int
    }

    type Rectangle struct {
       length, width int
    }

    func (r Rectangle) Area() int {
       return r.length * r.width
    }

    type Square struct {
       side int
    }

    func (sq Square) Area() int {
       return sq.side * sq.side
    }

    func main() {
       r := Rectangle{length:5, width:3}
       q := Square{side:5}
       shapesArr := [...]Shaper{r, q}

       fmt.Println("Looping through shapes for area ...")
       for n, _ := range shapesArr {
           fmt.Println("Shape details: ", shapesArr[n])
           fmt.Println("Area of this shape is: ", shapesArr[n].Area())
       }
    }

<p class="correct">
Looping through shapes for area ...
Shape details: {5 3}
Area of this shape is: 15
Shape details: {5}
Area of this shape is: 25
</p>
