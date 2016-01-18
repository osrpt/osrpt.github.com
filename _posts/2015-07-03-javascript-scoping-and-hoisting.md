---
layout: post
title: JavaScript作用域和提升
---

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
但是在 JavaScript 中并不是这样。在 Firebug 中试试以下代码：

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
    var x;
    bar();
    x = 1;
}
```

这说明包含声明的语句是否被执行是无关紧要的。下面两个函数是相等的：

```
function foo() {
    if (false) {
        var x = 1;
    }
    return;
    var y = 1;
}

function foo() {
    var x, y;
    if (false) {
        x = 1;
    }
    return;
    y = 1;
}
```

注意声明部分中的赋值部分并没有被提升。
只有名称被提升了。这个跟函数声明不一样，函数声明是整个函数体也会同样地被提升。
不过要记住一般有两种方式声明函数。
看看下面的代码：

```
function test() {
    foo(); // TypeError "foo is not a function"
    bar(); // "this will run!"
    var foo = function () { // function expression assigned to local variable 'foo'
        alert("this won't run!");
    }
    function bar() { // function declaration, given the name 'bar'
        alert("this will run!");
    }
}

test();
```

在这个例子中，只有函数声明被提升了。
所以变量名 `foo` 被提升了，但是函数体被留在了原处，将会等到执行时才赋值。

这就是提升的基本概念，并不像看起来那样复杂。
当然，我们说的可是 JavaScript，在特定的情况下总有一些更复杂的情况。

### 名称解析顺序

最重要的特殊情况是请记住名称解析顺序。
记住有 4 种方式让名字进入一个作用域。
上面我排列的顺序即是名字解析的顺序。
一般来说，如果一个名字已经被定义了，它就不会被另外一个同名属性覆盖。
这就意味着函数声明的优先级比变量声明的优先级高。
这样说的意思不是指赋值就不生效了，仅仅只是说声明部分会被忽略掉。
下面是一些例外：

+ 内建名 `arguments` 的行为怪异。它看起来像是作为形参来声明的，但是却又先于函数声明。这就意味着一个普通的名字为 `arguments` 的参数将会比内建的优先。这是一个非常糟糕的特性，请千万不要把 `arguments` 作为参数。
+ 在任何地方使用 `this` 作为标识符都会引发异常 `SyntaxError`。这个特性很棒。
+ 如果多个形参的名字相同，那么参数列表中的最后一个将会优先，即使它的值是 `undefined`。

### 命名函数表达式

你可以在函数表达式中为函数提供名称，这看起来像是函数声明一样。
不过这并没有创建一个函数声明，这个名字也没有包含进作用域中，并且它的函数体也不会被提升。
下面的代码说明了这点：

```
foo(); // TypeError "foo is not a function"
bar(); // void
baz(): // TypeError "baz is not a function"
span(); // ReferenceError "spam is not defined"

var foo = function() {}; // anonymous function expression ('foo' gets hoisted)
function bar() {}; // function declaration ('bar' and the function body get hoisted)
var baz = function span() {}; // named function expression (only 'baz' gets hoisted)

foo(); // valid
bar(); // valid
baz(); // valid
spam(); // ReferenceError "spam is not defined"
```

### 在编码中的应用

现在你已经理解了作用域和提升，这在使用 JavaScript 编码时意味着什么呢？
最重要的是使用使用 `var` 语句来声明你的变量。
我**强烈建议**你在每一个作用域中只有一个 `var` 语句，并且放在最顶部。
如果你强制让自己这样做，你就永远都不会遇到提升相关的困惑。
但是，这样做可能会导致难以在当前作用域中追踪哪个变量已经被声明了。
我推荐使用 `JSLint` 的 `onevar` 规则来强制这样限制。
如果你已经这样做了，你的代码应该像下面这样：

```
/*jslint onevar: true [...]*/
function foo(a, b, c) {
    var x = 1,
    bar,
    baz = "something";
}
```

### 标准怎么说的？

我发现在多数情况下直接查看 [ECMA 标准(pdf)](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf) 就能理解这些是怎么工作的了。
下面就是标准中关于变量声明和作用域的部分（更旧的版本中是 12.2.2 节）:

>如果在方法声明中包含变量语句，那么变量是在函数的局部作用域中定义的，如 10.1.3 节描述的那样。
>否则的话，他们是在全局作用域中定义的(即作为全局对象的成员定义，如 10.1.3 节中描述的那样)属性{不要删除}。
>变量在进入执行作用域时创建。
>一个块不会创建一个新的执行作用域。
>只有程序和函数定义会产生新的作用域。
>变量创建后被初始化为 undefined.
>一个包含初始化的变量在 `VariableStatement` 执行的时候被赋值为它的 `AssignmentExpression`, 而不是在创建的时候。

我希望这篇文章为 JavaScript 程序员在最常见的困惑上带来一些帮助。
我已经尽力不再产生更多的困惑。
如果我犯了什么错误或者有重大疏漏，请告诉我。


译自: <http://www.adequatelygood.com/JavaScript-Scoping-and-Hoisting.html>
