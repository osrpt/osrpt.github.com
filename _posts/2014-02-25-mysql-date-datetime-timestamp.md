---
layout: post
title: MySQL数据类型：DATE,DATETIME,TIMESTAMP
tags:
- mysql
- time
- date
---

### DATE
`DATE`类型只有日期部分，没有时间部分。MySQL使用`YYYY-MM-DD`格式检索和显示`DATE`类型，取值范围为：`1000-01-01` 到 `9999-12-31`

### DATETIME
`DATETIME`类型包含了日期部分和时间部分。MySQL使用`YYYY-MM-DD HH:MM:SS`格式来检索和显示`DATETIME`类型。取值范围为：`1000-01-01 00:00:00` 到 `9999-12-31 23:59:59`

### TIMESTAMP
`TIMESTAMP`类型包含了日期部分和时间部分。取值范围：`1970-01-01 00:00:01`UTC 到 `2038-01-19 03:14:07`UTC。

MYSQL在处理`TIMESTAMP`类型时会对时区进行转换，存储时先将当前时区转换为UTC时区，检索时先转换为当前时区再显示。

另外，`TIMESTAMP`还提供了一个自动初始化和自动更新的方法：

        CREATE TABLE t1 (
          ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

*[see more&#10548;](http://dev.mysql.com/doc/refman/5.0/en/timestamp-initialization.html)*

### 精度
DATETIME和TIMESTAMP都可以包含一个小数点后6位小数的微秒精度，但是这部分在存储的时候会被丢弃。

*[see more&#10548;](http://dev.mysql.com/doc/refman/5.0/en/fractional-seconds.html)*

### 非法值的处理
1. 非法的值存储的时候都会被转换为`零值`。
2. 任何标点符号都可以被用来作为日期时间中的间隔符，比如当向DATE类型中存储`10:11:12`时，表示`2010-11-12`;`10:45:15`转换为`0000-00-00`因为45不是有效的月份。
3. MySQL要求合法的时间。比如`2014-2-30`,如果`strict mode`被禁用，该值被转换为`0000-00-00`并且产生一条警告，如果启用`strict mode`，会产生一个异常。*如何插入非法值[see more&#10548;](http://dev.mysql.com/doc/refman/5.0/en/server-sql-mode.html#sqlmode_allow_invalid_dates)*
4. TIMESTAMP不接受日期，月份为0以及其他的非法时间，唯一的厉害是`zero value:0000-00-00 00:00:00`
5. 只有两位的年份是模棱两可的，按照以下规则转换：
    * 年份值在`00-69`转换为`2000-2069`
    * 年份值在`70-99`转换为`1970-1999`

from: [官方文档](http://dev.mysql.com/doc/refman/5.0/en/datetime.html)
