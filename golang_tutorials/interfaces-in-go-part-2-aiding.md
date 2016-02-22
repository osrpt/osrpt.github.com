---
layout: golang
title: Go 语言中的接口2 -- 协助设计高适应性和高扩展性
---

在[上一篇](/golang_tutorials/interfaces-in-go.html)文章的讨论中，我们从一个来自 OOP 语言中熟悉的示例开始 -- 一个 `Shaper` 接口和一些实现了该接口的形状。
但是正如 Rob 在[这个帖子](https://groups.google.com/forum/#!topic/golang-nuts/mg-8_jMyasY)中指出的那样，“Go 的接口不是 Java 或者 C# 接口的变体，它能做的更多。它是实现大规模的适应性和扩展性的关健因素。”

让我们快速看一下 Java 的接口然后对比一下 Go 的接口如何工作的，从而了解为什么Go的接口有更好的扩展能力和演进能力。
我们的数据结构将是一个 `Bus`，它可以使用接口从两个方面来看，一个有容量的盒子和一种可以携带一定数量乘客的交通工具。

`Java 类代码`

`Bus.java`

    //OOP Step 1: design your interface and class hierarchy

    //OOP Step 1.1: Pre-define what real-world abstractions could use the data we will define
    interface PublicTransport {
        int PassengerCapacity();
    }

    //OOP Step - repeat for any other interfaces
    interface Cuboid {
        int CubicVolume();
    }

    //OOP Step 2: Create data structures and implement all interfaces we have already defined in our class hierarchy
    public class Bus implements 
    PublicTransport, 
    Cuboid {

        //OOP Step 2.1: Define data structures for class
        int l, b, h, rows, seatsPerRow;

        public Bus(int l, int b, int h, int rows, int seatsPerRow) {
            this.l = l; this.b = b; this.h = h; this.rows = rows; this.seatsPerRow = seatsPerRow;
        }

        //OOP Step 2.2: Define method implementation
        public int CubicVolume() { return l*b*h; }

        public int PassengerCapacity() { return rows * seatsPerRow; }

        //OOP Step 3: Use the classes and methods in main program
        public static void main() {
            Bus b = new Bus(10, 6, 3, 10, 5);
            System.out.Println(b.CubicVolume());
            System.out.Println(b.PassengerCapacity()); 
        }
    }

*注意*：在上面的 Java 示例中，你必须要在实现前明确使用特殊的关键词例如 `implements` 来定义类的继承关系。
C# 语言使用 `:` 代替 `implements` 关键词。
在这样的例子中，任何项目需求的改变都将影响这些核心模块的变动。

大多数项目以这样的顺序开始，辗转于接口定义和数据结构之间，经过长时间的架构和设计，知道所有的因素包含所有的需求都被考虑到类等级的设计中 -- 这是一种对于改变项目需求非常头疼的任务。
在那之后，类等级是如此的坚固，通常来说任何没有经过深思熟虑的改变都是不行的。
在我工作过的项目中，项目架构由特定的架构师提供，只有通过委员会会议才能修改。
由于系统的复杂性这是非常合理的，对类似接口这样的核心元素的修改将导致很多下游的修改，所有的实现接口的类都需要更新。
一种替代方式是创建一个新类并且将已存在的类包裹起来，然后应用新接口。
当超过一定的体积和复杂度之后，这样可能完全导致失控。
为了管理复杂度和模块化修改，一些流行的变通方法出现了 -- 比如说设计模式，预先定义和标准化人们需要的类结构。
我必须承认我非常热爱设计模式和 OOP 设计过程中的智商考验。
但是回想起来，这样的智力受虐也并非总是能满足我们产品的需求。
设计模式它们自己非常多，学习曲线陡峭，每次需要回到核心设计的时候需要打起精神再次学习。
这真的需要如此艰难和精英主义吗？
Go 语言能否提供一种简单的方式来实现这种花费巨量时间获得的完美设计呢？

现在让我们通过一些相似的代码看看 Go 的例子：

`bus.go`

    package main

    import "fmt"

    //Go Step 1: Define your data structures
    type Bus struct {
        l, b, h int
        rows, seatsPerRow int
    }

    //Go Step 2: Define a real world abstraction that could use the data we structure we have
    type Cuboider interface {
        CubicVolume() int
    }

    //Go Step 3: Implement methods to work on data
    func (bus Bus) CubicVolume() int {
        return bus.l *  bus.b * bus.h
    }

    //Go step - repeat 2 & 3 for any other interfaces
    type PublicTransporter interface  {
        PassengerCapacity() int
    }

    func (bus Bus) PassengerCapacity() int {
        return bus.rows * bus.seatsPerRow
    }

    func main() {
        b := Bus{
                 l:10, b:6, h:3,
                 rows:10, seatsPerRow:5}

        fmt.Println("Cubic volume of bus:", b.CubicVolume())
        fmt.Println("Maximum number of passengers:", b.PassengerCapacity())
    }

在接口和类上所使用的名词是相似的，但是有一些不一样的地方。
一是缺少 Java 中用来定义等级的 `implements` 关键词。
同样地，它似乎也是数据中心化的 -- 首先定义数据然后沿着构建接口抽象前进。
在这里等级体系是一种一直相伴的不需要显示说明的 -- 依据类型中的方法签名联系起来，它通过实现特殊的接口来理解。
在这个简短的例子中，因为我们获得了同样的功能，所以这点区别可能没那么重要，但是当程序持续演进，我们需要添加真实世界中更多的抽象时，Go 语言的方式将被证明是非常有用的。

让我们假设现在是时候演进了，我们的 Bus 项目需求有了变更 -- 现在新出台了一项法律要求每个乘客都必须保证有一定的容积空间。
我们的 `Bus` 现在需要遵守一个和已经实现了的接口不一样的新接口叫做 `PersonalSpaceLaw`。
在 Java 和其他一些 OOP 语言中，我们需要做类似下面的事来满足这个变更：

`部分 Java 代码`：

    //new requirement that the Bus must be compatible with
    interface PersonalSpaceLaw {
        boolean IsCompliantWithLaw();
    }

    class Bus implements 
    PublicTransport, 
    Cuboid, 
    PersonalSpaceLaw {

        //... other existing code

        public IsCompliantWithLaw() 
        {
            return ( l * b * h ) / ( rows * seatsPerRow ) > 3;
        }
    }

这个功能变更需求引起了类结构的改变，这影响了我们核心类的修改，可能导致系统不稳定或者负面影响传播 -- 这需要召开架构师大会了。
不这样做通过创建子类，把这个类包裹起来是另外一种可行的方式，但是也可能会引起召开架构师大会来考虑类的等级结构。
（这里引用帖子中 Jesse McNeils 的话：“你不得不先说服谁负责 "class C" 的人先把接口添加到实现列表中。“）

让我们看看在 Go 语言中能否简单些：

`部分 Go 代码`

    //new requirement that the Bus must be compatible with
    type PersonalSpaceLaw interface {
        IsCompliantWithLaw() bool
    }

    func (b Bus) IsCompliantWithLaw() bool {
        return (b.l * b.b * b.h) / (b.rows * b.seatsPerRow) >= 3
    }

你可能已经看出来了，新方法在不影响核心类或者核心类等级的情况下被加上了。
这种实现更加的清晰，容易扩展，并且可以根据项目需求的改变有更好的弹性。
为了总结这种方法的好处，我将再次引用帖子中 John Asmuth 关于 Go 接口的生产效率的话，
“事实是我不用花时间看着类等级然后用几次来重新安排。事实不仅仅是它很容易正确实现 -- 而且事实上我也不需要担心是否使用了正确的算法。”

<p class="note">
Note: 这里我们没有在好的，经过深思熟虑的，清晰的设计上妥协。但是，设计师不再被设计过去，现在，未来甚至隐含可能，未来需求所束缚。
</p>

`完整代码，bus.go`

    package main

    import "fmt"

    type Bus struct {
        l, b, h int
        rows, seatsPerRow int
    }

    type Cuboider interface {
        CubicVolume() int
    }

    func (b Bus) CubicVolume() int {
        return b.l * b.b * b.h
    }

    type PublicTransporter interface {
        PassengerCapacity() int
    }

    func (b Bus) PassengerCapacity() int {
        return b.rows * b.seatsPerRow
    }

    func main() {
        b := Bus{
                 l:10, b:6, h:3,
                 rows:10, seatsPerRow:5}

        fmt.Println("Cubic volume of b:", b.CubicVolume())
        fmt.Println("Maximum number of passengers:", b.PassengerCapacity())
        fmt.Println("Is compliant with law:", b.IsCompliantWithLaw())
    }

    type PersonalSpaceLaw interface {
        IsCompliantWithLaw() bool
    }

    func (b Bus) IsCompliantWithLaw() bool {
        return (b.l * b.b * b.h) / (b.rows * b.seatsPerRow) >= 3
    }

查看原文：<http://golangtutorials.blogspot.jp/2012/01/interfaces-in-go-part-2-aiding.html>
