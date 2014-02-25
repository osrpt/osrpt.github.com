---
layout: post
title: node.js使用mysql
---

安装mysql模块，命令：`npm install mysql`


数据库访问代码(sqlHelper.js):

        var mysql = require('mysql');
        var dbConfig = require('').dbConfig(); //获取数据库配置
        var logger = require(''); //引入log模块

        var pool = mysql.createPool(dbConfig); //创建连接池

        /**
         * 测试数据库连接
         * @param callback
         */
        exports.testConnect = function (callback) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    logger.log('test connect error', err);
                    callback(err);
                }
                else {
                    connection.query('SELECT 1+1 as result', function (err2, rows, fields) {
                        connection.release();
                        if (err2) {
                            logger.log('mysql执行异常', err2);
                            callback(err2);
                        }
                        else {
                            callback(null, rows[0].result===2);
                        }
                    });
                }
            });
        }

使用NodeUnit进行测试，测试代码(sqlTest.js):

        var sqlHelper = require('../helper/sqlHelper');
        exports.testSqlConnect = function (test) {
            sqlHelper.testConnect(function (e, result) {
                test.ok(!e, '没有发生异常');
                test.ok(result, '计算正常');
                test.done();
            })
        }
