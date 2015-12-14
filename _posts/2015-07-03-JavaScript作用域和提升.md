---
layout: post
title: JavaScript作用域和提升
---

From: <http://www.adequatelygood.com/JavaScript-Scoping-and-Hoisting.html>

你知道下面的程序中会 alert 什么值吗？

    var foo = 1;
    function bar() {
        if (!foo) {
            var foo = 10;
        }
        alert(foo);
    }
    bar();

令人惊奇的是 alert 的值是 10，下面这个可能会让你感到更加困惑:

    var a = 1;
    function b() {
        a = 10;
        return;
        function a() {}
    }
    b();
    alert(a);

当然，这里浏览器会 alert "1"。这里发生了什么？
虽然这看起来很奇怪，危险，并且令人迷惑，但是这实际上是这门语言一个强大并且富有表现力的特性。
我不知道是不是有一个标准的名称来命名这个特殊的特性，但我已经习惯使用 “提升” 这个词。
本文将试图揭开这个这个机制的谜团，不过首先让我们了解一下 JavaScript 的作用域。

##JavaScript 中的作用域

对 JavaScript 初学者来说最大的一个迷惑之一就是其作用域。
实际上，不只是初学者。
我已经遇到过很多有经验的 JavaScript 开发者没有完全理解作用域。
JavaScript 的作用域如此让人迷惑的原因是它看起来像 C 语言家族。
先看一下下面的例子：

```
#include <stdio.h>
int main() {
	int x = 1;
	printf("%d, ", x); // 1
	if (1) {
		int x = 2;
		printf("%d, ", x); // 2
	}
	printf("%d\n", x); // 1
}
```

这个程序的输出是 `1,2,1`。
因为在 C 语言中，包括其他的 C 语言家族的其他语言，拥有 **块级作用域**。
当进入一个块时，例如一个 if 语句，可以在作用域中声明新的变量而不影响外部变量。
但是在 JavaScript 中并不是这样。在 Firebug 中试试一下代码：

```
var x = 1;
console.log(x); // 1
if (true) {
	var x = 2;
	console.log(x); // 2
}
console.log(x); // 2
```

在这里， Firebug 将会输出 `1,2,2`。
这是因为 JavaScript 拥有的是 **函数级作用域**。
这种方式与 C 家族有着根本上的不同。
像 if 这样的块没有创建作用域。
只有函数会创建作用域。

对一些使用C, C++, C# 或者 Java 的程序员来说这是出乎意料也是不受欢迎的。
幸运地是，由于 JavaScript 函数的弹性，这里有一个变通办法。
如果你需要在一个函数中创建临时作用域，像下面这样做：

```
function foo() {
	var x = 1;
	if (x) {
		(function () {
			var x = 2;
			// some other code
		}());
	}
	// x is still 1.
}
```

这种方式非常灵活，可以用在任何你想要一个临时作用域的地方，不仅限于块语句中。
即便如此，我强烈推荐你花一点时间真正理解和掌握 JavaScript 作用域。
它非常强大，并且是我最喜欢的特性之一。
如果你掌握了作用域，变量提升将对你非常有意义。

##声明，名称和提升

在 JavaScript 中，在进入一个作用域后一个名字有四种基本的方式：

+ **语言定义**: 所有的作用域，默认给出名字 `this` 和 `arguments`
+ **形式参数**: 函数可以有命名的形参，作用域为对应函数的函数体
+ **函数声明**: `function foo() {}`
+ **变量声明**: `var foo`

函数声明和变量声明通常被 JavaScript 解释器移动(提升)到包含他们的作用域的顶部。
函数参数和语言定义的名字，显然已经在这儿。
这意味着像这样的代码：

```
function foo() {
    bar();
    var x = 1;
}
```

实际上被解释为这样：

```
function foo() {
    var x();
    bar();
    x = 1;
}
```
