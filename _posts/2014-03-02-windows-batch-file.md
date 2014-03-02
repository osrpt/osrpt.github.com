---
layout: post
title: 简单的Windows批处理文件
---
###常用的命令：

1. `@` 让执行窗口中不显示后面这一行命令本身
2. `echo`

		`echo off` 关闭回显，直到echo on
		`echo on` 打开回显
		`echo 命令` 显示该命令的信息
		`echo` 可以编辑文本文件

3. `::` 注释
4. `pause` 暂停:暂停当前程序，显示一行信息：请按任意键继续...
5. `: label` 添加标签
6. `goto label`:跳转到标签
7. `%` 批处理中的参数
8. `if`

	1. 输入判断 `if "%1"=="a" goto labela`
	2. 存在判断 `if exist C:\test.txt del C:\test.txt` 也可以用`if not exist`
	3. 结果判断 `if errorlevel 1 pause & edit %1.asm` 如果有错误就编辑%1.asm

9. `call` 调用其它的bat脚本 `call text.bat xxx`使用xxx参数调用text.bat脚本
10. `find` 搜索命令

	    @echo off  
	    netstat -a -n > a.txt  
	    type a.txt | find "7626" && echo "Congratulations! You have infected GLACIER!"  
	    del a.txt  
	    pause & exit  

11. `for`、`set`、`shift`

	    @echo off  
	    for /? > for.txt  
	    set /? > set.txt  
	    shift /? >shift.txt  
	    exit

12. `rmdir` 删除目录，`rmdir /s /q`直接删除目录，不需要确认
13. `mkdir` 创建一个目录
14. `xcopy` 复制

	常用参数：
	
	* '/e' 表示复制所有子目录，包括空目录
	* '/y' 确认覆盖

> 官方文档：
> <http://www.microsoft.com/resources/documentation/windows/xp/all/proddocs/en-us/xcopy.mspx?mfr=true>

###示例1：iNote插件发布

	@echo off

	::chrome publish
	rmdir chrome /s /q
	mkdir chrome

	cd chrome

	xcopy F:\Code\Svn\inoteapp\css\* %cd%\iNote\css\ /EY
	xcopy F:\Code\Svn\inoteapp\image\* %cd%\iNote\image\ /EY
	xcopy F:\Code\Svn\inoteapp\js\* %cd%\iNote\js\ /EY
	xcopy F:\Code\Svn\inoteapp\plugins\* %cd%\iNote\plugins\ /EY
	xcopy F:\Code\Svn\inoteapp\views\* %cd%\iNote\views\ /EY

	xcopy F:\Code\Svn\inoteapp\index.html %cd%\iNote /Y
	xcopy F:\Code\Svn\inoteapp\manifest.json %cd%\iNote /Y

	@echo 'files have be copied,click any key to continue'
	pause

	f:\7zip\7za.exe a iNote.zip iNote\*

	"F:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --pack-extension=%cd%\iNote --pack-extension-key=F:\Code\Svn\inoteapp\iNoteApp.pem

	::360 publish
	cd F:\Code\Svn\inoteapp\deploy\360

	del *.zip
	del *.crx

	xcopy F:\Code\Svn\inoteapp\deploy\chrome\iNote.crx /Y

	f:\7zip\7za.exe a iNote.zip *

	::clean file
	del *.crx
	del F:\Code\Svn\inoteapp\deploy\chrome\iNote.crx
	rmdir F:\Code\Svn\inoteapp\deploy\chrome\iNote /s /q

###示例2：iNote桌面程序发布
	@echo off

	rmdir pcApp /s /q
	mkdir pcApp

	cd pcAPP

	xcopy F:\Code\Svn\inoteapp\css\* %cd%\css\ /EY
	xcopy F:\Code\Svn\inoteapp\image\* %cd%\image\ /EY
	xcopy F:\Code\Svn\inoteapp\js\* %cd%\js\ /EY
	xcopy F:\Code\Svn\inoteapp\plugins\* %cd%\plugins\ /EY
	xcopy F:\Code\Svn\inoteapp\views\* %cd%\views\ /EY

	xcopy F:\Code\Svn\inoteapp\index.html /Y
	xcopy F:\Code\Svn\inoteapp\ffmpegsumo.dll /Y
	xcopy F:\Code\Svn\inoteapp\icudt.dll /Y
	xcopy F:\Code\Svn\inoteapp\iNoteManager.exe /Y
	xcopy F:\Code\Svn\inoteapp\libEGL.dll /Y
	xcopy F:\Code\Svn\inoteapp\libGLESv2.dll /Y
	xcopy F:\Code\Svn\inoteapp\nw.pak /Y
	xcopy F:\Code\Svn\inoteapp\iNote.exe /Y
	xcopy F:\Code\Svn\inoteapp\iNoteHook.dll /Y
	xcopy F:\Code\Svn\inoteapp\package.json /Y

	@echo 'please edit file before compress'
	@pause

	@echo 'are you sure?'
	@pause

	f:\7zip\7za.exe a app.zip %cd%\css\
	f:\7zip\7za.exe a app.zip %cd%\image\
	f:\7zip\7za.exe a app.zip %cd%\js\
	f:\7zip\7za.exe a app.zip %cd%\plugins\
	f:\7zip\7za.exe a app.zip %cd%\views\

	f:\7zip\7za.exe a app.zip index.html
	f:\7zip\7za.exe a app.zip package.json

	rmdir css /s /q
	rmdir image /s /q
	rmdir js /s /q
	rmdir plugins /s /q
	rmdir views /s /q

	del index.html
	del package.json

	ren app.zip app.nw
	copy /b iNoteManager.exe+app.nw iNoteManager.exe

	del app.nw

*[see more&#10548;](http://www.cnblogs.com/smwikipedia/archive/2009/03/30/1424735.html)*