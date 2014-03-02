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
                    connection.release(); //注意使用完连接之后需要释放
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

###获取受影响的行数

select query:

        connection.query(sql, [var1,var2], function(err, results) {
            numRows = results.length;
        });

update/insert:

        connection.query(sql, [var1,var2], function(err, result) {
            numRows = result.affectedRows;
        });

###简单的事务(transection)
        connection.beginTransaction(function (err) {
            if (err) {
                logger.log('begin transaction error', err);
                throw err;
            }
            else {
                connection.query('INSERT INTO ...', [parameter1,parameter2], function (err, result) {
                    if (err || result.affectedRows <= 0) {
                        connection.rollback(function () {
                            logger.log('insert error', err);
                            throw err;
                        });
                    }
                    else {
                        connection.query('UPDATE ...', [parameter1,parameter2], function (err, result) {
                            if (err || result.affectedRows <= 0) {
                                connection.rollback(function () {
                                    logger.log('update error', err);
                                    throw err;
                                })
                            }
                            else {
                                connection.commit(function () {
                                    callback(null, 'success');
                                });
                            }
                        })
                    }

                });
            }
        });

*[see more &#10548;](http://stackoverflow.com/questions/16199842/find-number-of-rows-in-returned-mysql-result-nodejs)*
