---
layout: post
title: Mysql Tips
tags:
- mysql
- tips
---

###记录每一个查询语句

先查看文件位置：

    mysql> SHOW VARIABLES LIKE "general_log%";

    +------------------+----------------------------+
    | Variable_name    | Value                      |
    +------------------+----------------------------+
    | general_log      | OFF                        |
    | general_log_file | /var/run/mysqld/mysqld.log |
    +------------------+----------------------------+

开启记录：

    mysql>SET GLOBAL general_log = 'ON';

查看记录：

    tail -f -n100 /var/run/mysqld/mysqld.log

最后别忘了要关闭记录：

    SET GLOBAL general_log = 'OFF';

FROM: <http://stackoverflow.com/a/7470567/1778658>

### 查看连接信息

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

这里的 Connections 指的是所有的连接总数：

>Connections
>
>The number of connection attempts (successful or not) to the MySQL server.

FROM: <http://alvinalexander.com/blog/post/mysql/how-show-open-database-connections-mysql>

### 查看进程信息

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

### mysql 状态

    $ mysqladmin status

### 查看正在连接的进程信息

    mysql>SHOW STATUS WHERE `variable_name` = 'Threads_connected';

>Threads_connected
>
>The number of currently open connections.

### 查看 mysql 变量

    $ mysqladmin var

### 查看给某个用户的授权信息

    >show grant [for user];

### Mysql Socket 连接失败

如果在程序中配置使用 `localhost`，这样是通过 socket 进行连接，连接失败时有可能是因为 socket 位置不正确，可以检查 mysql 配置文件（例如 `/etc/my.cnf`）中的 socket 配置。

例如配置为：

```
[client]
port›   ›   = 3306
socket› ›   = /tmp/mysql.sock
```

可以在程序中使用：`localhost:/tmp/mysql.sock` 作为 host 配置。

### Show Index

```
SHOW INDEX FROM TABLE_A
```

### Create Index

```
CREATE INDEX part_of_name ON customer (name(10));
```

### Drop Index

```
ALTER TABLE TABLE_A DROP INDEX keywords;
```
