---
layout: post
title: python发布脚本的编写
tags:
- python
- scripts
- publish
---

python比bat更加强大，灵活性更高，所以更适合做自动化脚本。

###移除目录中的所有文件
####method 1

    import os
    import shutil

    allContents=[os.path.join(targetFolder,tmp) for tmp in os.listdir(targetFolder)]
    [shutil.rmtree(tmp) if os.path.isdir(tmp) else os.unlink(tmp) for tmp in allContents]

####method 2

    import os
    import shutil

    for root, dirs, files in os.walk(targetFolder):
        for f in files:
            os.unlink(os.path.join(root, f))
        for d in dirs:
            shutil.rmtree(os.path.join(root, d))

####method 3

    import os 
    targetFolder = '/path/to/targetFolder'
    for the_file in os.listdir(targetFolder):
        file_path = os.path.join(targetFolder, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception, e:
            print e

###zip压缩文件

        def compress(dir,zipPath):
            if path.exists(zipPath):
                os.unlink(zipPath)
            with zipfile.ZipFile(zipPath,'w') as zip:
                for dirpath,dirs,files in os.walk(dir):
                    for f in files:
                        zip.write(path.join(dirpath,f),path.join(dirpath,f).replace(dir,'')) #为了保持原来的目录结构

###文件中替换

        import re

        def replaceInFile(filePath,replacements):
            infile=open(filePath)
            outfile=open(filePath)
            for line in infile:
                for src,target in replacements.iteritems():
                    line=re.sub(src,target,line)
                outfile.write(line)
            infile.close()
            outfile.close()

###常用的文件操作

1. `os.unlink(filePath)` 删除filePath这个文件
2. `shutil.rmtree(dirPath)` 删除目录
3. 'path.exists(filePath)' 文件是否存在
4. `path.isdir(dir)` 检查目录是否存在
5. `os.mkdir(dir)` 创建目录
6. `shutil.copytree(srcDir,destDir)` 复制目录
7. `shutil.copy2(srcFile,destFile)` 复制文件