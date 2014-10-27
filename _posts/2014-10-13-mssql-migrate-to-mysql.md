---
layout: post
title: SQL Server 迁移到 MySQL
---

MSSQL 数据迁移到 MySQL 中有多种方案， MySQL 提供的工具 [MySQL Workbench](http://www.mysql.com/products/workbench/) 包含了数据迁移的功能。
如果可以，应该优先选用这个工具。

由于我的迁移中只需要用到部分表的部分数据，有些还需要针对数据进行单独的处理，所以这个工具并不适用。
整个迁移过程中最麻烦的问题就是中文的乱码问题，需要特别注意。

##表结构

###自增

MSSQL 中自增是 `IDENTITY`，MYSQL 中是 AUTO_INCREMENT

MSSQL 中的：

    CREATE TABLE test(
        id INT PRIMARY KEY IDENTITY(10000, 1)
    )

等价于 MYSQL 中的：

    CREATE TABLE test(
        id INT PRIMARY KEY AUTO_INCREMENT
    ) AUTO_INCREMENT = 10000

如果建表时忘记修改自增的起始值，也可以执行一下语句：

    ALTER TABLE test AUTO_INCREMENT = 10000

注意：

1. 建议在迁移过程中，把 MYSQL 中的自增起始值设置的比原来的表自增列最大值大一个数量级。这样防止主键被占用。
2. 如果需要修改自增步长为大于 1 的值，可以在服务器运行 `SET @@auto_increment_increment=2`，但是这样会影响所有表！

###数据类型

##准备

我主要使用 python 来进行处理。

###pymssql

pymssql 用于连接 MSSQL 处理数据导出。这是一个第三方的库，需要自己安装。

###MySQLdb

MySQLdb 用于处理数据导入的问题，这个库需要自己下载安装。

CentOs:

    yum install MySQL-python

Mac OS X(需要自己先安装brew):

    brew install MySQL-python

MySQLdb 这个库安装容易出错，网上有很多关于解决安装中遇到问题的文章，这里不再详细讨论。

如果数据中包含 unicode 编码的数据，请按照下面的方式执行，否则可能遇到编码问题：

    import MySQLdb as mdb

    conn = mdb.connect()
    conn.set_character_set('utf8')
    
    cursor = conn.cursor()
    cursor.execute('SET NAMES utf8;')
    cursor.execute('SET CHARACTER SET UTF8;')
    cursor.execute('SET character_set_connection=utf8;')

###导出到 csv 文件, 然后使用 python 导入

SQL Server 导入导出工具可以根据查询导出 csv 文件，也可以直接将查询结果另存为为 csv 文件。
然后在 python 中使用 csv 模块导入：

    import csv

    def unicode_csv_reader(utf8_data):
        csv_reader = csv.reader(utf8_data, dialect=csv.excel)
        for row in csv_reader:
            yield [unicode(cell, 'utf-8').strip() for cell in row]

    def import_data(csv_file_path):
        reader = unicode_csv_reader(open(csv_file_path))
        for row in reader:
            // 执行导入

如果数据中包含了 csv 分隔符则可能导致异常情况，可以增加判断或者 try...except... 来捕获失败的行，记录下来单独处理。

###使用 pickle 序列化和反序列化

导出数据：

    import pymssql

    mssql = {'host': '.', 'user':'user', 'pwd':'123', 'db':'db'}

    def export_data():
        conn = pymssql.connect(host=mssql.host, user=mssql.user, password=mssql.pwd, database=mssql.db, charset='utf-8') //连接数据库, 自己添加数据库信息
        cursor = conn.cursor()
        sql = "select id, email, password from user where id > %d"
        cursor.execute(sql, (10000,))
        data = cursor.fetchall()

        with open('data.dat', 'w') as f:
            pickle.dump(data, f)

        conn.close()

导入数据：

    import MySQLdb as mdb

    mysql = {'host': 'localhost', 'user': 'root', 'pwd': '', 'db': 'test'}

    def import_data():
        conn = mdb.connect(host=mysql.host, user=mysql.user, passwd=mysql.pwd, db=mysql.db)
        conn.set_character_set('utf8')
        cursor = conn.cursor()
        cursor.execute('SET NAMES utf8;')
        cursor.execute('SET CHARACTER SET UTF8;')
        cursor.execute('SET character_set_connection=utf8;')

        sql = 'INSERT INTO user(id, email, password) VALUES(%s, %s, %s)'

        with open('data.dat', 'rU') as f:
            data = pickle.load(f)

            for row in data:
                cursor.execute(sql, (row[0], row[1], row[2]))

        conn.commit()
        conn.close()

###注意

如果导出的数据库中有时间格式的数据，pymssql 将自动转换为 datetime 格式，这时候如果序列化之后直接读取将会报异常，提示找不到 datetime 这个包。
这是因为反序列化的时候也需要反序列化出 datetime 类型，之前没有 import 过，所以反序列化会出错。
在导出的时候可以将 datetime 类型转成字符串，这样就不会出错了，也不会影响导入。

例如：

    def normalize_data(result):
        data = []
        for row in result:
            newRow = (row[0], row[1], row[2], unicode(row[3]))
            data.append(newRow)
        return data


如果原来 MSSQL 中数据类型为 varchar 但是又包含了中文字符，导出之后将是乱码。可以先修改为 nvarchar 之后再导出，就不会乱码了。

    ALTER TABLE table_name
    ALTER COLUMN col_name NVARCHAR(100)

###引用

1. [MySQL Workbench](http://www.mysql.com/products/workbench/)
