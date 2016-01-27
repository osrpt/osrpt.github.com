---
layout: post
title: 在 CentOS 6 上设置 supervisor
tags:
- server
- vps
- python
- supervisor
---

### 安装包

    sudo yum install python-setuptools
    sudo easy_install pip
    sudo pip install supervisor

如果使用的时候提示错误 `pkg_resources.DistributionNotFound: meld3>=0.6.5`，手动安装 `meld3` 就好了：

    git clone https://github.com/Supervisor/meld3
    cd meld3
    python setup.py install

### service

/etc/init.d/supervisord

    #!/bin/bash
    #
    # supervisord   This scripts turns supervisord on
    #
    # Author:       Mike McGrath <mmcgrath@redhat.com> (based off yumupdatesd)
    #
    # chkconfig:    - 95 04
    #
    # description:  supervisor is a process control utility.  It has a web based
    #               xmlrpc interface as well as a few other nifty features.
    # processname:  supervisord
    # config: /etc/supervisord.conf
    # pidfile: /var/run/supervisord.pid
    #

    # source function library
    . /etc/rc.d/init.d/functions

    RETVAL=0

    start() {
            echo -n $"Starting supervisord: "
            daemon supervisord
            RETVAL=$?
            echo
            [ $RETVAL -eq 0 ] && touch /var/lock/subsys/supervisord
    }

    stop() {
            echo -n $"Stopping supervisord: "
            killproc supervisord
            echo
            [ $RETVAL -eq 0 ] && rm -f /var/lock/subsys/supervisord
    }

    restart() {
            stop
            start
    }

    case "$1" in
      start)
            start
            ;;
      stop)
            stop
            ;;
      restart|force-reload|reload)
            restart
            ;;
      condrestart)
            [ -f /var/lock/subsys/supervisord ] && restart
            ;;
      status)
            status supervisord
            RETVAL=$?
            ;;
      *)
            echo $"Usage: $0 {start|stop|status|restart|reload|force-reload|condrestart}"
            exit 1
    esac

    exit $RETVAL

### 错误处理

无法启动，提示：

>Error: Another program is already listening on a port that one of our HTTP servers is configured to use.  Shut this program down first before starting supervisord.
>For help, use /usr/bin/supervisord -h

说明另外已经启动了一个进程，需要先停止。

查询 supervisord PID:

    ps -ef | grep supervisord

停止进程:

    kill -s SIGTERM <PID>


### Reference

1. <https://rayed.com/wordpress/?p=1496>
2. <https://gist.github.com/elithrar/9539414>

