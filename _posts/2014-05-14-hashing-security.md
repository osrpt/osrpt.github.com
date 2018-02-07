---
layout: post
title: 正确使用密码加盐散列[译]
tags:
- password
- salt hash
---

如果你是一个 web 开发工程师，可能你已经建立了一个用户账户系统。一个用户账户系统最重要的部分是如何保护密码。用户账户数据库经常被黑，如果你的网站曾经被攻击过，你绝对必须做点什么来保护你的用户的密码。最好的用来保护密码的方式是采用加盐密码散列 (salted password hasing)。 本文将解释为什么要这样做。

互联网上充斥着大量的误导信息，有许许多多的关于如何正确做密码散列的矛盾的观点，有些甚至是误解。密码散列是一个简单的事情，但是仍然有很多人做错了。在这篇文章中，我不仅将解释正确实现的方式，而且告诉你为什么这样做。

**重要提示**：如果你正在试图自己编码实现密码散列，请停下来！它太容易搞糟了。不，不，不，你在大学上的密码学课程不能让你避免这个警告。这个警告适用于每个人：**不要实现自己的加密！**如何保存密码的问题已经被解决了。使用 [phpass](http://www.openwall.com/phpass/) 或者本文后面提供的代码。

如果因为什么原因你没有阅读上面的警告，请现在立即去读一遍。真的，本文不是教你如何实现自己的密码存储系统，而是解释为什么密码应该这样存储。

### 目录

1. [什么是密码散列](#normalHashing)
2. [攻击散列的方法](#attacks)
3. [加盐](salt)
4. 无效的散列方法
5. 怎样正确地散列
6. 常见问题

### 源码

本文后面有基于 BSD 授权协议的密码散列源代码：

+ PHP 源代码
+ Java 源代码
+ ASP.NET(C#) 源代码
+ Ruby (on Rails) 源代码


### <a name="normalHashing"></a>什么是密码散列

        hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
        hash("hbllo") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366
        hash("waltz") = c0e81794384491161f1777c232bc6bd9ec38f616560b120fda8e90f383853542

Hash 算法是一种把任何数量的数据转换为一个指定长度的无法逆转的指纹的功能。当输入的数据即使只有 1 比特的数据改变，散列结果也将完全不一样（例如上面的示例）。这对密码保护极其有用，因为我们需要一种不能被解密的加密方式来存储密码，同时，我们希望能验证用户的密码是否正确。

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

### <a name="attacks"></a>攻击散列的方法

#### 词典和暴力攻击

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

#### 查表攻击

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

#### 反向查表攻击

        Searching for hash(apple) in users' hash list...     : Matches [alice3, 0bob0, charles8]
        Searching for hash(blueberry) in users' hash list... : Matches [usr10101, timmy, john91]
        Searching for hash(letmein) in users' hash list...   : Matches [wilson10, dragonslayerX, joe1984]
        Searching for hash(s3cr3t) in users' hash list...    : Matches [bruce19, knuth1337, john87]
        Searching for hash(z@29hjja) in users' hash list...  : No users used this password

这种攻击允许攻击者同时应用词典攻击或者暴力攻击而不用预先计算出一个查询表。

首先，攻击者通过用户账户数据库创建一个所有拥有相同 hash 密码值的映射表。然后攻击者计算每一个猜测的密码的 hash 值从而获得一个使用这个密码的用户列表。这种攻击方式在处理很多用户拥有相同的密码时特别有效。

#### 彩虹表攻击

彩虹表是一种时间-内存交换技术。他类似查表，但是他缩小了查询表导致牺牲了 hash 攻击速度。因为他更小，所以在同样的控件中可以存放更多的 hash 值，这样就更加高效了。使用彩虹表可以[攻击](http://www.freerainbowtables.com/en/tables2/)任何不多于8个字符的密码 md5 hash。

下一节中，我们将会了解一种叫做加盐的技术，这种技术可以让查表攻击和彩虹表攻击变得无效。

### 加盐

        hash("hello")                    = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
        hash("hello" + "QxLUF1bgIAdeQX") = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1
        hash("hello" + "bv5PehSMfV11Cd") = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab
        hash("hello" + "YYLmfY6IehjZMQ") = a49670c3c18b9e079b9cfaf51634f563dc8ae3070db2c4a8544305df1b60f007

查表攻击和彩虹表攻击只有在每个密码都使用同样的方式 hash 的时候才起作用。如果两个用户有同样的密码，他们就有同样的 hash 值。我们可以通过让每个 hash 都随机，这样就阻止了这种攻击方式，这样同样的密码就被 hash 了两次，所以 hash 值也就不一样了。

我们可以在密码进行 hash 前给密码前或后添加一个随机的字符串，也就是 salt 。像上面的例子中看到的那样，这样可以让同样的密码每次都得到完全不同的 hash 值。这样为了检查密码的正确性，我们需要用到 salt 。所以在账户系统中我们通常把 salt 和 hash 值一起存放，或者直接作为 hash 值的一部分。

salt 不必是秘密的。仅仅通过让 hash 随机，这样就可以让查表攻击，反向查表攻击，或者彩虹表攻击变得无效。攻击者无法提前知道 salt 将是什么，这样也就不能预先计算出查询表和彩虹表。如果每个用户都使用不同的 salt ，这样反向查表攻击也就无效了。

在下一节中，我们将看到通常 salt 是怎样被错误实现的。

### **错误**的方式：短的 salt 和重用 salt

最常见的实现 salt 的错误是在多个 hash 中使用同一个 salt ，或者 salt 长度过短。

#### 重用 salt

一个常见的错误是在每个 hash 中都使用了同样的 salt 。有些是直接把 salt 硬写到代码中，有些是只随机生成了一次。这是无效的，如果两个用户有同一个密码，那么他们将有同样一个 hash 。攻击者还是可以通过反向查表来对每个 hash 进行词典攻击。他们只需要在计算 hash 之前把 salt 加上即可。如果 salt 是硬编码到一个流行的产品中，查表攻击和彩虹表攻击可以专为这个 salt 设计，这样就很容易攻击这个产品的 hash 。

每次当新用户创建或者修改密码的时候，都必须要重新生成一个全新的随机 salt 。

#### 过短 salt

如果 salt 过短，攻击者可以为每个 slat 都创建一个查询表。举个例子，如果 salt 只有三位 ASCII 码，这就只有 95x95x95=857,375 种可能的 salt 。这可能看起来不少了，但是如果每个查询表都只包含了 1MB 的最常见的密码，他们总共也就才 837GB ，如今 1000GB 的硬盘都可以以低于 $100 的价格买到了，这点空间根本不算什么。

同样地，用户名不应该被作为 salt 。在一个服务中用户名可能是唯一的，但是很可能在其他服务中这个用户名被重用了。攻击者可以创建常用用户名的查询表然后用来攻击基于用户名 salt 的 hash 。为了让攻击者不能为每个可能的 salt 创建一个查询表， salt 必须要足够的长。一个较好的建议是使用跟输出 hash 一样长度的 salt 。例如：SHA256 输出是 256 比特 (32字节)，所以 salt 应该至少有 32 个随机的字节。

### **错误**的方式：双重 hash 和古怪的 hash 算法

本节涵盖了另外一种常见的密码 hash 误解：古怪的 hash 实际上，这样做收益很小。算法组合。很容易得意忘形地去组合不同的 hash 算法，以为可以让结果更加安全。这样做将产生互操作性问题，也有可能让 hash 变得更不安全。永远不要尝试发明自己的加密算法，请使用专家发明的标准算法。有些人可能会争辩说使用多重 hash 将让生成 hash 的时间变长，同时就可以让攻击变慢，但是之后我们将提供一种让破解变慢的更好方式。

下面是一些我在网上论坛曾经看到过的被建议的古怪 hash 算法：

+ md5(sha1(password))
+ md5(md5(salt) + md5(password))
+ sha1(sha1(password))
+ sha1(str_rot13(password + salt))
+ md5(sha1(md5(md5(password) + sha1(password)) + md5(password)))

请不要使用任何一种。

注意：这一节被认为是有争议的。我接到了大量的邮件争辩说古怪的 hash 算法是有效的方式，因为如果攻击者不知道使用了什么 hash 算法，这样就不太可能预先计算彩虹表，并且这将导致更长的 hash 计算时间。

攻击者不可能在不知道算法的情况下攻击 hash 值，但是注意 [Kerckhoffs 的原则](https://en.wikipedia.org/wiki/Kerckhoffs%27s_principle)，攻击者通常都可以访问到源代码（尤其是如果是免费和开源的软件），并且对于采用了一些 hash 组合的系统，采用逆向工程得到算法并不困难。使用古怪的　hash 算法的确将耗费更多的时间，但是这只是常数级的。最好还是用一种设计好的难以并行化的迭代算法（下面将讨论）。并且，使用正确的加盐方式已经解决了彩虹表的问题。

如果你想使用一种标准化的 “古怪” 加密方式，例如 HMAC，这是可以的。但是如果你的理由是为了让计算变得更慢，请先阅读下面的关于键值伸展一节。

比起使用古怪 hash 算法可能带来的完全不安全的 hash 问题和可能引起的互操作性问题，这点儿好处不值一提。明显最好使用标准的和经过完整测试的算法。

### Hash 碰撞

由于 hash 算法是将任意长度的数据映射为确定长度的数据，所以必然会存在一些数据被的 hash 值相同。加密 hash 函数设计为让这些碰撞难以被找到。一直以来，密码学家都发现攻击者试图攻击 hash 函数让找到碰撞更加容易。最近的一个例子是 MD5 hash 算法实际上已经被发现了碰撞。碰撞攻击是找到一个不是用户密码的字符串但是却有着同样 hash 值。但是，在一个较弱的 hash 算法比如 MD5 算法中找到碰撞已经需要巨大的计算能力了，所以在实际使用中偶然遇到 hash 碰撞几乎是不可能的。在所有的实际用途中，一个使用 MD5 加盐的 hash 密码基本和使用 SHA256 加盐同样的安全。

不过，如果可以的话还是推荐使用更加安全的加密算法例如 SHA256,SHA512,RipeMD,或 WHIRLPOOL。

### 正确的方式：怎样正确地计算 hash

这一节介绍了密码应该怎样被 hash 的正确方式。第一小节杭盖了最基本的——也是实际上需要的所有东西。接下来的一小节解释了这些基本的方式可以怎样被增强让其更加难以攻击。

### 最基本的：加盐散列

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

每个用户每个密码的盐都必须要是唯一的。每次用户创建账户或者修改密码，密码都必须使用新的盐来计算 hash 。绝不要重用盐。并且盐的长度要足够的长，这样才有足够多的可能性。首要的规则是，至少让你的盐和 hash 函数输出长度一样长。盐应该和  hash 值一起存放在用户账户表中。

**存储密码：**

1. 使用 CSPRNG 产生一个足够长的随机盐。
2. 把盐附加到密码后面然后使用 **标准** 的 hash 加密函数比如 SHA256 计算 hash 值。
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

**不可能被攻破的 hash：密钥 hash 和密码硬件 hash**

只要攻击者可以通过使用 hash 来检测猜测的密码是否正确，他们总是可以运行词典攻击或者暴力破解攻击。下一步是添加一个 **密钥** 使得只有知道密钥的人才能使用 hash 进行密码验证。可以通过两种方式来完成。可以使用密码算法 AES 对 hash 值进行加密，或者也可以使用密钥 hash 算法例如 [HMAC](http://en.wikipedia.org/wiki/HMAC) 把密钥包含在 hash 中。

这不像说得那么简单。即使在突破事件中这个密钥也必须保证对攻击者的保密。如果一个攻击者获得了访问系统完全的权限，那么不管它存放在哪儿都会被偷走。密钥必须被保存在一个外部系统中，例如和进行密码验证的服务器物理隔离的地方，或者一个附加在服务器上的特殊硬件例如 [YubiHSM](https://www.yubico.com/YubiHSM)。

我强烈推荐拥有大规模用户（超过 100,000）的服务使用这种方法。我觉得对任何超过 1,000,000 用户的任务都是需要的。

如果你担负不起多台专用的服务器或者特殊的硬件设备，你还是可以通过把 key 存放在一个单独的网络服务器上来获得一些好处。大多数的数据库都是被 [SQL注入](http://en.wikipedia.org/wiki/SQL_injection) 攻破的，这种方式一般都不会给攻击者访问本地文件系统的权限（如果你的数据库可以访问文件系统，请禁用掉）。如果你生成了一个随机的 key 并且存放在一个不能通过网络访问的文件中并且使用到加盐 hash 中，这样你的 hash 就不会被简单的 SQL 注入攻击给破解掉。不要把密钥硬编码到代码中，而是当应用安全的时候随机地生成一个。这种方式没有单独的系统那么安全，因为如果 web 应用有 SQL 注入漏洞，那也可能有其他的方式，例如本地文件包含问题，这样攻击者就可以读取密钥文件。但是这也比什么都不做强。

请注意密钥 hash 没有去掉加盐的必要性。聪明的攻击者最终将还是找到威胁密钥的方法，所以使用加盐 hash 和 key 拉伸技术仍然是重要的。

### 其他安全措施

密码 hash 在攻破事件中保护了密码。但是它没有让整个系统更安全。为了保证密码 hash （还有其他用户数据）不被盗走还需要做更多。

即使是有经验的开发者也应该接受安全教育以写出更安全的应用。一个非常好的学习 web 应用漏洞的资源是 [网络应用安全开放项目(OWASP)](https://www.owasp.org/index.php/Main_Page)。[OWASP 十大漏洞表](http://owasptop10.googlecode.com/files/OWASP%20Top%2010%20-%202013.pdf) 是一个很好的介绍。除非你已经理解了表上的所有漏洞，否则不要尝试写一个数据敏感的应用。雇主有责任让所有开发者接受安全应用开发教育。

对你的应用进行一个第三方的渗透测试是一个好的办法。即使最好的程序员也会犯错误，所以让安全专家审查代码以发现潜在的漏洞是有道理的。寻找一个值得信赖的组织（或者自己雇人）定期审查你的代码。在应用开发的早期就应该进行安全审查并且贯穿整个应用的开发。

通过监控来判断网站是否被攻击是重要的。我建议至少雇佣一个全职的人员进行判定和响应安全破坏。一旦一个破坏未被发现，攻击者可以通过恶意软件感染访问者，所以破坏被判断和正确响应是极其重要的。

### 常见问题

#### 我应该使用什么 hash 算法

##### 使用：

+ 本文底部的 PHP 源码，Java 源码，C# 源码或者 Ruby 源码。 
+ OpenWall 的[便携式 PHP 密码 hash 框架](http://www.openwall.com/phpass/)
+ 任何现代的经过良好测试的 hash 加密算法，例如 SHA256,SHA512,RipeMD,WHIRLPOOL,SHA3 等
+ 良好设计的 key 拉伸算法例如 [PBKDF2](http://en.wikipedia.org/wiki/PBKDF2),[bcrypt](http://en.wikipedia.org/wiki/Bcrypt),[scrypt](http://www.tarsnap.com/scrypt.html)
+ 安全版本的 [crypt](http://en.wikipedia.org/wiki/Crypt_\(Unix\)#Library_Function_crypt.283.29) ($2y$, $5$, $6$)

##### 不要使用：

+ 过期的 hash 算法例如 MD5 或者 SHA1。
+ crypt 的不安全版本($1$, $2$, $2x$, $3$)
+ 任何你自己设计的算法。只是用公共域名下的和密码学专家良好设计的技术

即使没有针对 MD5 和 SHA1 的密码攻击让其更容易破解，他们也已经太老了并且不足以用来进行密码存储了。所以我不建议使用它们。一个例外是 PBKDF2 ,它经常被使用 SHA1 来作为底层的实现。

#### 如果用户忘记了密码，我应该怎样让他们重置？

我个人觉得现在广泛使用的密码重置机制都是不安全的。如果你有一个高度安全的需求，例如一个加密服务，不要允许用户重置密码。

大多数站点使用邮件圈来验证忘记了密码的用户。为了这样，生成一个随机的一次使用的 token 强绑定到账户上。把这个包含到发送给用户邮箱的重置密码链接中。当用户点击了一个包含有效的 token 的重置密码的链接，提示用户输入一个新的密码。确保 token 和用户的账户是强关联的，这样可以避免一个用户通过自己的邮箱收到的 token 去重置其他用户的密码。

第一重要的是这个 token 应该被设置为 15 分钟或者使用了之后就过期。在用户登录之后（使用了记住密码）或者请求了另外一个重置 token 就让任何存在的密码 token 过期是一个好方法。如果一个 token 不过期，那么它可以被永远用来进入用户的账户。邮件 (SMTP) 是一个纯文本协议，在网络上可能有恶意的路由记录邮件传播。这样，一个用户的邮件账户（包括重置密码的链接）可能在密码被更改很久之后被使用。所以尽快让 token 过期可以降低用户暴露给攻击者。

攻击者可能会自己修改 token ，所以不要存储用户的账户信息或者超时信息。他们只应该是一个不可预知的随机的二进制字符串用于在数据库中定位记录。

绝不要通过邮件发送新密码给用户。记得当用户重置密码的时候重新生成一个随机的盐。不要重复使用原来的盐。

#### 如果我的用户账户数据库泄漏或者被黑了我应该怎么做？

你最先应该做的事情是找到系统是怎么被攻破的然后堵上攻击者进入的漏洞。如果你不擅长相应攻破，我强烈建议你雇佣一个第三方的安全公司。

掩盖破解和希望没人注意是诱人的。但是，视图掩盖一次攻破可能让事态更糟，因为你让你的用户在将来要承受密码泄露和其他个人信息可能被泄露的风险。你必须尽快通知你的用户——即使你还没完全弄明白发生了什么。在你的主页上放一个跳转到详细信息页面的通知链接，如果可以的话给每个用户发送通知邮件。

给你的用户解释他们的密码是怎样被保护的——希望是加盐的 hash ——即使是被加盐的 hash 保护着，一个恶意攻击者也可能使用词典攻击和暴力破解来攻击 hash 。恶意攻击者可能会使用它们得到的密码在其他站点上登录用户的账户，因为用户可能在其他站点上使用同样的密码。告知你的用户这种风险，建议他们修改其他站点或服务上使用的相似密码的账户密码。强迫用户在下次登录你的服务时修改他们的密码。大多数用户会尝试 “修改” 为原来的的密码来绕过这种强迫。使用当前密码 hash 确保他们不会这样做。

即使是使用了加盐的 hash ，攻击者也可能会很快攻破弱密码的账户。为了减少攻击者使用这些密码的机会，除了当前密码，你还应该给所有用户发邮件直到他们修改了密码为止。查看上一个问题了解如何实现邮件认证。

同时也请告诉你的用户网站存储了什么个人信息。如果你的数据库包含了信用卡信息，你应该指导你的用户查看最近的账单并且取消他们的信用卡。

#### 如何设置我的密码策略？我应该强制用户使用强密码吗？

如果你的服务没有一个严格的安全要求，那就不要限制你的用户。我建议当用户输入密码的时候显示密码的强度，让他们自己决定他们的密码想要的强度。如果你有一个特别的安全需求，强制最低12位的密码并且要求至少两位字母，两位数字和两个符号。

不要强制你的用户半年内改一次密码，这样将让用户疲劳而不愿意选择好的密码。替代的方式是，培养用户当他们觉得密码可能不安全的时候修改密码，并且让他们不要把密码告诉任何人。如果是一个商业设置，鼓励用户使用工作时间记住和练习他们的密码。

#### 如果攻击者已经访问了我的数据库，他们不能使用它们自己的 hash 替代我的密码 hash 然后登录吗？

是的，但是如果某人已经访问到了你的数据库，他们可能已经可以访问你服务器上的所有东西了，所以他们不需要登录来得到他们需要的东西。hash 密码的目的（在一个网站上）是保护网站不被攻破，而不是当攻破发生的时候保护密码。

你可以通过设置不同账户的权限来限制 SQL 注意攻击时 hash 被替换。一个用于创建账户的代码而另外一个用于登录。创建账户的代码应该可以读写数据库而登录代码只需要可以读就行了。

#### 为什么我应该使用特殊的算法例如 HMAC ？为什么我不能直接把密码附加到密钥后面呢？

像 MD5，SHA1 和 SHA2 这些 hash 算法都使用了 [Merkle–Damgård 结构](http://en.wikipedia.org/wiki/Merkle%E2%80%93Damg%C3%A5rd_construction)，这使得他们容易受到已知长度攻击。这一位这提供一个 hash H(X)，攻击者可以找到针对任何其他字符串 Y 的 H(pad(X)+Y) 的值，而不需要知道 X 。 pad(X) 是 hash 算法使用的填充函数。

这意味着如果提供 H(key+message) 的 hash，攻击者可以不用知道密钥计算 H(pad(key+message)+extension)。如果 hash 是用于消息验证码，使用 key 来阻止攻击者修改消息或者使用另外一个有效的 hash 替换它，这样系统就失败了，因为攻击者已经有了一个 message+extension 的有效的 hash 了。

现在尚不清楚这样可以让攻击者攻击密码是否更快。但是，因为这种攻击，使用一个纯文本的 hash 算法作为 key 拉伸被认为是不好的尝试。可能有一天聪明的密码研究人员会找到使用这种攻击方式快速攻击的方法，所以请使用 HMAC 。

#### 盐应该加在密码的前面还是后面？

这没关系，但是请选择一种并且坚持使用。把盐加在密码的前面看起来似乎更常见。

#### 为什么本页上的 hash 在有限次数时间内比较 hash ？

在常数次数时间内对比 hash 确保了攻击者不能在一个线上系统使用时间攻击提取到密码的 hash ，然后离线破解。

对比两个序列的字节（字符串）是否相同的标准方式是首先对比第一个字节，然后是第二个，然后是第三个...一旦你发现一个字节不一样，你就知道他们是不同的然后可以立即返回否定的结果。如果你通过整个序列都没有发现不同的字节，你就知道两个字符串是一样的然后可以返回肯定的结果。这意味着如果对比的字符串匹配程度不一样，就可能耗用不同的时间。

举个例子，一个标准的比较字符串 "xyzabc" 和 "abczyx" 的方法将立即发现第一个字符是不一样的然后将不再比较剩下的字符串。但是，如果比较 "aaaaaaaaaaB" 和 "aaaaaaaaaaZ"，比较算法将一直扫描 "a" 字母这一块知道发现这两个字符串是不一样的。

假设一个攻击者通过每秒尝试一次想要攻击一个速率限制的验证系统。同时假设攻击者知道密码 hash 的所有参数（盐，hash 类型等），仅仅只是不知道 hash 值和密码（显然地）。如果攻击者可以得到一个在线系统比对自己提供的 hash 值和真实密码的　hash 值的耗时，他可以通过传递速率限制使用耗时攻击得到 hash 字符串然后离线进行破解。首先，攻击者找到 256 个有每种可能的开头字节的字符串。他发送每一个字符串给在线系统，记录系统相应的时间。耗时最长的就是第一个字节和真实 hash 第一个字节匹配的。攻击者现在就知道第一个字节了，然后可以通过相似的方式得到第二个字节，然后是第三个等等。一旦攻击者知道了足够的 hash 值，他就可以使用自己的硬件进行攻破，不再需要对系统进行速率限制。

看起来在网络上进行耗时攻击是不可行的。但是，它已经被实现了，并且已经可以[实际使用了](https://crypto.stanford.edu/~dabo/papers/ssl-timing.pdf)。这就是为什么本文中的代码不论字符串多长，都使用相同的时间进行比对。

##### 减速比对代码是如何工作的？

之前的问题解释了为什么需要减速比对，这个问题解释代码是如何工作的：

        private static boolean slowEquals(byte[] a, byte[] b)
        {
                int diff = a.length ^ b.length;
                for(int i = 0; i < a.length && i < b.length; i++)
                diff |= a[i] ^ b[i];
                return diff == 0;
        }

上面的代码使用了异或 "^" 操作符代替 "==" 来获得比较的结果。原因将在下面解释。两个数字的的异或只有在他们都完全相同的时候才会是0.这是因为 0^0=0，1^1=0,0^1=1,1^0=1。如果我们对两个证书的所有位都应用异或运算，只有在两个数完全相同的时候结果才可能是0.

所以，在第一行中，如果 a 的长度和 b 的长度相同， diff 变量将会是 0 。但是如果不是，它将是非零值。接下来，我们使用异或比对字节数组，并且使用对结果和 diff 变量使用或操作。如果字节不相同， diff 将被设置为非零值。因为或操作绝不会把字节设为否，唯一放让 diff 结果为 0 的条件是在循环开始前其值为 0 （a,b 的长度相同）并且两个数组的所有字节都相同（没有异或的值为非零值）。

使用异或代替 "==" 操作符的理由是 "==" 操作符通常被 翻译/编译/解释 为树。举个例子： C 语言的 `diff &= a  == b` 可能被编译为以下 x86 指令集合：

        MOV EAX, [A]
        CMP [B], EAX
        JZ equal
        JMP done
        equal:
        AND [VALID], 1
        done:
        AND [VALID], 0

这种分支使得代码的执行会根据整数是否相同还有 CPU 的内部分支预测状态而不同。

C 语言的 `diff |= a ^ b` 应该会编译成类似下面这样，这样执行时间就不依赖数字是否相等了：

        MOV EAX, [A]
        XOR EAX, [B]
        OR [DIFF], EAX 

#### 为什么要这么麻烦地使用 hash ？

你的用户在你的网站上输入了密码。他们相信你的安全措施。如果你的数据库被黑掉了，并且你的用户的密码没有任何保护，然后恶意的黑客就会使用这些密码危害你的用户在其他站点或服务商的账号（大多数人都到处使用同样的密码）。这不仅是一你的安全风险，而也是用户的。你应该对你的用户的安全负责。

### PHP PBKDF2 密码 hash 代码

下面的代码是在 PHP 中安全地实现 PBKDF2 。你可以在 [Defuse Security's PBKDF2 for PHP](https://defuse.ca/php-pbkdf2.htm) 找到配套测试和基准测试。

[下载 PasswordHash.php](https://crackstation.net/source/password-hashing/PasswordHash.php)

如果你想兼容 PHP 和 C# 的实现，看[这里](https://github.com/defuse/password-hashing/tree/master/compatible)。

        <?php
        /*
         * Password Hashing With PBKDF2 (http://crackstation.net/hashing-security.htm).
         * Copyright (c) 2013, Taylor Hornby
         * All rights reserved.
         *
         * Redistribution and use in source and binary forms, with or without 
         * modification, are permitted provided that the following conditions are met:
         *
         * 1. Redistributions of source code must retain the above copyright notice, 
         * this list of conditions and the following disclaimer.
         *
         * 2. Redistributions in binary form must reproduce the above copyright notice,
         * this list of conditions and the following disclaimer in the documentation 
         * and/or other materials provided with the distribution.
         *
         * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
         * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
         * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
         * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
         * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
         * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
         * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
         * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
         * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
         * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
         * POSSIBILITY OF SUCH DAMAGE.
         */
        
        // These constants may be changed without breaking existing hashes.
        define("PBKDF2_HASH_ALGORITHM", "sha256");
        define("PBKDF2_ITERATIONS", 1000);
        define("PBKDF2_SALT_BYTE_SIZE", 24);
        define("PBKDF2_HASH_BYTE_SIZE", 24);
        
        define("HASH_SECTIONS", 4);
        define("HASH_ALGORITHM_INDEX", 0);
        define("HASH_ITERATION_INDEX", 1);
        define("HASH_SALT_INDEX", 2);
        define("HASH_PBKDF2_INDEX", 3);
        
        function create_hash($password)
        {
            // format: algorithm:iterations:salt:hash
            $salt = base64_encode(mcrypt_create_iv(PBKDF2_SALT_BYTE_SIZE, MCRYPT_DEV_URANDOM));
            return PBKDF2_HASH_ALGORITHM . ":" . PBKDF2_ITERATIONS . ":" .  $salt . ":" .
                base64_encode(pbkdf2(
                    PBKDF2_HASH_ALGORITHM,
                    $password,
                    $salt,
                    PBKDF2_ITERATIONS,
                    PBKDF2_HASH_BYTE_SIZE,
                    true
                ));
        }
        
        function validate_password($password, $correct_hash)
        {
            $params = explode(":", $correct_hash);
            if(count($params) < HASH_SECTIONS)
               return false;
            $pbkdf2 = base64_decode($params[HASH_PBKDF2_INDEX]);
            return slow_equals(
                $pbkdf2,
                pbkdf2(
                    $params[HASH_ALGORITHM_INDEX],
                    $password,
                    $params[HASH_SALT_INDEX],
                    (int)$params[HASH_ITERATION_INDEX],
                    strlen($pbkdf2),
                    true
                )
            );
        }
        
        // Compares two strings $a and $b in length-constant time.
        function slow_equals($a, $b)
        {
            $diff = strlen($a) ^ strlen($b);
            for($i = 0; $i < strlen($a) && $i < strlen($b); $i++)
            {
                $diff |= ord($a[$i]) ^ ord($b[$i]);
            }
            return $diff === 0;
        }
        
        /*
         * PBKDF2 key derivation function as defined by RSA's PKCS #5: https://www.ietf.org/rfc/rfc2898.txt
         * $algorithm - The hash algorithm to use. Recommended: SHA256
         * $password - The password.
         * $salt - A salt that is unique to the password.
         * $count - Iteration count. Higher is better, but slower. Recommended: At least 1000.
         * $key_length - The length of the derived key in bytes.
         * $raw_output - If true, the key is returned in raw binary format. Hex encoded otherwise.
         * Returns: A $key_length-byte key derived from the password and salt.
         *
         * Test vectors can be found here: https://www.ietf.org/rfc/rfc6070.txt
         *
         * This implementation of PBKDF2 was originally created by https://defuse.ca
         * With improvements by http://www.variations-of-shadow.com
         */
        function pbkdf2($algorithm, $password, $salt, $count, $key_length, $raw_output = false)
        {
            $algorithm = strtolower($algorithm);
            if(!in_array($algorithm, hash_algos(), true))
                trigger_error('PBKDF2 ERROR: Invalid hash algorithm.', E_USER_ERROR);
            if($count <= 0 || $key_length <= 0)
                trigger_error('PBKDF2 ERROR: Invalid parameters.', E_USER_ERROR);
        
            if (function_exists("hash_pbkdf2")) {
                // The output length is in NIBBLES (4-bits) if $raw_output is false!
                if (!$raw_output) {
                    $key_length = $key_length * 2;
                }
                return hash_pbkdf2($algorithm, $password, $salt, $count, $key_length, $raw_output);
            }
        
            $hash_length = strlen(hash($algorithm, "", true));
            $block_count = ceil($key_length / $hash_length);
        
            $output = "";
            for($i = 1; $i <= $block_count; $i++) {
                // $i encoded as 4 bytes, big endian.
                $last = $salt . pack("N", $i);
                // first iteration
                $last = $xorsum = hash_hmac($algorithm, $last, $password, true);
                // perform the other $count - 1 iterations
                for ($j = 1; $j < $count; $j++) {
                    $xorsum ^= ($last = hash_hmac($algorithm, $last, $password, true));
                }
                $output .= $xorsum;
            }
        
            if($raw_output)
                return substr($output, 0, $key_length);
            else
                return bin2hex(substr($output, 0, $key_length));
        }
        ?>

### ASP.NET(C#) hash 密码源代码

下面的代码是在 ASP.NET 中使用 C# 安全实现 hash 加盐密码。可以从这里下载：[Download PasswordHash.cs](https://crackstation.net/source/password-hashing/PasswordHash.cs)

如果你需要兼容 PHP 和 C# 的实现，查看[这里](https://crackstation.net/source/password-hashing/PasswordHash.cs)。

        /* 
         * Password Hashing With PBKDF2 (http://crackstation.net/hashing-security.htm).
         * Copyright (c) 2013, Taylor Hornby
         * All rights reserved.
         *
         * Redistribution and use in source and binary forms, with or without 
         * modification, are permitted provided that the following conditions are met:
         *
         * 1. Redistributions of source code must retain the above copyright notice, 
         * this list of conditions and the following disclaimer.
         *
         * 2. Redistributions in binary form must reproduce the above copyright notice,
         * this list of conditions and the following disclaimer in the documentation 
         * and/or other materials provided with the distribution.
         *
         * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
         * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
         * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
         * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
         * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
         * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
         * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
         * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
         * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
         * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
         * POSSIBILITY OF SUCH DAMAGE.
         */
        
        using System;
        using System.Text;
        using System.Security.Cryptography;
        
        namespace PasswordHash
        {
            /// <summary>
            /// Salted password hashing with PBKDF2-SHA1.
            /// Author: havoc AT defuse.ca
            /// www: http://crackstation.net/hashing-security.htm
            /// Compatibility: .NET 3.0 and later.
            /// </summary>
            public class PasswordHash
            {
                // The following constants may be changed without breaking existing hashes.
                public const int SALT_BYTE_SIZE = 24;
                public const int HASH_BYTE_SIZE = 24;
                public const int PBKDF2_ITERATIONS = 1000;
        
                public const int ITERATION_INDEX = 0;
                public const int SALT_INDEX = 1;
                public const int PBKDF2_INDEX = 2;
        
                /// <summary>
                /// Creates a salted PBKDF2 hash of the password.
                /// </summary>
                /// <param name="password">The password to hash.</param>
                /// <returns>The hash of the password.</returns>
                public static string CreateHash(string password)
                {
                    // Generate a random salt
                    RNGCryptoServiceProvider csprng = new RNGCryptoServiceProvider();
                    byte[] salt = new byte[SALT_BYTE_SIZE];
                    csprng.GetBytes(salt);
        
                    // Hash the password and encode the parameters
                    byte[] hash = PBKDF2(password, salt, PBKDF2_ITERATIONS, HASH_BYTE_SIZE);
                    return PBKDF2_ITERATIONS + ":" +
                        Convert.ToBase64String(salt) + ":" +
                        Convert.ToBase64String(hash);
                }
        
                /// <summary>
                /// Validates a password given a hash of the correct one.
                /// </summary>
                /// <param name="password">The password to check.</param>
                /// <param name="correctHash">A hash of the correct password.</param>
                /// <returns>True if the password is correct. False otherwise.</returns>
                public static bool ValidatePassword(string password, string correctHash)
                {
                    // Extract the parameters from the hash
                    char[] delimiter = { ':' };
                    string[] split = correctHash.Split(delimiter);
                    int iterations = Int32.Parse(split[ITERATION_INDEX]);
                    byte[] salt = Convert.FromBase64String(split[SALT_INDEX]);
                    byte[] hash = Convert.FromBase64String(split[PBKDF2_INDEX]);
        
                    byte[] testHash = PBKDF2(password, salt, iterations, hash.Length);
                    return SlowEquals(hash, testHash);
                }
        
                /// <summary>
                /// Compares two byte arrays in length-constant time. This comparison
                /// method is used so that password hashes cannot be extracted from
                /// on-line systems using a timing attack and then attacked off-line.
                /// </summary>
                /// <param name="a">The first byte array.</param>
                /// <param name="b">The second byte array.</param>
                /// <returns>True if both byte arrays are equal. False otherwise.</returns>
                private static bool SlowEquals(byte[] a, byte[] b)
                {
                    uint diff = (uint)a.Length ^ (uint)b.Length;
                    for (int i = 0; i < a.Length && i < b.Length; i++)
                        diff |= (uint)(a[i] ^ b[i]);
                    return diff == 0;
                }
        
                /// <summary>
                /// Computes the PBKDF2-SHA1 hash of a password.
                /// </summary>
                /// <param name="password">The password to hash.</param>
                /// <param name="salt">The salt.</param>
                /// <param name="iterations">The PBKDF2 iteration count.</param>
                /// <param name="outputBytes">The length of the hash to generate, in bytes.</param>
                /// <returns>A hash of the password.</returns>
                private static byte[] PBKDF2(string password, byte[] salt, int iterations, int outputBytes)
                {
                    Rfc2898DeriveBytes pbkdf2 = new Rfc2898DeriveBytes(password, salt);
                    pbkdf2.IterationCount = iterations;
                    return pbkdf2.GetBytes(outputBytes);
                }
            }
        }


### Ruby (on Rails) 密码 hash 源代码

下面是 Ruby 中使用加盐 PBKDF2 密码 hash 的实现代码。可以从这里下载：[Download PasswordHash.rb](https://crackstation.net/source/password-hashing/PasswordHash.rb)

        # Password Hashing With PBKDF2 (http://crackstation.net/hashing-security.htm).
        # Copyright (c) 2013, Taylor Hornby
        # All rights reserved.
        # 
        # Redistribution and use in source and binary forms, with or without 
        # modification, are permitted provided that the following conditions are met:
        # 
        # 1. Redistributions of source code must retain the above copyright notice, 
        # this list of conditions and the following disclaimer.
        # 
        # 2. Redistributions in binary form must reproduce the above copyright notice,
        # this list of conditions and the following disclaimer in the documentation 
        # and/or other materials provided with the distribution.
        # 
        # THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
        # AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
        # IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
        # ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
        # LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
        # CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
        # SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
        # INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
        # CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
        # ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
        # POSSIBILITY OF SUCH DAMAGE.
        
        require 'securerandom'
        require 'openssl'
        require 'base64'
        
        # Salted password hashing with PBKDF2-SHA1.
        # Authors: @RedragonX (dicesoft.net), havoc AT defuse.ca 
        # www: http://crackstation.net/hashing-security.htm
        module PasswordHash
        
          # The following constants can be changed without breaking existing hashes.
          PBKDF2_ITERATIONS = 1000
          SALT_BYTE_SIZE = 24
         HASH_BYTE_SIZE = 24
        
          HASH_SECTIONS = 4
          SECTION_DELIMITER = ':'
          ITERATIONS_INDEX = 1
          SALT_INDEX = 2
          HASH_INDEX = 3
        
          # Returns a salted PBKDF2 hash of the password.
          def self.createHash( password )
            salt = SecureRandom.base64( SALT_BYTE_SIZE )
            pbkdf2 = OpenSSL::PKCS5::pbkdf2_hmac_sha1(
              password,
              salt,
              PBKDF2_ITERATIONS,
              HASH_BYTE_SIZE
            )
            return ["sha1", PBKDF2_ITERATIONS, salt, Base64.encode64( pbkdf2 )].join( SECTION_DELIMITER )
          end
        
          # Checks if a password is correct given a hash of the correct one.
          # correctHash must be a hash string generated with createHash.
          def self.validatePassword( password, correctHash )
            params = correctHash.split( SECTION_DELIMITER )
            return false if params.length != HASH_SECTIONS
        
            pbkdf2 = Base64.decode64( params[HASH_INDEX] )
            testHash = OpenSSL::PKCS5::pbkdf2_hmac_sha1(
              password,
              params[SALT_INDEX],
              params[ITERATIONS_INDEX].to_i,
              pbkdf2.length
            )
        
            return pbkdf2 == testHash
          end
        
          # Run tests to ensure the module is functioning properly.
          # Returns true if all tests succeed, false if not.
          def self.runSelfTests
            puts "Sample hashes:"
            3.times { puts createHash("password") }
        
            puts "\nRunning self tests..."
            @@allPass = true
        
            correctPassword = 'aaaaaaaaaa'
            wrongPassword = 'aaaaaaaaab'
            hash = createHash(correctPassword)
        
            assert( validatePassword( correctPassword, hash ) == true, "correct password" )
            assert( validatePassword( wrongPassword, hash ) == false, "wrong password" )
        
            h1 = hash.split( SECTION_DELIMITER )
            h2 = createHash( correctPassword ).split( SECTION_DELIMITER )
            assert( h1[HASH_INDEX] != h2[HASH_INDEX], "different hashes" )
            assert( h1[SALT_INDEX] != h2[SALT_INDEX], "different salt" )
        
            if @@allPass
              puts "*** ALL TESTS PASS ***"
            else
              puts "*** FAILURES ***"
            end
        
            return @@allPass
          end
        
          def self.assert( truth, msg )
            if truth
              puts "PASS [#{msg}]"
            else
              puts "FAIL [#{msg}]"
              @@allPass = false
            end
          end
        
        end
        
        PasswordHash.runSelfTests

文章和代码都是 [Defuse Security](https://defuse.ca/) 所著。


原文： [Salted Password Hashing - Doing it Right](https://crackstation.net/hashing-security.htm)
