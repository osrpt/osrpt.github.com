---
layout: post
title: node.js处理中文编码问题
---

由于js处理中文编码较弱，所以node.js处理中文编码同样存在很多问题。

node.js code:

		var urlUtil = require('url');
		
		/**
		 * 下载网页
		 * @param url
		 * @param callback
		 */
		exports.downloadPage = function (url, callback) {
		
		    var parser = urlUtil.parse(url);
		
		    http.get({
		        hostname: parser.hostname,
		        port: 80,
		        path: parser.pathname,
		        headers: {
		            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36'
		        }
		    },function (res) {
		        if (res.statusCode == 200) {
		            var buffer = new BufferHelper();
		            res.on('data',function (data) {
		                buffer.concat(data);
		            }).on('end', function () {
		                    var buf = buffer.toBuffer();
		                    var result = buf.toString();
		                    var charset = getCharset(res.headers, result) || jschart.detect(result).encoding;
		                    var body = iconv.decode(buf, charset);
		                    body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<!--[\s\S]*?-->/gi, ''); //移除script标签，移除注释
		                    callback(null, body, charset);
		                });
		        } else {
		            callback(new Error("status code:" + res.statusCode));
		        }
		    }).on('error', function (error) {
		            callback(error);
		        });
		};
		
		/**
		 * 获取编码
		 * @param  {[type]} headers [description]
		 * @param  {[type]} body    [description]
		 * @return {string}         [description]
		 */
		
		function getCharset(headers, body) {
		    var charset;
		    try {
		        var re = /<meta[^>]*charset=['"]?([^'"]*)/gi;
		        var arr = re.exec(body);
		        charset = arr[1];
		        if (charset) {
		            return charset;
		        }
		    } catch (e) {
		    }
		
		    try {
		        charset = headers["content-type"].match(/charset=(.*)/gi)[1];
		        if (charset) {
		            return charset;
		        }
		    } catch (e) {
		    }
		    return '';
		}
		
		/**
		 * 检测是否为有效的url地址
		 * @param  {String} input [description]
		 * @return {boolean}       [description]
		 */
		exports.validUrl = function (input) {
		    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		    return regexp.test(input);
		};
