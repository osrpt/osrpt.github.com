---
layout: post
title: Javascript中点号和方括号的比较
tags:
- javascript
- compare
---

今天使用jshint检查代码的时候发现提示建议把所有的`foo['bar']`改成`foo.bar`。不明白这样写有什么好处，难道只是一种风格？于是搜索了一下，找到以下答案：

>[JavaScript property access: dot notation vs. brackets?](http://stackoverflow.com/questions/4968406/javascript-property-access-dot-notation-vs-brackets)
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

答案下面的评论中有人提到使用点号速度更快，并且提供了[测试](http://jsperf.com/dot-notation-vs-bracket-notation/2)。
在我的电脑上分别在最新的 Chrome, Safari 和 Firefox 上运行了测试，测试结果如下：

![test on Chrome](/images/jsDotVsBracket/chrome.png)

*Chrome*

![test on Firefox](/images/jsDotVsBracket/firefox.png)

*Firefox*

![test on Safari](/images/jsDotVsBracket/safari.png)

*Safari*


可以看出：在 Chrome 和 Firefox 上运行时，速度没有明显差异, 在 Safari 上运行时，速度差异非常明显，使用方括号比直接使用点号的速度慢了 40% 多。

看来速度上的确有差异，如果可以的话最好采用点号的方式。
