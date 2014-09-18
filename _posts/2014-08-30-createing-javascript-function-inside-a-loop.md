---
layout: post
title: 在 Javascript 的循环中创建函数
tags:
- javascript
- closure
- performance
---

在循环中创建函数是一种不好的做法，代码不会报错，但是很可能会产生意想不到的结果。

例如：

	for (var i = 0, n = elements.length; i<n; i++) {
		var el = elements[i];
		el.addEventListener('click', function() {
			doSomethingWith(i, el); //  这里的 i,el 将是循环最后的i, el
		}, false);
	}

这个问题的原因(闭包)比较复杂，简单来说，函数只创建了一次（而不是每次循环的时候创建一次）并且这个函数指向了最后一个它使用的变量。

有两种解决办法：

###一种是每次循环的时候创建一个新的函数:

	(function(variable) {
		doSomething(variable);
	})(value);

上面的例子中应该这样改写：

	for (var i = 0, n = elements.length; i<n; i++) {
		var el = elements[i];
		el.addEventListener('click', (function(i, el) { 
			return function() {
				doSomethingWith(i, el);
			}
		})(i, el), false);
	}

这种方式每次都需要单独创建一个函数，可能导致[性能问题](http://jsperf.com/closure-vs-name-function-in-a-loop/2)。

###另一种方式是在循环外创建函数：

上面的例子中应该这样改写：

	function doSomethingWith(inx,el){
		el.addEventListerner('click',function(){
			//...do something
		},false);
	}

	for (var i=0,n=elements.length;i<n;i++){
		var el=elements[i];
		doSomethingWith(i,el);
	}

下面再来探讨一下这个问题的具体原因，其实就是因为闭包。

###闭包

用一句话来说，闭包就是函数引用了独立的（自由的）的变量。

换句话说，定义在闭包中的函数 “记住了” 创建它的位置的上下文。

	function makeFunc() {
		var name = "Mozilla";
		function displayName() {
			alert(name);
		}
		return displayName;
	}

	var myFunc = makeFunc();
	myFunc();

上面的代码中，`myFunc` 构成了一个闭包。
闭包是一种特殊的对象，包含了两个部分：一个函数，一个函数被创建时候所处的环境。
环境包含了任何在函数被创建时候的作用域内的局部变量。

###闭包的用途：

闭包让你可以把一些数据（环境）和一个操作这些数据的方法联系起来。这是明显的面向对象编程的方式。

####事件回调方法

你可以在任何你通常需要用一个对象+仅仅一个方法的地方使用闭包，典型的就是网页内的事件的回调方法。

####使用闭包模拟私有方法

###参考：
1. [Creating A Javascript Function Inside A Loop](http://blog.jbrantly.com/2010/04/creating-javascript-function-inside.html)
2. [Closures](https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Working_with_Closures)
3. [Don't make functions within a loop](http://jslinterrors.com/dont-make-functions-within-a-loop)
4. [Immediately-invoked function expression](http://en.wikipedia.org/wiki/Immediately-invoked_function_expression)
5. [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
6. [Details of the object model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Details_of_the_Object_Model)
