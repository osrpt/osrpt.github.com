---
layout: post
title: shell脚本入门
---
###任务
编写一个shell脚本，完成站点发布工作。

1. 发布前，清理`/srv/mockup`下面的所有文件
2. zip文件传输完成后，自动解压文件
3. 将config文件替换掉
4. 自动运行所有`nodeunit`测试文件
4. 重新启动`forever`的所有站点
5. 重启nginx服务
6. 脚本加入命令，以命令的方式运行

###Shell Scripts:

		if [ $1 = "-b" ]; then
			rm -rf /srv/mockup/*
			echo 'before deploy'
		else 
			if [ $1 = "-a" ];	then
				cd /srv/mockup/
				unzip mockup-b.zip
				yes | cp /srv/config.js /srv/mockup/
				forever restart 0
				forever restart 1
				forever restart 2
				service nginx reload
				echo 'finish  deploy'
			else
				echo '-a:after upload files;-b:before upload files'
			fi
		fi
		exit 0

