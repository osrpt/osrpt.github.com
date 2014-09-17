---
layout: post
title: 在 Mysql 中处理多级数据[翻译+整理]
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

![nested_categories.png](/images/post/mysql/nested_categories.png)

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

###查找一个节点的直接子级

假设你需要在一个供应商的网站上显示一个分类下的所有电子产品。
当用户点击一个分类的时候，你需要展示这个分类下的所有产品，也包括分类下的直接子分类，但是不包括这个分类下的所有子分类。
为了达到这个效果，我们需要显示这个节点和它的直接子节点，但是不需要一直往下查找。
例如：当显示 PORTABLE ELECTRONICS 分类的时候，我们希望显示 MP3 PLAYERS, CD PLAYERS 和 2 WAY RADIOS,但是不需要 FLASH。

这里可以通过在我们之前的查询中添加 `HAVING` 判断来很容易地完成：

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
	HAVING depth <= 1
	ORDER BY node.lft;

	+----------------------+-------+
	| name                 | depth |
	+----------------------+-------+
	| PORTABLE ELECTRONICS |     0 |
	| MP3 PLAYERS          |     1 |
	| CD PLAYERS           |     1 |
	| 2 WAY RADIOS         |     1 |
	+----------------------+-------+

如果你不需要父节点，只需要修改 `HAVING depth <= 1` 为 `HAVING depth = 1`。

###嵌套集合中的求总数方法

为了演示求总数方法，让我们添加一张产品表：

	CREATE TABLE product
	(
		product_id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(40),
		category_id INT NOT NULL
	);

	INSERT INTO product(
		name, category_id) 
	VALUES
		('20" TV',3),
		('36" TV',3),
		('Super-LCD 42"',4),
		('Ultra-Plasma 62"',5),
		('Value Plasma 38"',5),
		('Power-MP3 5gb',7),
		('Super-Player 1gb',8),
		('Porta CD',9),
		('CD To go!',9),
		('Family Talk 360',10);

	SELECT * FROM product;

	+------------+-------------------+-------------+
	| product_id | name              | category_id |
	+------------+-------------------+-------------+
	|          1 | 20" TV            |           3 |
	|          2 | 36" TV            |           3 |
	|          3 | Super-LCD 42"     |           4 |
	|          4 | Ultra-Plasma 62"  |           5 |
	|          5 | Value Plasma 38"  |           5 |
	|          6 | Power-MP3 128mb   |           7 |
	|          7 | Super-Shuffle 1gb |           8 |
	|          8 | Porta CD          |           9 |
	|          9 | CD To go!         |           9 |
	|         10 | Family Talk 360   |          10 |
	+------------+-------------------+-------------+

现在让我们来编写一个查询，可以返回分类树和每个分类下的产品数量。

	SELECT parent.name, COUNT(product.name)
	FROM nested_category AS node ,
		nested_category AS parent,
		product
	WHERE node.lft BETWEEN parent.lft AND parent.rgt
		AND node.category_id = product.category_id
	GROUP BY parent.name
	ORDER BY node.lft;

	+----------------------+---------------------+
	| name                 | COUNT(product.name) |
	+----------------------+---------------------+
	| ELECTRONICS          |                  10 |
	| TELEVISIONS          |                   5 |
	| TUBE                 |                   2 |
	| LCD                  |                   1 |
	| PLASMA               |                   2 |
	| PORTABLE ELECTRONICS |                   5 |
	| MP3 PLAYERS          |                   2 |
	| FLASH                |                   1 |
	| CD PLAYERS           |                   2 |
	| 2 WAY RADIOS         |                   1 |
	+----------------------+---------------------+

这是一个典型的完整的树查询，使用了 `COUNT` 和 `GROUP BY`,同时引用了产品表，还在 WHERE 语句中添加了节点表和产品表的 join 。
可以看到，这里每个分类下都有一个数量，并且子类的数量也反应到了父分类中。

###添加节点

我们已经学习了如何查询我们的树，现在是时候来看一下如何通过插入新节点更新我们的树了。
让我们再看一次我们的嵌套集合示意图：

![nested_numbered.png](/images/post/mysql/nested_numbered.png)

如果你想要在 TELEVISIONS 和 PORTABLE ELECTRONICS 这两个节点之间添加一个新节点, 新节点的左值和右值分别应该是 10 和 11, 并且所有右边的节点的左值和右值都应该增加2。
然后我们再使用合适的左值和右值添加新节点。
在 MySQL 5 中，这个可以通过一个存储过程来完成，不过因为最新的稳定版本是 4.1，所以这里我假设大部分读者使用的是 4.1,我将使用包含 `LOCK TABLES` 语句的查询来替代：

	LOCK TABLE nested_category WRITE;

	SELECT @myRight := rgt FROM nested_category
	WHERE name = 'TELEVISIONS';

	UPDATE nested_category SET rgt = rgt + 2 WHERE rgt > @myRight;
	UPDATE nested_category SET lft = lft + 2 WHERE lft > @myRight;

	INSERT INTO nested_category(name, lft, rgt) VALUES('GAME CONSOLES', @myRight + 1, @myRight + 2);

	UNLOCK TABLES;

我们可以使用前面的缩进查询来验证我们的嵌套：

	SELECT CONCAT( REPEAT( ' ', (COUNT(parent.name) - 1) ), node.name) AS name
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
	|  GAME CONSOLES        |
	|  PORTABLE ELECTRONICS |
	|   MP3 PLAYERS         |
	|    FLASH              |
	|   CD PLAYERS          |
	|   2 WAY RADIOS        |
	+-----------------------+

如果我们想在一个当前不存在子元素的节点下添加一个子节点，我们需要稍微修改一下我们的过程。
让我们在 2 WAY RADIOS 节点下面添加一个新节点 FRS：

	LOCK TABLE nested_category WRITE;

	SELECT @myLeft := lft FROM nested_category

	WHERE name = '2 WAY RADIOS';

	UPDATE nested_category SET rgt = rgt + 2 WHERE rgt > @myLeft;
	UPDATE nested_category SET lft = lft + 2 WHERE lft > @myLeft;

	INSERT INTO nested_category(name, lft, rgt) VALUES('FRS', @myLeft + 1, @myLeft + 2);

	UNLOCK TABLES;

在这里，我们把所有在新节点左手边右边的节点挪开，然后把新节点放在左手节点的右边。
可以看到，我们的新节点正确的被嵌套了：

	SELECT CONCAT( REPEAT( ' ', (COUNT(parent.name) - 1) ), node.name) AS name
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
	|  GAME CONSOLES        |
	|  PORTABLE ELECTRONICS |
	|   MP3 PLAYERS         |
	|    FLASH              |
	|   CD PLAYERS          |
	|   2 WAY RADIOS        |
	|    FRS                |
	+-----------------------+

###删除节点

最后一个操作嵌套集合树的基本任务是移除节点。
删除节点的进程取决于节点在树中的等级，删除叶子节点比删除有子元素的节点更加容易，因为这不会造成孤儿节点。

删除叶子节点的过程和添加新节点的相反，我们删除它右边每个节点和它的宽度：

	LOCK TABLE nested_category WRITE;

	SELECT @myLeft := lft, @myRight := rgt, @myWidth := rgt - lft + 1
	FROM nested_category
	WHERE name = 'GAME CONSOLES';

	DELETE FROM nested_category WHERE lft BETWEEN @myLeft AND @myRight;

	UPDATE nested_category SET rgt = rgt - @myWidth WHERE rgt > @myRight;
	UPDATE nested_category SET lft = lft - @myWidth WHERE lft > @myRight;

	UNLOCK TABLES;

再一次，我们查询我们的缩进树来验证我们的节点被正确删除了而且没有破坏层级：

	SELECT CONCAT( REPEAT( ' ', (COUNT(parent.name) - 1) ), node.name) AS name
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
	|    FRS                |
	+-----------------------+

当删除一个元素和它的所有子元素时，这个方法仍然是适用的：

	LOCK TABLE nested_category WRITE;

	SELECT @myLeft := lft, @myRight := rgt, @myWidth := rgt - lft + 1
	FROM nested_category
	WHERE name = 'MP3 PLAYERS';

	DELETE FROM nested_category WHERE lft BETWEEN @myLeft AND @myRight;

	UPDATE nested_category SET rgt = rgt - @myWidth WHERE rgt > @myRight;
	UPDATE nested_category SET lft = lft - @myWidth WHERE lft > @myRight;

	UNLOCK TABLES;

我们仍然再次检查我们是否成功删除整个子树：

	SELECT CONCAT( REPEAT( ' ', (COUNT(parent.name) - 1) ), node.name) AS name
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
	|   CD PLAYERS          |
	|   2 WAY RADIOS        |
	|    FRS                |
	+-----------------------+

还有另外一种可能的场景是，我们只希望删除父节点，但是不删除子节点。
在某些情况下，你可能只是想把名字修改为占位符直到产生了一个新的替代，例如产生了一个主管。
另外有些情况下，所有的子节点向上提升到被删除父级的等级：

	LOCK TABLE nested_category WRITE;

	SELECT @myLeft := lft, @myRight := rgt, @myWidth := rgt - lft + 1
	FROM nested_category
	WHERE name = 'PORTABLE ELECTRONICS';

	DELETE FROM nested_category WHERE lft = @myLeft;

	UPDATE nested_category SET rgt = rgt - 1, lft = lft - 1 WHERE lft BETWEEN @myLeft AND @myRight;
	UPDATE nested_category SET rgt = rgt - 2 WHERE rgt > @myRight;
	UPDATE nested_category SET lft = lft - 2 WHERE lft > @myRight;

	UNLOCK TABLES;

在这个例子中，我们把节点右边的所有元素的值减去2（因为节点没有子元素所以宽度是2），并且所有子元素的值减去1（为了关闭由于父元素左值缺失而引起的缝隙）。
再一次，让我们来验证我们的元素的升级：

	SELECT CONCAT( REPEAT( ' ', (COUNT(parent.name) - 1) ), node.name) AS name
	FROM nested_category AS node,
		nested_category AS parent
	WHERE node.lft BETWEEN parent.lft AND parent.rgt
	GROUP BY node.name
	ORDER BY node.lft;

	+---------------+
	| name          |
	+---------------+
	| ELECTRONICS   |
	|  TELEVISIONS  |
	|   TUBE        |
	|   LCD         |
	|   PLASMA      |
	|  CD PLAYERS   |
	|  2 WAY RADIOS |
	|   FRS         |
	+---------------+

删除节点的其他情况比如提升一个子元素的等级，或把子元素移入到父元素的一个兄弟节点下，为了节省篇幅这篇文章中不再包括这些情况。

###结语

我希望本文中的信息对你有用，SQL 中的嵌套集合概念已经出现 10 多年了，书中和网上都有大量可用的其他信息。
在我看来最全面的关于使用多级信息的资料是一本叫做 [Joe Celko’s Trees and Hierarchies in SQL for Smarties](http://www.openwin.org/mike/books/index.php/trees-and-hierarchies-in-sql) 的书,该书由一名高级 SQL 领域非常受尊重的作者 Joe Celko 写成。
Joe Celko 是一名在使用嵌套集合方面最值得信任并且关于这个主题上是最丰产的作家。
在我的研究中，我发现 Celko 的书的价值无法估量，我强烈推荐。
这本书包含了本文中没有包含的高级主题并且提供了除邻接列表和嵌套集合模型之外更多的方法来管理分级数据。

在下面的引用部分，我列出了一些对你研究管理分级数据可能有用的网络资源，包括两个包含预设 PHP 包来管理 MySQL 中分级数据的 PHP 资源。
你们中的这些现在正在使用邻接列表模型并且想体验嵌套集合模型的可以在下面资源中的 [Storing Hierarchical Data in a Database](http://www.sitepoint.com/article/hierarchical-data-database) 找到示例代码。

###引用

+ [Joe Celko’s Trees and Hierarchies in SQL for Smarties](http://www.openwin.org/mike/books/index.php/trees-and-hierarchies-in-sql) – ISBN 1-55860-920-2
+ [Storing Hierarchical Data in a Database]()
+ [A Look at SQL Trees](http://www.dbmsmag.com/9603d06.html)
+ [SQL Lessons](http://www.dbmsmag.com/9604d06.html)
+ [Nontraditional Databases](http://www.dbmsmag.com/9605d06.html)
+ [Trees in SQL](http://www.intelligententerprise.com/001020/celko.jhtml?_requestid=123193)
+ [Trees in SQL (2)](http://searchdatabase.techtarget.com/tip/1,289483,sid13_gci537290,00.html)
+ [Converting an adjacency list model to a nested set model](http://searchdatabase.techtarget.com/tip/1,289483,sid13_gci801943,00.html)
+ [Nested Sets in PHP Demonstration (German)](http://www.klempert.de/php/nested_sets_demo)
+ [A Nested Set Library in PHP](http://dev.e-taller.net/dbtree/)

From:<http://mikehillyer.com/articles/managing-hierarchical-data-in-mysql/>

##翻译补充

本文主要介绍了如何使用嵌套集合模型来高效简洁地管理多级数据，但是本文中的示意图可能造成难以理解，在浏览 stackoverflow 时无意中发现了一种更好的理解方式：

摘自 stackoverflow ：[php / Mysql best tree structure](http://stackoverflow.com/questions/5916482/php-mysql-best-tree-structure)

掌握嵌套集合模型中的左值右值概念非常困难。我发现如果把这些数字比作一个 XML 文档中开关标签的行号将非常容易理解。

举个例子，使用上文中的数据作为示例：

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

如果把 `lft` 和 `rgt` 这两列取出来，然后作为一个 XML 文档的行号，你将得到：

1. <electronics>
2.    <televisions>
3.        <tube>
4.        </tube>
5.        <lcd>
6.        </lcd>
7.        <plasma>  
8.        </plasma> 
9.     </televisions>
10.    <portable electronics>
11.        <mp3 players>
12.            <flash>
13.            </flash>
14.        </mp3 players>
15.        <cd players>
16.        </cd players>
17.        <2 way radios>
18.        </2 way radios>
19.    </portable electronics>
20. </electronics>

看到了吗，这样就很容易能看出来嵌套集合多级结构了。这里同样可以很清晰地看出来为什么这种方式可以搞笑的选择整个节点而不需要多次查询或者 join 了。
