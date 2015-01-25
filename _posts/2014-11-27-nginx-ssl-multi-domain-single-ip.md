---
layout: post
title: Nginx 上 SSL 的基本配置和同一 IP 下多个域名的配置
---

今天给网站添加 SSL 认证，过程可谓一波三折，这里记录一下。

###为什么要用 SSL?

[wiki](https://en.wikipedia.org/wiki/Transport_Layer_Security)

简单来说，保证网络通信的安全性。

对我来说更重要的一点是：让客户信任我的服务的安全性，从而购买我的服务。

###如何购买？

普通认证的 SSL 证书非常便宜，适合小型企业使用。

我选择的是 [namecheap](https://www.namecheap.com/security/ssl-certificates.aspx) 。购买后可以立即使用，很快就可以完成整个流程。另外 namecheap 还提供了在线的人工服务，我两次遇到问题都直接联系了在线的客服，他们都很快提供了响应。非常赞的服务。

我从 namecheap 选择了 COMODO 的 PositiveSSL，目前一年只需要 9 美元。但是注意：这个只能单个域名使用。 `www.example.com` 和 `sub.example.com` 是两个不同的域名，如果都需要认证，必须分别购买。

*当然你也可以选择其他的类型，请根据自己的需要选择。*

###如何使用购买的证书？

购买成功后，namecheap 会让你填写 CSR。

CSR 需要在服务器上生成。以下内容摘自 [ruby-china](https://ruby-china.org/topics/9373):

	sudo mkdir /etc/nginx/ssl
	cd /etc/nginx/ssl

	#生成private key
	sudo openssl genrsa -des3 -out server.key 2048
	这里问你输入一个passphrase,选择一个容易记得，下一步会需要输入。

	#生成 CSR
	sudo openssl req -new -key server.key -out server.csr

	Country Name (2 letter code) [AU]:US  #国家代码
	State or Province Name (full name) [Some-State]:New York #省份
	Locality Name (eg, city) []:NYC  #城市
	Organization Name (eg, company) [Internet Widgits Pty Ltd]:Awesome Inc #公司名称
	Organizational Unit Name (eg, section) []:   #部门名称
	Common Name (e.g. server FQDN or YOUR name) []: www.example.com                  
	Email Address []: admin@example.com  #管理员邮箱

以上代码引用自 [ruby-china](https://ruby-china.org/topics/9373)

上面的 `Common Name` 即是你要认证的域名，`www.example.com` 已经包含了 `example.com` 。

将生成的 csr 文件的内容填到 namecheap 网站上，后面会让你选择一个邮箱接收邮件。因为这里需要确认域名归属，所以请选择正确的邮箱。

很快你的邮箱将收到一封邮件让你批准 SSL 认证，点击其中的链接，并到网站上填写邮件中的代码。管理员邮箱将很快收到另外一封包含 crt 认证附件的邮件。

###安装证书

下载附件，是一个 zip 文件。解压后有四个文件。如果你的不同，具体请查看：<https://support.comodo.com/index.php?/Default/Knowledgebase/Article/View/789/37/certificate-installation-nginx>。 这篇文档详细说明了如何安装你收到的证书。

检查 SSL 是否安装正确： <https://www.sslshopper.com/ssl-checker.html>