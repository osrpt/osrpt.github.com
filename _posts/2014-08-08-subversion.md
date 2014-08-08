---
layout: post
title: Subversion
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

###FAQ

####1. 解决冲突

	svn resolve --accept working ./conflict.js

###2. 强行添加所有文件到svn

	svn add --force ./* 

###3. cleanup

    svn cleanup
