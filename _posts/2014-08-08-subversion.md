---
layout: post
title: Subversion 的使用与常见问题
---

###合并主干到分支

    $ pwd
    /home/user/mybranch
    $ svn status # Does not display anything
    $ svn update # Make sure your local copy is up to date.
    Updating '.':
    At revision X.
    $ svn merge url/to/repository/trunk
    Updates, additions, deletions and conflicts.
    $ #handle conflicts.
    $ svn commit -m "Merging changes from the trunk".

###合并分支到主干

与上面相反

###FAQ

####1. 解决冲突

	svn resolve --accept working ./conflict.js

###2. 强行添加所有文件到svn

	svn add --force ./* 

###3. cleanup

    svn cleanup

###4. svn list all conflicts files

    svn status | grep - P '^(?=.{0,6}C)'

###5. 提交
    
    svn commit -m 'commit message'

也可以只提交某一个文件：

    svn commit -m "a file's commit message" <file>

###6. 解决合并冲突

解决以下两种冲突

1. local edit,incoming delete upon update
2. local delete,incoming delete upon update

	$ svn st
	!  +  C foo
		  >   local edit, incoming delete upon update
	!  +  C bar
		  >   local edit, incoming delete upon update
	$ touch foo bar
	$ svn revert foo bar
	$ rm foo bar

from:<http://stackoverflow.com/questions/4317973/svn-how-to-resolve-local-edit-incoming-delete-upon-update-message>
