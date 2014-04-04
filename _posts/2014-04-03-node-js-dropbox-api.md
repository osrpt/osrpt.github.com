---
layout: post
title: node.js调用dropbox的api
---

###方法一、直接调用HTTP方法

        /**
         * 用户登录
         * @param req
         * @param res
         */
        exports.login = function (req, res) {
            var csrf = uuid.v4();
            res.cookie('csrf', csrf);
            res.redirect(url.format({
                protocol: 'https',
                hostname: 'www.dropbox.com',
                pathname: '1/oauth2/authorize',
                query: {
                    client_id: 'hueae5vi66xwsij',
                    response_type: 'code',
                    state: csrf,
                    redirect_uri: 'http://127.0.0.1:8080/user/dropboxauth'
                }
            }));
        };

        /**
         * dropbox auth方法
         * @param req
         * @param res
         */
        exports.dropboxAuth = function (req, res) {
            if (req.query.error) {
                return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
            }

            // check CSRF token
            if (req.query.state !== req.cookies.csrf) {
                return res.status(401).send(
                    'CSRF token mismatch, possible cross-site request forgery attempt.'
                );
            } else {
                // exchange access code for bearer token
                request.post('https://api.dropbox.com/1/oauth2/token', {
                    form: {
                        code: req.query.code,
                        grant_type: 'authorization_code',
                        redirect_uri: 'http://127.0.0.1:8080/user/dropboxauth'
                    },
                    auth: {
                        user: 'hueae5vi66xwsij',
                        pass: 's01lp2mct5kxmuc'
                    }
                }, function (error, response, body) {
                    var data = JSON.parse(body);

                    if (data.error) {
                        return res.send('ERROR: ' + data.error);
                    }

                    // extract bearer token
                    var token = data.access_token;

                    // use the bearer token to make API calls
                    request.get('https://api.dropbox.com/1/account/info', {
                        headers: { Authorization: 'Bearer ' + token }
                    }, function (error, response, body) {
                        res.send('Logged in successfully as ' + JSON.parse(body).display_name + '.');
                    });

                    // write a file
                    // request.put('https://api-content.dropbox.com/1/files_put/auto/hello.txt', {
                    //  body: 'Hello, World!',
                    //  headers: { Authorization: 'Bearer ' + token }
                    // });
                });
            }
        };

###方法二、使用官方的node.js api
[node.js sdk](https://github.com/dropbox/dropbox-js)

使用CoffeeScript写的SDK，应该是从第三方直接移植过来的，支持平台较多，但是较为麻烦，api不清晰。

###方法三、使用第三方的sdk
[node-dbox](https://github.com/sintaxi/node-dbox)

api清晰，调用简单

        res.redirect(request_token.authorize_url + '&oauth_callback=' + encodeURIComponent('http://localhost:8080/dropbox'));