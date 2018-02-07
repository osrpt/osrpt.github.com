---
layout: post
title: 在express中实现Asp.NET MVC风格的框架
tags:
- node.js
- mvc
- framework
---

node.js 的 express 框架本身非常灵活，可以用来自由实现各种风格的框架，由于我之前一直使用的是 Asp.NET 的MVC框架，所以决定在node.js中实现一套相似的框架。

### 项目结构：

        |-- app.js
        |-- config.js
        |-- lib
        |   |-- mvc.js
        |-- controllers
        |   |-- home.js
        |   |-- user.js
        |-- views
        |   |-- home
        |   |   |-- index.html
        |   |-- user
        |   |   |-- index.html
        |   |   |-- login.html
        |   |   |-- register.html
        |-- services
        |   |   |-- db
        |   |   |   |-- dbUser.js
        |   |   |   |-- dbHome.js
        |   |   |-- mailService.js   
        |   |   |-- redisService.js

### controllers

控制器目录。存放所有的controller js代码，不能放其他代码，否则可能导致异常。

默认的HTTP请求方法为get,通过对方法命名添加以下划线开头的http动作来实现对HTTP方法的特别声明，例如 login_POST 将响应 POST 请求，不会响应 GET 请求。可以同时使用多个，例如 newBlog_GET_PUT_POST。方法内部可以使用 request.method === 'GET' 俩区分不同的请求方式。

例如：

        /**
        * 添加新的博客
        */
        exports.add_GET_POST = function (req, res) {
            if (req.method === 'GET') {
                res.render('add');
            }
            else {
                var body = req.body;
                var blog = {
                    title: body.title,
                    content: entities.decode(body.content),
                    author: body.author
                };
                dbBlog.addBlog(blog, function (err, result) {
                    if (err || result.success === false) {
                        res.send({
                            code: 1,
                            message: '添加博客失败'
                        });
                    }
                    else {
                        res.send({
                            code: 0,
                            message: '添加博客成功'
                        });
                    }
                });
            }
        };

controller的使用有以下几点需要注意的地方：

* \_有特殊的作用，所以action中不应该有\_ 
* controllers文件夹下只能放controller，不能放其他的文件
* `shared` 有特殊的作用，不能使用这个名称作为控制器的名称
* 控制器中的以下成员有特殊的作用，不能作为action名称：`routeConfig`，`authConfig` 。
* 默认的路由为：`GET /controllerName/actionName' ，HTTP动词可以使用下划线来配置，如果要改变默认配置，可以添加routeConfig进行配置。后文将具体讲解。
* 默认情况下：home控制器将相应根目录的请求，index方法默认相应对控制器的请求。

### views

视图目录。为每个控制器建立一个单独的文件夹存放各自的视图。名字必须完全一样，不能改变。

`shared` 是一个特殊的目录，其中只放置公用的视图模板。所以不能创建 `shared` 控制器。

### lib/mvc.js
实现mvc框架的主要代码，参考了 express 中示例程序中的 mvc 实现，进行了改写。支持home作为根目录，index作为默认的action。

        var fs = require('fs');
        var express = require('express');

        /**
         * 配置
         * @param app
         */
        module.exports = function (parent) {
            fs.readdirSync(__dirname + "/../controllers").forEach(function (name) {
                var obj = require('./../controllers/' + name);
                var controllerName = name.replace('.js', ''); //去掉后缀名

                var app = express();
                app.set('views', __dirname + '/../views/' + controllerName);

                var routeConfig = obj.routeConfig; //特殊的路由配置
                var authActions = obj.authConfig; //需要启用验证的方法

                for (var key in obj) {
                    if (~['routeConfig', 'authConfig'].indexOf(key)) continue; //跳过特殊用途的成员

                    //如果该方法有特殊的路由配置，实用特殊的路由配置
                    if (routeConfig && routeConfig[key]) {
                        var specialRouteConfig = routeConfig[key];
                        var specialRouteConfigMethods = specialRouteConfig.methods || ['get'];
                        specialRouteConfigMethods.forEach(function (method) {
                            if (needAuth(authActions, key)) { //如果该方法需要auth，添加auth中间方法
                                app[method](specialRouteConfig.route, auth, obj[key]);
                            }
                            else {
                                app[method](specialRouteConfig.route, obj[key]);
                            }
                        });
                    }
                    else {
                        var methodInfo = getMethodInfo(key);
                        methodInfo.httpMethods.forEach(function (method) {
                            if (controllerName === 'home') {
                                if (needAuth(authActions, key)) {
                                    app[method]('/', auth, obj[key]); //配置homeController为默认响应根目录的请求
                                }
                                else {
                                    app[method]('/', obj[key]); //配置homeController为默认响应根目录的请求
                                }
                            }

                            if (methodInfo.prefix === 'index') {
                                if (needAuth(authActions, key)) {
                                    app[method]('/' + controllerName, auth, obj[key]); //配置index为默认的响应方法
                                }
                                else {
                                    app[method]('/' + controllerName, obj[key]); //配置index为默认的响应方法
                                }
                            }

                            if (needAuth(authActions, key)) {
                                app[method]('/' + controllerName + '/' + methodInfo.prefix, auth, obj[key]);
                            }
                            else {
                                app[method]('/' + controllerName + '/' + methodInfo.prefix, obj[key]);
                            }
                        });
                    }
                }
                parent.use(app);
            });
        };

        /**
         * 获取方法支持的HTTP方法
         */
        function getMethodInfo(methodName) {
            if (methodName.indexOf('_') === -1) return {
                'prefix': methodName,
                'httpMethods': ['get']
            };

            var info = methodName.toLowerCase().split('_');
            return {
                'prefix': info[0],
                'httpMethods': info.slice(1)
            };
        };

        /**
         * 判断方法是否需要身份验证才能访问
         */
        function needAuth(needAuth, key) {
            if (needAuth && needAuth.indexOf(key) > -1) return true;
            return false;
        };

        /**
         * 验证身份
         * @param req
         * @param res
         * @param next
         */
        function auth(req, res, next) {
            if(req.session&&req.session.userId>0){
                    next(); 
            }
            else{
                res.redir('/user/login');
            }
        };

代码中已经进行了详细的注释，有以下几点需要注意：

* routeConfig中用来配置特殊的路由，可以同时配置http请求方法
* authConfig中配置需要进行auth验证的方法

### 总结

已经可以基本满足大部分情况，但是目前还有一些有待改进的地方：

* 没有类似C#中areas的设计
* 为了添加auth中间件所以代码非常恶心，不够优雅，需要改进
* 路由配置比较麻烦，没有C#中强大的配置方式，还需要改进。
* Asp.NET Web Api 和 MVC的实现方式非常相似，可以借鉴，可以同时实现类似 web api的设计。
