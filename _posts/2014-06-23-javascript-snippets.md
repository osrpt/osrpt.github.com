---
layout: post
title: Javascript snippets
tags:
- javascript
- snippets
---

下面是我收集的一些 js 代码片段：

###1. 取消和恢复右键菜单

1. 使用命名方法

		function returnFalse(e) {
			return false;
		}
		$(document).bind("contextmenu", returnFalse); // disable contextmenu
		$(document).unbind("contextmenu", returnFalse); // enable contextmenu

2. 使用命名空间事件

		$(document).bind("contextmenu.namespace", function(e) {		
			return false;
		}); // disable contextmenu
		$(document).unbind("contextmenu.namespace"); // enable contextmenu

*在 Chrome 中，如果想通过点击右键来恢复右键菜单，第一次点击就会弹出右键菜单，可以通过以下方式来取消：*

		$(document).mouseup (e)->
			if e.which is 3
				setTimeout ()->
					$(document).unbind("contextmenu.namespace")
				,1

###2. with 'vanilla' ajax call

>from:<http://stackoverflow.com/questions/8567114/how-to-make-an-ajax-call-without-jquery>

		ajax =
			x: ()->
				if typeof XMLHttpRequest isnt "undefined"
					return new XMLHttpRequest()
				versions = [
					"MSXML2.XmlHttp.5.0"
					"MSXML2.XmlHttp.4.0"
					"MSXML2.XmlHttp.3.0"
					"MSXML2.XmlHttp.2.0"
					"Microsoft.XmlHttp"
				]
				for version in versions
					try
						xhr = new ActiveXObject(version)
						break
					catch e
						console.dir e
				return xhr
			send: (url, cb, method, data, sync)->
				x = ajax.x()
				x.open(method, url, sync)
				x.onreadystatechange = ()->
					if x.readyState is 4
						try
							cb JSON.parse(x.responseText)
							return
						catch e
		
						cb x.responseText
		
				if method is "POST"
					x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		
				x.send(data)
			get: (url, data, cb, sync)->
				query = []
				for key,value of data
					query.push "#{encodeURIComponent(key)}=#{encodeURIComponent(value)}"
				ajax.send url + "?" + query.join('&'), cb, 'GET', null, sync
			post: (url, data, cb, sync)->
				query = []
				for key,value of data
					query.push "#{encodeURIComponent(key)}=#{encodeURIComponent(value)}"
				ajax.send url, cb, 'POST', query.join('&'), sync

###3. resolve hostname from url

	getHostNameFromUrl=(url)->
		matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
		return matches && matches[1]

eg:

	hostName=getHostNameFromUrl("http://medium.com/p/pxeys3a") # host name will be:medium.com

###4. string format

	###
		format string
		@param {String} input
		@param {Array} args 
		@return {String} formated string
	###
	formatString=(input,args)->
		input.replace /{(\d+)}/g, (match, number) ->
			(if typeof args[number] is "undefined" then match else args[number])

eg:

	input="Hello {0},I'm {1}"
	args=["Alice","Bob"]
	result=formatString(input,args) #result will be:Hello,Alice,I'm bob
