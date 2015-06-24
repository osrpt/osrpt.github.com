---
layout: post
title: JavaScript 获取浏览器滚动条宽度
tags:
- javascript
- compatibility
---

可以使用以下 JavaScript 获取浏览器滚动条宽度：

    // 来自：http://jsfiddle.net/UU9kg/17/
    function getScrollbarWidth() {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        // remove divs
        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    }

    document.body.innerHTML = "Scrollbar width is: "+getScrollbarWidth()+"px";

webkit 内核浏览器的滚动条可以使用 CSS 样式自定义：

    ::-webkit-scrollbar {
        width: 8px; /* 垂直滚动条的宽度 */
        height: 8px;
    }

    /*轨道*/
    ::-webkit-scrollbar-track {
        background: #FFF;
    }

    /*滑块*/
    ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-corner {
        background: none;
    }

应用上面的 CSS 后，仍然能正确获取到被修改过的滚动条的宽度。

但是有一个例外：360安全浏览器(版本号：7.1.1.570，内核版本号：31.0.1650.3)的极速模式下，会获取到滚动条宽度为 0。不过 CSS 仍然生效了，所以这个时候可以使用自己设置的滚动条宽度。(上面的代码中是 8px)
