---
layout: post
title: 在 Mysql 中处理多级数据[译]
---

##简介

大多数开发者都或多或少在数据库中处理过多级数据并且无疑认识到了关系数据库不是为处理多级数据设计的。
关系数据库的表不是多级的（例如 XML），而是简单的扁平的列表。多级数据有父级和子级，这不是自然的关系数据库表中的表示方式。

对我们来说，多级数据是一组数据，其中每项都至少有一个父亲和 0 个或多个孩子（根元素较为特殊，没有父亲）。
多级数据大量存在于数据库应用中，包括论坛、邮件列表、公司组织表、内容分类管理、产品分类等。
为了说明，我将使用下面的虚拟的电子产品商店的产品分类管理结构：

![categories.png](/images/post/mysql/categories.png)

这些分类组成了一个跟上面说的其他例子相似的结构。在这片文章中我们将会在 MySQL 中考察使用两种模型来处理多级数据，首先介绍传统的邻接列表模型。

##邻接列表模型

典型地，上面图中的示例分类将存在一个如下结构的表中（我同时附上了 CREATE 和 INSERT 语句以让你可以直接执行）：

	CREATE TABLE category(
		category_id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(20) NOT NULL,
		parent INT DEFAULT NULL
	);

	INSERT INTO category 
	VALUES
		(1,'ELECTRONICS',NULL),
		(2,'TELEVISIONS',1),
		(3,'TUBE',2),
		(4,'LCD',2),
		(5,'PLASMA',2),
		(6,'PORTABLE ELECTRONICS',1),
		(7,'MP3 PLAYERS',6),
		(8,'FLASH',7),
		(9,'CD PLAYERS',6),
		(10,'2 WAY RADIOS',6);

	SELECT * FROM category ORDER BY category_id;

	+-------------+----------------------+--------+
	| category_id | name                 | parent |
	+-------------+----------------------+--------+
	|           1 | ELECTRONICS          |   NULL |
	|           2 | TELEVISIONS          |      1 |
	|           3 | TUBE                 |      2 |
	|           4 | LCD                  |      2 |
	|           5 | PLASMA               |      2 |
	|           6 | PORTABLE ELECTRONICS |      1 |
	|           7 | MP3 PLAYERS          |      6 |
	|           8 | FLASH                |      7 |
	|           9 | CD PLAYERS           |      6 |
	|          10 | 2 WAY RADIOS         |      6 |
	+-------------+----------------------+--------+
	10 rows in set (0.00 sec)

在邻接列表模型中，表中的每一项都包含了一个指向父亲的指针。最顶部的元素，在这里就是 *ELECTRONICS* ,用 NULL 表示它的父亲。
邻接模型的好处是非常的直接简单，很容易看出 *FLASH* 是 *MP3 PLAYER* 的子元素，而它又是 *ELECTRONICS* 的子元素。
在客户端中可以很简单地处理邻接模型，但是完全使用 SQL 处理会较为困难。

###返回整棵树

处理多级数据的第一个通常的任务是返回整棵树，通常是使用一些带缩进的表来表示。最通常的完全使用 SQL 的方式是通过 self-join :

	SELECT t1.name AS lev1, t2.name as lev2, t3.name as lev3, t4.name as lev4
	FROM category AS t1
	LEFT JOIN category AS t2 ON t2.parent = t1.category_id
	LEFT JOIN category AS t3 ON t3.parent = t2.category_id
	LEFT JOIN category AS t4 ON t4.parent = t3.category_id
	WHERE t1.name = 'ELECTRONICS';

	+-------------+----------------------+--------------+-------+
	| lev1        | lev2                 | lev3         | lev4  |
	+-------------+----------------------+--------------+-------+
	| ELECTRONICS | TELEVISIONS          | TUBE         | NULL  |
	| ELECTRONICS | TELEVISIONS          | LCD          | NULL  |
	| ELECTRONICS | TELEVISIONS          | PLASMA       | NULL  |
	| ELECTRONICS | PORTABLE ELECTRONICS | MP3 PLAYERS  | FLASH |
	| ELECTRONICS | PORTABLE ELECTRONICS | CD PLAYERS   | NULL  |
	| ELECTRONICS | PORTABLE ELECTRONICS | 2 WAY RADIOS | NULL  |
	+-------------+----------------------+--------------+-------+
	6 rows in set (0.00 sec)

###获取所有的叶节点

可以使用 LEFT JOIN 查询来获取树中的所有叶节点（没有子节点）：

	SELECT t1.name FROM
	category AS t1 LEFT JOIN category as t2
	ON t1.category_id = t2.parent
	WHERE t2.category_id IS NULL;

	+--------------+
	| name         |
	+--------------+
	| TUBE         |
	| LCD          |
	| PLASMA       |
	| FLASH        |
	| CD PLAYERS   |
	| 2 WAY RADIOS |
	+--------------+

###获取单个路径

self-join 同样允许我们获取树中的完整路径：

	SELECT t1.name AS lev1, t2.name as lev2, t3.name as lev3, t4.name as lev4
	FROM category AS t1
	LEFT JOIN category AS t2 ON t2.parent = t1.category_id
	LEFT JOIN category AS t3 ON t3.parent = t2.category_id
	LEFT JOIN category AS t4 ON t4.parent = t3.category_id
	WHERE t1.name = 'ELECTRONICS' AND t4.name = 'FLASH';

	+-------------+----------------------+-------------+-------+
	| lev1        | lev2                 | lev3        | lev4  |
	+-------------+----------------------+-------------+-------+
	| ELECTRONICS | PORTABLE ELECTRONICS | MP3 PLAYERS | FLASH |
	+-------------+----------------------+-------------+-------+
	1 row in set (0.01 sec)

这种方式的最大的限制是你必须在多级数据的每一级都使用一个 self-join，由于没一级都使用了 join ,复杂情况下优化将非常困难。

###使用邻接列表模型的限制

使用纯 SQL 操作多级数据会非常复杂。在获取一个分类的完整路径之前，我们必须知道它在哪一层。
并且，删除节点时要尤其小心可能造成孤儿节点（删除 PORTABLE ELECTRONICS 分类将导致它的子节点全部变成孤儿 ）。
有些缺陷可以通过使用客户端代码或者存储过程来处理。我们可以在程序中从根节点开始然后向上迭代返回整棵树或者一个单独的路径。
我们也可以使用程序来删除节点，通过提升子元素和重新排序剩下的子元素来指向新父节点，这样就不会让子树变为孤儿。

##嵌套集合模型

这篇文章中我主要想集中精力讲述另外一种不同的方式，通常叫做嵌套集合模型(Nested Set Model)。
在嵌套集合模型中，我们可以使用一种新的方式来审视我们的多级数据，不是使用节点和线条，而是使用嵌套的容器。尝试像下面这样画出我们的电器分类图：

![nested_categories.png](images/post/mysql/nested_categories.png)

注意我们的树是怎样维护的：父类包裹了子类。我们使用左值和右值来代表我们的节点嵌套，这样就组成了我们的多级数据表：

	CREATE TABLE nested_category (
		category_id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(20) NOT NULL,
		lft INT NOT NULL,
		rgt INT NOT NULL
	);

	INSERT INTO nested_category 
	VALUES
		(1,'ELECTRONICS',1,20),
		(2,'TELEVISIONS',2,9),
		(3,'TUBE',3,4),
		(4,'LCD',5,6),
		(5,'PLASMA',7,8),
		(6,'PORTABLE ELECTRONICS',10,19),
		(7,'MP3 PLAYERS',11,14),
		(8,'FLASH',12,13),
		(9,'CD PLAYERS',15,16),
		(10,'2 WAY RADIOS',17,18);

	SELECT * FROM nested_category ORDER BY category_id;

	+-------------+----------------------+-----+-----+
	| category_id | name                 | lft | rgt |
	+-------------+----------------------+-----+-----+
	|           1 | ELECTRONICS          |   1 |  20 |
	|           2 | TELEVISIONS          |   2 |   9 |
	|           3 | TUBE                 |   3 |   4 |
	|           4 | LCD                  |   5 |   6 |
	|           5 | PLASMA               |   7 |   8 |
	|           6 | PORTABLE ELECTRONICS |  10 |  19 |
	|           7 | MP3 PLAYERS          |  11 |  14 |
	|           8 | FLASH                |  12 |  13 |
	|           9 | CD PLAYERS           |  15 |  16 |
	|          10 | 2 WAY RADIOS         |  17 |  18 |
	+-------------+----------------------+-----+-----+

我们这里使用 `lft` 和 `rgt` 是因为 `left` 和 `right` 是 MySQL 中的保留字，查看：<http://dev.mysql.com/doc/mysql/en/reserved-words.html> 获得完整的关键字列表。

但是，我们怎么确定我们的左值和右值的呢？我们从我们最外围节点的最左边开始计算直到最右边：

![nested_numbered.png](/images/post/mysql/nested_numbered.png)

这种设计也可以应用于典型的树状结构：

![numbered_tree.png](/images/post/mysql/numbered_tree.png)

当在树上进行时，我们从左到右开始计算，每次一层，先计算完每个节点的所有子节点然后再计算右值，直到最右边。
这个方法叫做：**modified preorder tree traversal algorithm**。

###返回整棵树

我们可以使用一个子节点的左值使用是在它的父节点的左值和右值之间这个原理，然后使用 self-join 来把子节点和父节点连接起来：

	SELECT node.name
	FROM nested_category AS node,
			nested_category AS parent
	WHERE node.lft BETWEEN parent.lft AND parent.rgt
			AND parent.name = 'ELECTRONICS'
	ORDER BY node.lft;

	+----------------------+
	| name                 |
	+----------------------+
	| ELECTRONICS          |
	| TELEVISIONS          |
	| TUBE                 |
	| LCD                  |
	| PLASMA               |
	| PORTABLE ELECTRONICS |
	| MP3 PLAYERS          |
	| FLASH                |
	| CD PLAYERS           |
	| 2 WAY RADIOS         |
	+----------------------+

和上文中使用邻接列表模型不一样的地方在于，这个查询将不需要考虑树的深度。
在 *BETWEEN* 中我们不需要关注节点的右值是因为右值会跟左值一起落在同一个父节点下。

###查询所有的叶节点

在嵌套集合模型中查找所有的叶节点要比在邻接列表模型中使用的 LEFT JOIN 简单。
如果你仔细观察 nested_categories 表，你可能已经注意到叶节点的左值和右值是连续的数字。
所以为了找出所有的叶节点，我们只需要查找所有 rgt=lft+1 的节点。

	SELECT name
	FROM nested_category
	WHERE rgt = lft + 1;

	+--------------+
	| name         |
	+--------------+
	| TUBE         |
	| LCD          |
	| PLASMA       |
	| FLASH        |
	| CD PLAYERS   |
	| 2 WAY RADIOS |
	+--------------+

###返回单独的一个路径

使用嵌套集合模型，我们不需要那么多的 self-join 就可以返回一个单独的路径：

	SELECT parent.name
	FROM nested_category AS node,
			nested_category AS parent
	WHERE node.lft BETWEEN parent.lft AND parent.rgt
			AND node.name = 'FLASH'
	ORDER BY node.lft;

	+----------------------+
	| name                 |
	+----------------------+
	| ELECTRONICS          |
	| PORTABLE ELECTRONICS |
	| MP3 PLAYERS          |
	| FLASH                |
	+----------------------+

###找到节点的深度

我们已经看了怎样显示整棵树，但是如果我们想显示树上的每个节点的深度来更好的了解树上的每个节点的层级结构？
这可以通过添加一个 COUNT 方法和一个 GROUP BY 条件到我们的呈现整棵树的查询中来实现：

	SELECT node.name, (COUNT(parent.name) - 1) AS depth
	FROM nested_category AS node,
			nested_category AS parent
	WHERE node.lft BETWEEN parent.lft AND parent.rgt
	GROUP BY node.name
	ORDER BY node.lft;

	+----------------------+-------+
	| name                 | depth |
	+----------------------+-------+
	| ELECTRONICS          |     0 |
	| TELEVISIONS          |     1 |
	| TUBE                 |     2 |
	| LCD                  |     2 |
	| PLASMA               |     2 |
	| PORTABLE ELECTRONICS |     1 |
	| MP3 PLAYERS          |     2 |
	| FLASH                |     3 |
	| CD PLAYERS           |     2 |
	| 2 WAY RADIOS         |     2 |
	+----------------------+-------+

我们可以使用深度值结合  CONCAT 和 REPEAT 方法来缩进我们分类名称：

	SELECT CONCAT( REPEAT(' ', COUNT(parent.name) - 1), node.name) AS name
	FROM nested_category AS node,
			nested_category AS parent
	WHERE node.lft BETWEEN parent.lft AND parent.rgt
	GROUP BY node.name
	ORDER BY node.lft;

	+-----------------------+
	| name                  |
	+-----------------------+
	| ELECTRONICS           |
	|  TELEVISIONS          |
	|   TUBE                |
	|   LCD                 |
	|   PLASMA              |
	|  PORTABLE ELECTRONICS |
	|   MP3 PLAYERS         |
	|    FLASH              |
	|   CD PLAYERS          |
	|   2 WAY RADIOS        |
	+-----------------------+

当然，在客户端程序中，我们可能更喜欢使用深度值来直接显示多级结构。
Web 开发者可以循环整棵树，随着深度值的增减来添加 <li></li> 和 <ul></ul> 标签。

###子树的深度

当我们需要一个子树的深度值，我们不能在 self-join 中限制节点或者父节点表因为它将影响我们的结果。
替代的方式是，我们添加第三个 self-join, 它包含了一个确定深度的子查询，这个就是我们的子树的起点。


	SELECT node.name, (COUNT(parent.name) - (sub_tree.depth + 1)) AS depth
	FROM nested_category AS node,
			nested_category AS parent,
			nested_category AS sub_parent,
			(
					SELECT node.name, (COUNT(parent.name) - 1) AS depth
					FROM nested_category AS node,
					nested_category AS parent
					WHERE node.lft BETWEEN parent.lft AND parent.rgt
					AND node.name = 'PORTABLE ELECTRONICS'
					GROUP BY node.name
					ORDER BY node.lft
			)AS sub_tree
	WHERE node.lft BETWEEN parent.lft AND parent.rgt
			AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt
			AND sub_parent.name = sub_tree.name
	GROUP BY node.name
	ORDER BY node.lft;

	+----------------------+-------+
	| name                 | depth |
	+----------------------+-------+
	| PORTABLE ELECTRONICS |     0 |
	| MP3 PLAYERS          |     1 |
	| FLASH                |     2 |
	| CD PLAYERS           |     1 |
	| 2 WAY RADIOS         |     1 |
	+----------------------+-------+

这个方法可以用于任何节点名称，甚至包括根节点。深度值始终是相对于给定的节点。

###查找节点的

From:<http://mikehillyer.com/articles/managing-hierarchical-data-in-mysql/>
