---
layout: post
title: 结构中的匿名字段 -- 类似对象组合
---

Go 语言允许定义一个包含无变量名字段的结构。
这些字段称为匿名字段。
让我们通过一些示例来了解匿名字段是什么以及它为什么有用。

在下面的示例中，我们定义了一个 Kitchen 结构，只有一个盘子数量的字段。
我们又定义了另外一个结构 Hourse，包含了一个 Kitchen 的实例，但是它是匿名的，因为我们没有提供名字。

`Full code`

    package main

    import "fmt"

    type Kitchen struct {
        numOfPlates int
    }

    type House struct {
        Kitchen //anonymous field
        numOfRooms int
    }

    func main() {
        h := House{Kitchen{10}, 3} //to initialize you have to use composed type name.
        fmt.Println("House h has this many rooms:", h.numOfRooms) //numOfRooms is a field of House
        fmt.Println("House h has this many plates:", h.numOfPlates) //numOfPlates is a field of anonymous field Kitchen, so it can be referred to like a field of House
        fmt.Println("The Kitchen contents of this house are:", h.Kitchen) //we can refer to the embedded struct in its entirety by referring to the name of the struct type
    }

<p class="corrent">
House h has this many rooms: 3
House h has this many plates: 10
The Kitchen contents of this house are: {10}
</p>

首先需要注意的是，我们已经定义了 Kitchen 是一个匿名字段，我们可以直接访问它的成员，就像这些成员是包含在类中的一样。
作为对比，如果你使用类似 Java 的语言，你需要这样做：

`Partial Java Code`

    public class Kitchen {
        public int numOfPlates;
    }

    public class House {
        public Kitchen kitchen;
    }

    //and in main
    public static void main(String[] args) {
        House h = new House();
        h.kitchen.numOfPlates = 10; //referred as a sub field item.
    }

第二个需要注意的是，组成的字段仍然可以被访问，不过需要通过它的类型名。
所以在这个例子中，Kitchen 匿名字段需要用 `h.Kitchen` 来访问。
如果你需要打印 Kitch 的盘子数量，需要这样做：`fmt.Println(h.Kitchen.numOfPlates)`。

第三个需要注意的是，我们是怎样使用类型名来初始化的：`h := House{Kitchen{10}, 3}`。
在这里你需要协商类型名字，并且通过花括号提供它的值。
所以 `h := House{{10}, 3}` 和 `h := House{10, 3}` 都会导致编译错误。

### 匿名字段 -- 如果出现命名冲突

如果出现组成的结构中有多个相同名字的字段会发生什么呢？
如果是外部结构和内部匿名结构有相同的名字，那么默认获取外部结构的字段。
在下面的例子中，`Kitchen` 和 `House` 都有一个 `numOfLamps` 字段，但是 `House` 是外部结构，它的 `numOfLamps` 隐藏了 `Kitchen` 的。
如果你仍然想获得 `Kitchen` 的 `numOfLamps`，可以通过类型名获得 `h.Kitchen.numOfLamps`。

`Full Code`

    package main

    import "fmt"

    type Kitchen struct {
        numOfLamps int
    }

    type House struct {
        Kitchen
        numOfLamps int
    }

    func main() {
        h := House{Kitchen{2}, 10} //kitchen has 2 lamps, and the House has a total of 10 lamps
        fmt.Println("House h has this many lamps:", h.numOfLamps) //this is ok - the outer House's numOfLamps hides the other one.  Output is 10.
        fmt.Println("The Kitchen in house h has this many lamps:", h.Kitchen.numOfLamps) //we can still reach the number of lamps in the kitchen by using the type name h.Kitchen
    }

<p class="correct">
House h has this many lamps: 10
The Kitchen in house h has this many lamps: 2
</p>

从这里可以看出有一个当在不同层级的组合中出现同名字段时的字段决定规则。
但是没有在同级出现同名字段时的决定规则 -- 意思是如果出现这种问题，需要自己动手解决。

在下面的代码中，`Kitchen` 和 `Bedroom` 都有一个叫做 `numOfLamps` 的字段，他们都以匿名的方式包含在 `House` 中。
现在如果引用 `House.numOfLamps`，Go 编译器不知道你是需要 `Kitchen` 的 `numOfLamps` 还是 `Bedroom` 的 `numOfLamps`，所以会抛出错误。

`Full file: structs2.go`

    package main

    import "fmt"

    type Kitchen struct {
        numOfLamps int
    }

    type Bedroom struct {
        numOfLamps int
    }

    type House struct {
        Kitchen
        Bedroom
    }

    func main() {
        h := House{Kitchen{2}, Bedroom{3}} //kitchen has 2 lamps, Bedroom has 3 lamps
        fmt.Println("Ambiguous number of lamps:", h.numOfLamps) //this is an error due to ambiguousness - is it Kitchen.numOfLamps or Bedroom.numOfLamps
    }

编译错误：

<p class="error">
8g -o _go_.8 structs2.go
structs2.go:20: ambiguous DOT reference House.numOfLamps
make: *** [_go_.8] Error 1
</p>

为了解决这个问题，你需要显示地使用匿名类型的类型名来获取字段。
在下面的例子中，我们通过类型名实现了对厨房和卧室的灯数量求和。

    package main

    import "fmt"

    type Kitchen struct {
        numOfLamps int
    }

    type Bedroom struct {
        numOfLamps int
    }

    type House struct {
        Kitchen
        Bedroom
    }

    func main() {
        h := House{Kitchen{2}, Bedroom{3}}
        fmt.Println("House h has this many lamps:", h.Kitchen.numOfLamps + h.Bedroom.numOfLamps) //refer to fields via type name
    }

<p class="correct">
House h has this many lamps: 5
</p>
