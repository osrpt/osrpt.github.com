---
layout: post
title: VPS 磁盘扩容并升级服务器
---

如果服务器的磁盘空间不够大了，需要扩容，并且还要迁移原来已有的数据到新的磁盘，本文将解释如何一步一步地操作。

假设原来站点目录在 `/www/sample` 下，需要把 `/www/sample` 移动到新的磁盘中，并且不修改网站代码。

##准备工作

首先当然需要去 VPS 服务商购买一块磁盘。请查看 [Linux 系统挂载数据盘](http://help.aliyun.com/knowledge_detail.htm?spm=5176.788314852.3.1.SnZDUx&knowledgeId=5974154&categoryId=) 大致了解如何挂载。

本文将从挂载磁盘讲起。

###磁盘挂载

磁盘挂载主要需要使用 `mount` 命令。

首先新建一个目录，把新磁盘挂载到这个目录。

由于并不希望该目录占据整个磁盘空间，所以最后我们会建立一个软链接到新目录的某个子目录。

创建目录用于挂载磁盘：

    mkdir /diskc

挂载磁盘：

    mount /dev/xvdc1 /diskc

*如果多次执行 `mount` 命令将磁盘挂载到不同的目录，会导致这几个目录的内容完全一样并且完全同步。*

查看磁盘挂载信息：

    df

如果发现挂载错了，可以使用 `umount` 命令解除：

    umount /wrongDir

显示磁盘信息：

    lsblk | head -8 | expand | column -t

*From: [stackexchange.com](http://unix.stackexchange.com/questions/157154/how-to-list-disk-in-linux)*


##暂停当前服务

###提供升级提醒页面

由于升级维护时间可能较久，所以最好提供一个临时的升级提示页面。

本文假设使用的是 nginx。

编写一个静态的升级页面，放在：/usr/www/upgrade.html。

编辑 nginx 配置文件 `/etc/nginx/nginx.conf`:

nginx 中配置一个临时的站点：upgrading.exacmple.com：

    server {
        listen 80;
        server_name upgrade.example.com;

        location / {
             root /usr/www
             index upgrade.html;
        }
    }

原站点临时跳转到新站点：

    server {
        listen 80;
        server_name www.example.com;

        return 307 http://upgrade.example.com;
    }

使用命令重启 nginx：

    service nginx restart

注意不要使用 `service nginx reload`. reload 的时候如果配置文件有错误，将不会提示。

###停止站点服务

停掉 web 站点服务，防止新的数据产生。

##数据迁移

###创建子目录

创建一个子目录来存放 `/www/sample`：

    mkdir /diskc/sample/

###复制文件

使用 `rsync` 命令同步文件到新目录下：

    rsync -avhW --no-compress --progress /src/ /dst/

解释：

+ -a is for archive, which preserves ownership, permissions etc.
+ -v is for verbose, so I can see what's happening (optional)
+ -h is for human-readable, so the transfer rate and file sizes are easier to read (optional)
+ -W is for copying whole files only, without delta-xfer algorithm which should reduce CPU load
+ --no-compress as there's no lack of bandwidth between local devices
+ --progress so I can see the progress of large files (optional)

*From: [stackoverflow.com](http://serverfault.com/questions/43014/copying-a-large-directory-tree-locally-cp-or-rsync)*

###重命名原目录作为备份

    mv /www/sample /www/sample_bak

###创建软链接

    ln -s /diskc/sample /www/sample

##恢复服务

启动 web 站点，还原 nginx 配置文件，并重启 nginx 服务

检查站点服务是否正常。
