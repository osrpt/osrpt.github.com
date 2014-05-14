---
layout: post
title: 正确使用密码加盐散列
---

如果你是一个 web 开发工程师，可能你已经创建了一个用户账户系统。一个用户账户系统最重要的部分是密码如何被保护的。用户账户数据库经常被黑，如果你的网站曾经被破坏过，你绝对必须做点什么来保护你的用户的密码。最好的用来保护密码的方式是采用加盐密码散列 (salted password hasing)。 这篇文章将解释为什么要这样做。

大概是因为互联网上充斥着大量的误导信息，所以这里有许许多多的关于如何正确做密码散列的矛盾的观点甚至误解。密码散列是一个比较简单的事情，但是仍然有很多人做错了。在这片文章中，我将不仅解释正确实现的方式，而且告诉你为什么是这样做。

**重要提示**：如果你正在试图实现自己的密码散列代码，请停下来！它太容易搞糟了。不，不，不，你在大学上的密码学课程不能让你避免这个警告。这个警告适用于每个人：**不要实现自己的加密！**如何保存密码的问题已经被解决了。使用 [phpass](http://www.openwall.com/phpass/) 或者本页面上提供的代码。

如果因为什么原因你没有阅读上面的警告，请现在立即马上去读一遍。真的，这份指导不是教你如何实现自己的密码存储系统，这里是解释为什么密码应该这样存储。

你可以使用下面的链接跳转到本页上不同的节点：

1. 什么是密码散列
2. 散列是怎样被攻击的
3. 加盐
4. 无效的散列方法
5. 怎样正确地散列
6. 常见问题

本文底部有基于 BSD 授权协议的密码散列源代码：

+ PHP 源代码
+ Java 源代码
+ ASP.NET(C#) 源代码
+ Ruby (on Rails) 源代码

###什么是密码散列

        hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
        hash("hbllo") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366
        hash("waltz") = c0e81794384491161f1777c232bc6bd9ec38f616560b120fda8e90f383853542

Hash 算法是一种功能。他们把任何数量的数据转换为一个指定长度的无法逆转的指纹。当输入的数据即使只有 1 比特的数据改变，散列结果也将完全不一样（例如上面的示例）。这对密码保护极其的有用，因为我们需要一种不能被解密的加密方式来存储密码，同时，我们希望能验证用户的密码是否正确。

一般的基于 hash 的账户注册和验证流程如下：

1. 用户创建一个账户
2. 用户的密码被 hash 后存储到数据库中。没有任何地方会将纯文本的密码（未加密）写入到硬盘上。
3. 当用户尝试登录时，用户输入的密码将再次被 hash 然后和真实密码的 hash 进行比对 （从数据库中取出）。
4. 如果 hash 值匹配，用户被授权可以访问。如果不，用户将被告知输入了无效的登录凭据。
5. 在用户每次尝试登录账户的时候都将重复第 3 步和第 4 步。

在第四步中，绝不要告诉用户是用户名还是密码错了。总是显示类似这样的一条信息：无效的用户名或密码。这可以阻止攻击者枚举他不知道密码的用户的真实用户名。

值得注意的是用来保护密码的 hash 算法可能跟你在数据结构课程上见到的不太一样。用来实现数据结构的 hash 算法例如说 hash table 被设计为快速但是不安全。只有加密 hash 算法可以被用来实现密码 hash 。这些 hash 算法是用于加密 hash 的：SHA256,SHA512,RipeMD 和 WHIRLPOOL 。

你可能很简单地就以为只要使用了 hash 算法你的用户的密码就安全了。这还远远不够。有非常多的可以通过 hash 值快速恢复出密码的方法。有许多容易实现的技术可以让这些攻击不那么有效。为了说明这些技术的动机，让我们以一个网站来讨论。在前端页面上，你可以提交一个待攻击的 hash 列表，然后在 1 秒以内就收到反馈。显然地，简单的对密码进行 hash 不能满足我们的安全需求。

下一节将讨论一些常用的攻击密码 hash 的方式。

###密码散列是怎样被攻破的？

####词典和暴力攻击

+ Dictionary Attack
        
        Trying apple        : failed
        Trying blueberry    : failed
        Trying justinbeiber : failed
        ...
        Trying letmein      : failed
        Trying s3cr3t       : success!

+ Brute Force Attack
        
        Trying aaaa : failed
        Trying aaab : failed
        Trying aaac : failed
        ...
        Trying acdb : failed
        Trying acdc : success!

最简单的攻击 hash 的方式是猜测密码，对每个猜测都计算 hash 值，然后比对猜测的 hash 值是否和真实值一样。如果 hash 值一样，就猜对了。最常见的两种猜测密码的方式就是 **词典攻击** 和 **暴力攻击**。

词典攻击就是使用一个包含单词，短语，常见密码和其他可能会被用户作为密码的字符串的文件。文件中每个单词都被 hash 过，然后使用 hash 值和密码的 hash 值进行比对。如果匹配，这个字符串就是密码。这些词典文件都是从大量的文本中提取出来的单词，有些甚至是从真实的密码数据库中提取出来的。还可以通过进一步的处理来让词典攻击更有效，例如把单词替换为近似的单词("hello" 替换为 "h3110")。

暴力攻击是指尝试指定长度的所有可能的字符组合。这种攻击方式计算量巨大，在单位 CPU 时间内是最低效的攻击方式，但是偶尔会碰巧找到密码。密码字符串应该有足够的长度，这样通过穷举所有的可能组合将耗费极长的时间，这种攻击方式几乎就失效了。

没有方法可以阻止词典攻击和暴力攻击。他们虽然低效，但是却没有方式可以阻止。如果你的密码系统是安全的，那么唯一的攻击方式就是执行词典攻击或者暴力攻击。

####查表攻击

        Searching: 5f4dcc3b5aa765d61d8327deb882cf99: FOUND: password5
        Searching: 6cbe615c106f422d23669b610b564800:  not in database
        Searching: 630bf032efe4507f2c57b280995925a9: FOUND: letMEin12 
        Searching: 386f43fab5d096a7a66d67c8f213e5ec: FOUND: mcd0nalds
        Searching: d5ec75d5fe70d428685510fae36492d9: FOUND: p@ssw0rd!

查表攻击是一种非常有效的而且快速的用于攻击同种 hash 加密的方式。通常的做法是预先计算密码词典中的所有 hash 值并存储在一个查询表数据结构中。一个好的设计的查询表即使有数10亿 hash 值也可以每秒进行数百次 hash 查询。

如果你想了解更多关于查询表到底可以有多块，试试通过 CrackStation 的 [在线 hash 破解](https://crackstation.net/) 破解下面的 hash 值：

        c11083b4b0a7743af748c85d343dfee9fbb8b2576c05f3a7f0d632b0926aadfc
        08eac03b80adc33dc7d8fbe44b7c7b05d3a2c511166bdb43fcb710b03ba919e7
        e4ba5cbd251c98e6cd1c23f126a3b81d8d8328abc95387229850952b3ef9f904
        5206b8b8a996cf5320cb12ca91c7b790fba9f030408efe83ebb83548dc3007bd

####反向查表攻击

        Searching for hash(apple) in users' hash list...     : Matches [alice3, 0bob0, charles8]
        Searching for hash(blueberry) in users' hash list... : Matches [usr10101, timmy, john91]
        Searching for hash(letmein) in users' hash list...   : Matches [wilson10, dragonslayerX, joe1984]
        Searching for hash(s3cr3t) in users' hash list...    : Matches [bruce19, knuth1337, john87]
        Searching for hash(z@29hjja) in users' hash list...  : No users used this password

这种攻击允许攻击者同时应用词典攻击或者暴力攻击而不用预先计算出一个查询表。

<https://crackstation.net/hashing-security.htm>