---
layout: golang
title: Go 中的多重继承
source: http://golangtutorials.blogspot.jp/2011/06/multiple-inheritance-in-go.html
---

继承是一个类型自动包含父类的行为的能力。
多重继承是一种一个类型包含多个父类行为的能力。
举个真实世界的例子，如果 `Phone` 是一种类型，那么 `MobilePhone` 是一种继承了 `Phone` 类型行为的类型。
这个在大多数情况下适用的，但是不是所有。
`CameraPhone` 的类型就包含了 `Camera` 和 `Phone` 的所有行为？
一种直观的解决这个问题的方式是允许同时继承两个类型。
(注意这个例子是很简单的情况，把相机放进手机和把手机放进相机都是可以的，但是不是所有情况都是这样的 -- 比如说一个继承了父母亲特征的孩子)

有些 OOP 语言通过否认多重继承的必要性来解决这个问题。
其他的语言提供了接口，并且允许一个类型实现多个接口来解决这个问题。
Go 和他们不一样，它允许多重继承。
实现方式和我们已经看到的单个继承完全一样，即使用匿名成员。
下面让我们来实现我们的 `Camera + Phone = CameraPhone` 的例子：

`Full code`

    package main

    import "fmt"

    type Camera struct { } 

    func (_ Camera) takePicture() string { //not using the type, so discard it by putting a _
        return "Click"
    }

    type Phone struct { } 

    func (_ Phone ) call() string { //not using the type, so discard it by putting a _
        return "Ring Ring"
    }

    // multiple inheritance
    type CameraPhone struct {
        Camera //has anonymous camera
        Phone //has anonymous phone 
    }

    func main() {
        cp := new (CameraPhone)  //a new camera phone instance
        fmt.Println("Our new CameraPhone exhibits multiple behaviors ...")
        fmt.Println("It can take a picture: ", cp.takePicture()) //exhibits behavior of a Camera
        fmt.Println("It can also make calls: ", cp.call()) //... and also that of a Phone
    }

<p class="correct">
Our new CameraPhone exhibits multiple behaviors ...
It can take a picture: Click
It can also make calls: Ring Ring
</p>

在上面的代码中，有一个 `Camera` 类型和一个 `Phone` 类型。
通过在 `CameraPhone` 中同时包含两个匿名成员的方式，我们可以获得每个类型的行为，就好像是 `CameraPhone` 直接拥有的一样。

你可能已经开始注意到了，Go 语言的范式非常少，但是他们都有值得注意的扩展性，可以得到其他语言的能力。
