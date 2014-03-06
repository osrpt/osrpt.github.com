---
layout: post
title: python移除目录下的所有内容
---
###method 1

    import os
    import shutil

    allContents=[os.path.join(targetFolder,tmp) for tmp in os.listdir(targetFolder)]
    [shutil.rmtree(tmp) if os.path.isdir(tmp) else os.unlink(tmp) for tmp in allContents]

###method 2

    import os
    import shutil

    for root, dirs, files in os.walk(targetFolder):
        for f in files:
            os.unlink(os.path.join(root, f))
        for d in dirs:
            shutil.rmtree(os.path.join(root, d))

###method 3

    import os 
    targetFolder = '/path/to/targetFolder'
    for the_file in os.listdir(targetFolder):
        file_path = os.path.join(targetFolder, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception, e:
            print e