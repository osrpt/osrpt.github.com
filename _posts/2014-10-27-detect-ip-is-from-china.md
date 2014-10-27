---
layout: post
title: 判断客户端IP地址是否来自中国大陆
tags:
- ip
- api
---

在开发多语言适配的网站时，我们经常需要判断客户端的来源。本文主要介绍如何判断客户端是否来自中国大陆。

根据业务需要，可以采用在服务端或者客户端来判断。如果业务允许，建议在客户端判断，这样可以减轻服务器压力，开发难度也很小。

##服务端

###1. IP 数据库

可以下载 IP 地址数据库，然后在服务端获取用户 IP 判断用户的来源。
根据 IP 数据库的详细程度，这种方式可以活的较为准确的信息，但是服务端需要建立一个 IP 数据库。

###2. 根据 apnic IP 地址分配信息查询

下载 <http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest>，然后根据客户端 IP 判断。

这种方式可以判断出用户是否来自中国，但是不能获取更进一步的信息。

###3. 利用淘宝的 IP 服务判断

淘宝提供了 [IP 查询服务](http://ip.taobao.com/instructions.php)，可以根据 IP 地址查询到客户端详细信息，而且较为准确。

但是这种方式需要请求淘宝的接口，可能对速度有一定的影响。

淘宝 IP 查询接口：

    http://ip.taobao.com/service/getIpInfo.php?ip=[ip地址字串]

返回数据格式：

    {
        code: 0,
        data: {
            country: "中国",
            country_id: "CN",
            area: "西南",
            area_id: "500000",
            region: "云南省",
            region_id: "530000",
            city: "昆明市",
            city_id: "530100",
            county: "",
            county_id: "-1",
            isp: "联通",
            isp_id: "100026",
            ip: "221.3.133.230"
        }
    }

##客户端

如果不是严格需要控制客户端的跳转，可以在前端进行判断，这样可以减轻服务器压力。

###1. 使用淘宝 IP 服务查询：

该接口是我通过查看淘宝前端页面调用的信息抓取出来的，淘宝没有直接公开该接口，请慎用，淘宝随时可能修改该接口。

    http://ip.taobao.com/service/getIpInfo.php?ip=myip

返回数据格式跟上面一样。

有了这个接口，就可以直接在前端进行判断。然后根据判断结果提示用户跳转页面。

###2. 利用 GFW 判断

这个思路非常特别，利用 GFW 对某些网站的封杀，在前端访问这些被封杀网站的服务，将返回错误，这样也可以快速判断是否位于中国大陆。

##参考

1. <http://www.oschina.net/code/snippet_177666_33250>
2. <http://ip.taobao.com>
