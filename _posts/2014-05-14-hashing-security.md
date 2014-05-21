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

首先，攻击者通过用户账户数据库创建一个所有拥有相同 hash 密码值的映射表。然后攻击者计算每一个猜测的密码的 hash 值从而获得一个使用这个密码的用户列表。这种攻击方式在处理很多用户拥有相同的密码时特别有效。

####彩虹表攻击

彩虹表是一种时间-内存交换技术。他类似查表，但是他缩小了查询表导致牺牲了 hash 攻击速度。因为他更小，所以在同样的控件中可以存放更多的 hash 值，这样就更加高效了。彩虹表可以[攻击](http://www.freerainbowtables.com/en/tables2/)任何最大8个字符的密码 md5 hash。

下一节中，我们将会了解一种叫做加盐的技术，这种技术可以让查表攻击和彩虹表攻击变得无效。

###加盐

        hash("hello")                    = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
        hash("hello" + "QxLUF1bgIAdeQX") = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1
        hash("hello" + "bv5PehSMfV11Cd") = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab
        hash("hello" + "YYLmfY6IehjZMQ") = a49670c3c18b9e079b9cfaf51634f563dc8ae3070db2c4a8544305df1b60f007

查表攻击和彩虹表攻击只有在每个密码都使用同样的方式 hash 的时候才起作用。如果两个用户有同样的密码，他们就有同样的 hash 值。我们可以通过让每个 hash 都随机，这样就阻止了这种攻击方式，这样同样的密码就被 hash 了两次，所以 hash 值也就不一样了。

我们可以在密码进行 hash 前给密码前或后添加一个随机的字符串，也就是 salt 。像上面的例子中看到的那样，这样可以让同样的密码每次都得到完全不同的 hash 值。这样为了检查密码的正确性，我们需要用到 salt 。所以在账户系统中我们通常把 salt 和 hash 值一起存放，或者直接作为 hash 值的一部分。

salt 不必是秘密的。仅仅通过让 hash 随机，这样就可以让查表攻击，反向查表攻击，或者彩虹表攻击变得无效。攻击者无法提前知道 salt 将是什么，这样也就不能预先计算出查询表和彩虹表。如果每个用户都使用不同的 salt ，这样反向查表攻击也就无效了。

在下一节中，我们将看到通常 salt 是怎样被错误实现的。

###**错误**的方式：短的 salt 和重用 salt

最常见的实现 salt 的错误是在多个 hash 中使用同一个 salt ，或者 salt 长度过短。

####重用 salt

一个常见的错误是在每个 hash 中都使用了同样的 salt 。有些是直接把 salt 硬写到代码中，有些是只随机生成了一次。这是无效的，如果两个用户有同一个密码，那么他们将有同样一个 hash 。攻击者还是可以通过反向查表来对每个 hash 进行词典攻击。他们只需要在计算 hash 之前把 salt 加上即可。如果 salt 是硬编码到一个流行的产品中，查表攻击和彩虹表攻击可以专为这个 salt 设计，这样就很容易攻击这个产品的 hash 。

每次当新用户创建或者修改密码的时候，都必须要重新生成一个全新的随机 salt 。

####过短 salt

如果 salt 过短，攻击者可以为每个 slat 都创建一个查询表。举个例子，如果 salt 只有三位 ASCII 码，这就只有 95x95x95=857,375 种可能的 salt 。这可能看起来不少了，但是如果每个查询表都只包含了 1MB 的最常见的密码，他们总共也就才 837GB ，如今 1000GB 的硬盘都可以以低于 $100 的价格买到了，这点空间根本不算什么。

同样地，用户名不应该被作为 salt 。在一个服务中用户名可能是唯一的，但是很可能在其他服务中这个用户名被重用了。攻击者可以创建常用用户名的查询表然后用来攻击基于用户名 salt 的 hash 。为了让攻击者不能为每个可能的 salt 创建一个查询表， salt 必须要足够的长。一个较好的建议是使用跟输出 hash 一样长度的 salt 。例如：SHA256 输出是 256 比特 (32字节)，所以 salt 应该至少有 32 个随机的字节。

###**错误**的方式：双重 hash 和古怪的 hash 算法

本届涵盖了另外一种常见的密码 hash 误解：古怪的 hash 实际上，这样做收益很小。算法组合。很容易得意忘形地去组合不同的 hash 算法，以为可以让结果更加安全。这样做将产生互操作性问题，也有可能让 hash 变得更不安全。永远不要尝试发明自己的加密算法，请使用专家发明的标准算法。有些人可能会争辩说使用多重 hash 将让生成 hash 的时间变长，同时就可以让攻击变慢，但是之后我们将提供一种让破解变慢的更好方式。

下面是一些我在网上论坛曾经看到过的被建议的古怪 hash 算法：

+ md5(sha1(password))
+ md5(md5(salt) + md5(password))
+ sha1(sha1(password))
+ sha1(str_rot13(password + salt))
+ md5(sha1(md5(md5(password) + sha1(password)) + md5(password)))

请不要使用任何一种。

注意：这一节被认为是有争议的。我接到了大量的邮件争辩说古怪的 hash 算法是有效的方式，因为如果攻击者不知道使用了什么 hash 算法，这样就不太可能预先计算彩虹表，并且这将导致更长的 hash 计算时间。

攻击者不可能在不知道算法的情况下攻击 hash 值，但是注意 [Kerckhoffs 的原则](https://en.wikipedia.org/wiki/Kerckhoffs%27s_principle)，攻击者通常都可以访问到源代码（尤其是如果是免费和开源的软件），并且对于采用了一些 hash 组合的系统，采用逆向工程得到算法并不困难。使用古怪的　hash 算法的确将耗费更多的时间，但是这只是常数级的。嘴还是次啊用一种设计难以并行化的迭代算法（下面将讨论）。并且，使用正确的加盐方式已经解决了彩虹表的问题。

如果你想使用一种标准化的 “古怪” 加密方式，例如 HMAC，这是可以的。但是如果你的理由是为了让计算变得更慢，请先阅读下面的关于键值伸展一节。

比起使用古怪 hash 算法可能带来的完全不安全的 hash 问题和可能引起的互操作性问题，这点儿好处不值一提。明显最好使用标准的和经过完整测试的算法。

###Hash 碰撞

由于 hash 算法是将任意长度的数据映射为确定长度的数据，所以必然会存在一些数据被的 hash 值相同。加密 hash 函数设计为让这些碰撞难以被找到。一直以来，密码学家都发现攻击者试图攻击 hash 函数让找到碰撞更加容易。最近的一个例子是 MD5 hash 算法实际上已经被发现了碰撞。碰撞攻击是找到一个不是用户密码的字符串但是却有着同样 hash 值。但是，在一个较弱的 hash 算法比如 MD5 算法中找到碰撞已经需要巨大的计算能力了，所以在实际使用中偶然遇到 hash 碰撞几乎是不可能的。在所有的实际用途中，一个使用 MD5 加盐的 hash 密码基本和使用 SHA256 加盐同样的安全。

不过，如果可以的话还是推荐使用更加安全的加密算法例如 SHA256,SHA512,RipeMD,或 WHIRLPOOL。

###正确的方式：怎样正确地计算 hash

这一节介绍了密码应该怎样被 hash 的正确方式。第一小节杭盖了最基本的——也是实际上需要的所有东西。接下来的一小节解释了这些基本的方式可以怎样被增强让其更加难以攻击。

###最基本的：加盐散列

**警告：不要仅仅只读这一节。你绝对应该实现下一节的东西：“让攻击密码更加困难：减慢 hash 速度”。**

我们已经看到了恶意攻击者可以怎样快速地通过查询表和彩虹表来攻击文本密码。我们也了解到了通过加盐来让 hash 值变得随机可以解决这个问题。但是怎样产生盐呢？怎样应用到密码中呢？

产生盐应该使用 **加密安全伪随机产生器**(Cryptographically Secure Pseudo-Random Number Generator——CSRPNG)。CSPRNG 和普通的伪随机产生器有非常大的差异，例如 C 语言的 rand() 函数。如其名一样，CSRPNG是设计为加密安全的，意味着他们是一个高度的随机并且不能完全预测到。我们不希望我们的盐被预测到，所以我们必须使用 CSPRNG 。下面的表格中列举了一些流行的编程语言的 CSPRNG 方法：

|          Platform                |      CSPRNG      |
|----------------------------------|:-----------------:|
|              PHP                 |  [mcrypt_create_iv](http://php.net/manual/en/function.mcrypt-create-iv.php), [openssl_random_pseudo_bytes](http://php.net/manual/en/function.openssl-random-pseudo-bytes.php) |
|              Java                 |    [centered](http://docs.oracle.com/javase/6/docs/api/java/security/SecureRandom.html)   |
|          Dot NET (C#, VB)         | [System.Security.Cryptography.RNGCryptoServiceProvider](http://msdn.microsoft.com/en-us/library/system.security.cryptography.rngcryptoserviceprovider.aspx) |
|                 Ruby              |      [SecureRandom](http://rubydoc.info/stdlib/securerandom/1.9.3/SecureRandom)         |
|                Python             |      [os.urandom](http://docs.python.org/library/os.html)        |
|                  Perl             |       [Math::Random::Secure](http://search.cpan.org/~mkanat/Math-Random-Secure-0.06/lib/Math/Random/Secure.pm)        |
|          C/C++ (Windows API)      |       [CryptGenRandom](http://en.wikipedia.org/wiki/CryptGenRandom)       |
| Any language on GNU/Linux or Unix |       Read from [/dev/random](http://en.wikipedia.org/wiki//dev/random) or /dev/urandom        |

每个用户每个密码的盐豆必须要是唯一的。每次用户创建账户或者修改密码，密码都必须使用新的盐来计算 hash 。绝不要重用盐。并且盐的长度要足够的长，这样才有足够多的可能性。首要的规则是，至少让你的盐和 hash 函数输出长度一样长。盐应该和  hash 值一起存放在用户账户表中。

**存储密码：**

1. 使用 CSPRNG 产生一个足够长的随机盐。
2. 把盐附加到密码后面然后使用 **标准** 的hash加密函数比如 SHA256 计算 hash 值。
3. 在用户的数据库中同时保存盐和 hash 值。

**验证密码：**

1. 从数据库中取出用户的盐和 hash 值。
2. 附加盐到提供的密码后面然后使用同样的 hash 算法计算 hash 值。
3. 比较给定密码的 hash 和数据库的 hash 。如果匹配，密码就是正确的。否则，密码是错误的。

在本文的底部，有加盐密码 hash 的多种语言实现版本：PHP,C#,Java 和 Ruby 。

**在 web 应用中，永远在服务器计算 hash 。**

如果你在写一个 web 应用，你可能想知道在哪儿进行 hash 计算。是在用户的浏览器中使用 Javascript 计算 hash ，还是干净地传递给服务器然后计算。

即使你使用 Javascript 对用户的密码进行了 hash ，你还是必须在服务器上再次进行 hash 。假设有一个网站只是在用户的浏览器中进行了 hash 但是没有在服务器上进行 hash 。为了验证一个用户，网站必须接受一个浏览器的 hash 然后检查这个 hash 是否和数据库中的hash 匹配。这似乎看起来更加安全了，因为用户的密码从来都没有传递到服务器，但是这是错误的。

问题出在客户端 hash 逻辑产生了用户的密码。如果用户需要验证，他们就必须告诉服务器密码的 hash 值。如果有坏人知道了用户的 hash 值，那么他就不用知道用户的密码就可以通过认证了！如果一个用户得到了这个假设网站的数据库，他不需要知道密码立即就能访问每个用户的账户了。

这不是说你不能在浏览器端做 hash ，只是如果你这样做了，你同样必须在服务器端做 hash 。在浏览器端做 hash 是一个好的想法，但是要在你的实现中考虑到以下这些点：

+ 客户端 hash **不是** HTTPS（SSL/TSL）的替代品。如果浏览器和服务器之间的连接不安全，那么中间人就可以修改下载的 Javascript 代码移除掉其中的 hash 函数，然后直接得到用户的密码。
+ 有些浏览器不支持 Javascript，有些用户会禁用掉浏览器的 Javascript 。为了最大的兼容性，你的应用应该判断浏览器是否支持 Javascript ，如果不，就在服务器端模拟 Javascript 的 hash 。
+ 你也应该在客户端 hash 的时候加盐。最明显的做法是客户端请求服务器获得用户的盐。不要这样做，因为这样就让坏人不需要知道用户的密码就能检测用户名是否有效了。由于你在服务器上已经使用加盐的 hash （当然也使用了好的盐），在客户端上你可以使用用户名（或者邮箱）连接一个特殊的字符串（例如域名）的方式作为盐即可。

**让破解密码更难：减慢 hash 速度**

加盐让攻击者不能通过专业的攻击方式比如查表攻击和彩虹表攻击来快速攻击大量的 hash ，但是却不能阻止攻击者针对每一个密码独立地进行词典攻击或者暴力攻击。高端的显卡（GPU）和定制的硬件可以每秒进行数十亿次 hash 计算，所以这种攻击任然非常有效。为了降低这种攻击的效率，我们可以用一种叫做 **拉伸 key（key stretching）**的技术。

这种技术的思想是让 hash 计算十分缓慢，这样即使是非常快的 GPU 或者定制的硬件进行词典攻击和暴力破解也将变得缓慢而毫无意义。目标是让 hash 算法变得缓慢来阻碍攻击，但是仍然要保证足够地快而不会影响到用户。

key 拉伸是通过使用特殊的 CPU 密集的 hash 算法来实现。不要试图通过使用迭代 hash 算法来实现自己简单的方式，这样可以通过硬件的并行计算让其像普通的 hash 算法一样的快。使用标准的算法例如 [PBKDF2](http://en.wikipedia.org/wiki/PBKDF2) 或者 [bcrypt](http://en.wikipedia.org/wiki/Bcrypt)。你可以在这里找到一个 PHP 版本的实现： [PBKDF2](https://defuse.ca/php-pbkdf2.htm)。

这些算法把安全因子或者迭代数作为参数。这个值决定了 hash 算法有多慢。对桌面应用或者只能手机应用来说，最好的决定这个参数值的方式是在设备上运行基准测试，找到让 hash 耗时大约半秒的值。这样你的程序就是足够的安全而且不会影响到用户体验。

如果你在 web 应用上使用了 key 拉伸技术，要注意需要计算大量认证请求的资源，因为 key 拉伸技术可能让 DoS 攻击更加容易。我仍然建议使用 key 拉伸技术，但是使用一个更低的迭代值。你应该基于计算资源和最大的验证请求来计算迭代值。DoS 攻击可以通过让用户每次登录的时候输入验证码来解决。总是把你的程序设计为可以在将来增加或者减少迭代值。

如果你担心计算负担，但是又想在 web 应用中使用 key 拉伸技术，考虑在用户的浏览器中使用 Javascript 运行 key 拉伸算法。[标准的 Javascript 加密库](http://crypto.stanford.edu/sjcl/) 已经包含了PBKDF2。迭代数应该被设计得足够的低让移动浏览器也可以运行，并且如果客户端浏览器不支持 Javascript 还要可以回退到服务器进行计算。客户端的 key 拉伸并没有去掉服务器端 hash 的必要性。你应该像对待一个普通密码一样计算客户端 hash 的 hash 值。



<https://crackstation.net/hashing-security.htm>