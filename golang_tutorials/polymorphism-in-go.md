---
layout: golang
title: Go 语言中的多态性
---

有时候我发现使用插图来解释多态性更加容易。
虽然插图看起来简单且有缺陷，但是对阐明概念很有帮助。
假设有个火星人来到了地球，他知道人类，但是不知道男人和女人的区别。
他现在在大街上随机接近人群并且问同样的问题：“人类，请告诉我你喜欢做什么”。
假设这个火星人遇到的第一个人是一个男人。
作为一个西部的老套的人，他的回答可能是：“我喜欢钓鱼”。
现在节射它使用同样问题问一个女人。
同样地，作为一个老套的女人，她的回答可能是：“我喜欢购物”。
在火星人现在看来，它只是问了一个人类，但是它每次得到了不同的回答。
答案根据它问的不同的特定的人而不同。
可能这是个有点傻的例子，但是它类似于多态性 -- 同样的类型有不同的响应，在这个例子里面根据特定的人类而不同。

在 Go 语言中，我们使用接口来实现这种多态性。
如果你需要了解 Go 语言中的接口，请阅读本系列教程中的：[Go 语言中的接口](/golang_tutorials/interfaces-in-go.html)。
如果我们创建了一个接口，并且有其他实现了改接口的类型，那么我们可以通过定义在接口中的方法来进入这些类型中，而不必要知道每一个确定的类型是什么。
下面让我们来实现一下，看看我们能得到什么。

`Full code`

    package main

    import "fmt"

    type Human interface {
        myStereotype() string
    }

    type Man struct {
    }

    func (m Man) myStereotype() string {
        return "I'm going fishing."
    }

    type Woman struct {
    }

    func (m Woman) myStereotype() string {
        return "I'm going shopping."
    }
    func main() {
        m := new (Man)
        w := new (Woman)

        //an array of Humans - we don’t know whether Man or Woman
        hArr := [...]Human{m, w} //array of 2 Humans. One is the type Man, one is the type Woman.
        for n, _ := range (hArr) {
            fmt.Println("I'm a human, and my stereotype is: ", hArr[n].myStereotype())   //appears as human type, but behavior changes depending on actual instance
        }
    }

<p class="correct">
I'm a human, and my stereotype is: I'm going fishing.
I'm a human, and my stereotype is: I'm going shopping.
</p>

在上面代码的 `for` 循环中，我们可以请求每个人的 `stereotype`，根据本质上的类型的不同，也就是是男人还是女人，我们获得了不同的输入。
在调用的时候，我们仅知道它是一个 `Human` -- 这样看起来似乎每次人都在变化。
好了，这就是多态！

我希望这个例子足够简单理解并且可以说明这个概念。
多态，至少对我来说，是一个较难解释的概念，这就是我用一个简单例子的原因。
但是如果你思考一下，上面的例子在现实中是可以实现的，因为 `Man` 和 `Woman` 都是继承自 `Human`。
所以让我们更进一步地扩展这个例子。

我们这次把接口改为 `Hobby`。
这次我们有源自于 `Human` 的 `Man` 和 `Woman`。
另外我们再添加一个 `Dog` 类型，不继承自以上任何一种类型。
但是我们将让每一个类型都实现接口 `Hobby`。
然后，我们就可以在所有类型上调用 `myStereotype` 而且可以根据不同的具体类型获得不一样的结果。

`Full code`

    package main

    import "fmt"

    type Hobby interface {
        myStereotype() string
    }

    type Human struct {

    }

    func (h Human) myStereotype() string {
        return "I'm a Human, only an abstract concept, and I can have no hobby."
    }

    type Man struct {
        Human //anonymous class to inherit Human behavior
    }

    func (m Man) myStereotype() string {
        return "I'm a Man and I'm going fishing."
    }

    type Woman struct {
        Human //anonymous class to inherit Human behavior
    }

    func (m Woman) myStereotype() string {
        return "I'm a Woman and I'm going shopping."
    }

    type Dog struct {
        //does not inherit any other type
    }

    func (m Dog) myStereotype() string {
        return "bow bow bow, I'm chasing sticks."
    }

    func main() {
        h := new (Human)
        m := new (Man)
        w := new (Woman)
        d := new (Dog)

        //an array of hobby instances - we don’t need to know whether human or dog
        hobbyArr := [...]Hobby{h, m, w, d} //array of 3 Humans and 1 dog.
        for n, _ := range (hobbyArr ) {

            fmt.Println("My hobby?  Well,", hobbyArr [n].myStereotype())  //appears as Hobby type, but behavior changes depending on actual instance

        }
    }

<p class="correct">
My hobby? Well, I'm a Human, only an abstract concept, and I can have no hobby.
My hobby? Well, I'm a Man and I'm going fishing.
My hobby? Well, I'm a Woman and I'm going shopping.
My hobby? Well, bow bow bow, I'm chasing sticks.
</p>

查看原文：<http://golangtutorials.blogspot.jp/2011/06/polymorphism-in-go.html>
