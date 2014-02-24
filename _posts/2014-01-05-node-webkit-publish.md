---
layout: post
title: hello,github
---

1. 将开发的所有相关文件+package.json使用zip压缩为app.zip(要包含node_modules)
2. 将app.zip改名为app.nw
3. 打开cmd，在当前目录下执行：```copy /b nw.exe+app.nw app.exe```生成app.exe
4. 使用Enigma Vistual Box将资源和程序封包到一起，记住选择压缩文件选项，需要包括以下资源：
    - icudt.dll
    - nw.pak
5. 封包后如果需要修改应用程序的图标，使用Resource Hacker工具修改

**参考：**

1. [node-webkit官方文档如何打包](https://github.com/rogerwang/node-webkit/wiki/How-to-package-and-distribute-your-apps)
2. [Enigma Vistual Box](http://enigmaprotector.com/en/aboutvb.html)
3. [node-webkit官方文档如何修改app图标](https://github.com/rogerwang/node-webkit/wiki/Icons)
4. [Resource Hacker](http://www.angusj.com/resourcehacker/)
