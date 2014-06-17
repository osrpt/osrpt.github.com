---
layout: post
title: 10 步学会 CSS 定位[译]
---

####1. position:static
所有元素默认的 position 值为：`position:static` ,意味着元素没有被定位，仅仅只是在文档中按照普通的位置放置。

通常你不需要设置这个值除非你想覆盖之前设置的值。

    #div-1 {
        position:static;
    }

![static.png](/images/post/position/static.png)

###2. position:relative

如果你设置了 `position:relative`，你就可以使用 `top` 或者 `bottom` 和 `left` 或者 `right` 来相对移动元素本来应该在文档中的位置。

让我们向下移动 div-1 20px，然后向左移动 40px：

    #div-1 {
     position:relative;
     top:20px;
     left:-40px;
    }

![relative.png](/images/post/position/relative.png)

注意如果我们没有移动 div-1 的话它应该在的空间：现在变成空的了。下一个元素 (div-after) 在我们移动 div-1 的时候没有移动。这是因为即使我们移动了 div-1 ,它在文档中仍然占据着原来的位置。

这样看起来似乎 `position:relative` 没有什么用处，但是在本文的后面我们将看到它有着非常重要的功能。

###3. position:absolute

当你声明了 `position:absolute` ，元素将会从文档中移除掉然后放置到你声明的位置。

让我们移动 div-1a 到页面的右上角:

    #div-1a {
        position:absolute;
        top:0;
        right:0;
        width:200px;
    }

![absolute.png](/images/post/position/absolute.png)

这次请注意，由于 div-1a 已经被从文档中移除掉了，页面上的其他的元素将以不同的方式定位：div-1b,div-1c，并且div-after 因为 div-1a 已经不再占据原来的位置了将会自动上移。

同样注意 div-1a 是定位到页面的右上角的。这对直接定位元素在页面的任意位置非常棒，但是它作用有限。

我真正想要的是把 div-1a 相对定位到 div-1 。那就是相对定位将回来扮演的角色。

*注意*:

+ 在 Windows IE 浏览器中有一个 bug：当你声明了一个相对的宽度（例如："width:50%"）然后宽度将会给予父元素而不是定位的元素。

###4. position:relative + position:absolute

如果我们给 div-1 设置 `relative`，那么任何在 div-1 中的元素都将相对 div-1 定位。然后如果我们设置 `absolute` 给 div-1a，那样我们就能把它移动到 div-1 的右上角了。

    #div-1 {
     position:relative;
    }

    #div-1a {
     position:absolute;
     top:0;
     right:0;
     width:200px;
    }

![relative_absolute.png](/images/post/position/relative_absolute.png)

###5. 双列绝对定位

现在我们可以使用 relative 和 absolute 来制作一个两列的布局：

    #div-1 {
        position:relative;
    }
    
    #div-1a {
        position:absolute;
        top:0;
        right:0;
        width:200px;
    }
        
    #div-1b {
        position:absolute;
        top:0;
        left:0;
        width:200px;
    }

![two-column.png](/images/post/position/two-column.png)

使用 absolute 的一个好处是我们可以不考虑元素在 HTML 中的顺序而直接把元素定位到页面上的任意位置。这里我就把 div-1b 放在了 div-1a 的前面。

但是等一下——其他元素发生了什么？他们将被绝对定位的元素遮挡。我们将怎么处理呢？

###6. 添加高度的双列绝对定位

一个解决方案是给元素设置一个固定的高度。

但是对大多数设计来说这都不是一个有效的解决方式，因为我们通常不知道元素里面有多少文字或者将使用的确切的字号。

    #div-1 {
        position:relative;
        height:250px;
    }
    #div-1a {
        position:absolute;
        top:0;
        right:0;
        width:200px;
    }
    #div-1b {
        position:absolute;
        top:0;
        left:0;
        width:200px;
    }

![two-column-height.png](/images/post/position/two-column-height.png)

###7. float

对可变的高度的列，绝对定位不能起作用，所以我们来尝试一下其他的方式。

我们可以让一个元素 “浮动” 来把它推到最左边或者最右边，并且允许文字包围在其周围。这经常应用于图片，但是我们也可以用于一些复杂的布局任务（因为这是我们仅有的方式了）。

    #div-1a {
        float:left;
        width:200px;
    }

![float.png](/images/post/position/float.png)

###8. 多列浮动

如果我们让一列浮动到左边，然后让第二列也浮动到左边，他们将会互相推动。

    #div-1a {
        float:left;
        width:150px;
    }
    #div-1b {
        float:left;
        width:150px;
    }

![float-columns.png](/images/post/position/float-columns.png)

###9. 多列浮动的清除

在浮动元素的后面，我们可以`clear`浮动来把剩下的内容推下去。

    #div-1a {
        float:left;
        width:190px;
    }
    #div-1b {
        float:left;
        width:190px;
    }
    #div-1c {
        clear:both;
    }

![float-with-clear.png](/images/post/position/float-with-clear.png)

###10. 免责声明和资源

这些例子都是非常简单的并且没有触发 Windows IE 浏览器中的 CSS bug（确实有很多 bug )。

下面这个页面是毫无价值的：

[Relatively Absolute](http://www.autisticcuckoo.net/archive.php?id=2004/12/07/relatively-absolute)

同时你可以查看以下页面：

+ [BarelyFitz Designs Open-Source Software Projects](http://www.barelyfitz.com/projects/)
+ [BarelyFitz Designs Screencasts](http://www.barelyfitz.com/screencast/)

from:<http://www.barelyfitz.com/screencast/html-training/css/positioning/>