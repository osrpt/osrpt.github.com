---
layout: post
title: Mysql Tips
tags:
- mysql
- tips
---

###记录每一个查询语句

FROM: <http://stackoverflow.com/a/7470567/1778658>

先查看文件位置：

`
mysql> SHOW VARIABLES LIKE "general_log%";

+------------------+----------------------------+
| Variable_name    | Value                      |
+------------------+----------------------------+
| general_log      | OFF                        |
| general_log_file | /var/run/mysqld/mysqld.log |
+------------------+----------------------------+
`

开启记录：

`
mysql>SET GLOBAL general_log = 'ON';
`

查看记录：

`
tail -f -n100 /var/run/mysqld/mysqld.log
`

最后别忘了要关闭记录：

`
SET GLOBAL general_log = 'OFF';
`

### 查看连接信息

FROM: <http://alvinalexander.com/blog/post/mysql/how-show-open-database-connections-mysql>

`
mysql> show status like '%onn%';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| Aborted_connects         | 0     | 
| Connections              | 8     | 
| Max_used_connections     | 4     | 
| Ssl_client_connects      | 0     | 
| Ssl_connect_renegotiates | 0     | 
| Ssl_finished_connects    | 0     | 
| Threads_connected        | 4     | 
+--------------------------+-------+
7 rows in set (0.00 sec)
`

这里的 Connections 指的是所有的连接总数：

>Connections
>
>The number of connection attempts (successful or not) to the MySQL server.

### 查看进程信息

`
mysql> show processlist;
+----+------+-----------------+--------+---------+------+-------+------------------+
| Id | User | Host            | db     | Command | Time | State | Info             |
+----+------+-----------------+--------+---------+------+-------+------------------+
|  3 | root | localhost       | webapp | Query   |    0 | NULL  | show processlist | 
|  5 | root | localhost:61704 | webapp | Sleep   |  208 |       | NULL             | 
|  6 | root | localhost:61705 | webapp | Sleep   |  208 |       | NULL             | 
|  7 | root | localhost:61706 | webapp | Sleep   |  208 |       | NULL             | 
+----+------+-----------------+--------+---------+------+-------+------------------+
4 rows in set (0.00 sec)
`

### mysql 状态

`
$ mysqladmin status
`

### 查看正在连接的进程信息

`
mysql>SHOW STATUS WHERE `variable_name` = 'Threads_connected';
`

>Threads_connected
>
>The number of currently open connections.

### 查看 mysql 变量

`
$ mysqladmin var
`
