---
layout: post
title: Javascript中点号和方括号的比较
tags:
- javascript
- compare
---

今天使用jshint检查代码的时候发现提示建议把所有的`foo['bar']`改成`foo.bar`。不明白这样写有什么好处，难道只是一种风格？于是搜索了一下，找到以下答案：

><http://stackoverflow.com/questions/4968406/javascript-property-access-dot-notation-vs-brackets>
>
>使用方括号[允许你使用不能在使用点号表达式时候的字符](http://www.dev-archive.net/articles/js-dot-notation/)：
>
        var foo = myForm.foo[]; // incorrect syntax
        var foo = myForm["foo[]"]; // correct syntax

>第二个好处就是使用方括号的时候你可以使用变量：
>        
        for (var i = 0; i < 10; i++) {
          someFunction(myForm["myControlNumber" + i]);
        }
>       
>总结：
>        
>点号写起来更快，阅读也非常清晰。
>
>方括号写法可以使用特殊字符去访问属性，还可以使用变量去获取属性。

答案下面的评论中有人提到使用点号速度更快，并且提供了[测试](http://jsperf.com/dot-notation-vs-bracket-notation/2)。我分别在 chrome 33 和 IE 10 下多次运行了测试用例，发现并没有评论者所说的速度差异，偶尔会有较小的速度差异，但是多运行几次会发现是不稳定的，而且差异非常小，几乎可以忽略。

所以 stackoverflow 上的结论应该是可靠的。