---
layout: post
title: Javascript中函数和作用域的介绍
---

Function本质上是Object，不同的是函数可以使用`return`关键字来返回一个值，没有返回值的默认返回`undefined`。

方法的参数是传值的，在方法内部的改变不影响外部的值。但是对象引用也是一种特殊值，方法内部的改变会影响引用指向的值。

###函数声明 Defining functions
####使用`function`关键字声明

        function name([param[, param[, ... param]]]) {
           statements
        }

* **name** 方法名
* **param** 参数名,最多255个参数
* **statements** 方法体

####`function`表达式-匿名方法

        function [name]([param] [, param] [..., param]) {
           statements
        }

####`=>`声明 (支持非常有限，不推荐使用)

        ([param] [, param]) => {
           statements
        }

        param => expression

####`Function`构造函数 (不推荐使用)

        new Function (arg1, arg2, ... argN, functionBody)

* **arg1, arg2, ... argN** 参数列表
* **functionBody** 方法体语句的字符串

*由于这种声明方式要求方法体是一个字符串，可能阻止js解释引擎的优化，还可能导致其他问题，所以不推荐使用。*

###递归 Recursion
一个方法有三种方式调用自己：

1. 方法名
2. `arguments.callee`
3. 一个引用了方法的变量

例如有以下方法：

        var foo = function bar() {
           // statements go here
        };

对应的调用方式：

1. `bar()`
2. `arguments.callee()`
3. `foo()`

###命名冲突 Name conflicts

当在闭包的作用域中有两个参数或变量名字相同时，发生命名冲突。作用域越在里面的越优先，最里面的作用域拥有最高优先级。

        function outside() {
           var x = 10;
           function inside(x) {
              return x;
           }
           return inside;
        }
        result = outside()(20); // returns 20 instead of 10

###Function constructor vs. function declaration vs. function expression

* 函数名不能修改，指向函数的变量可以被修改
* 函数名只能在函数内部使用，尝试在外部使用可能产生异常。
*

*[see more&#10548;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope#Name_conflicts)*
