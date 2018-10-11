---
layout: post
title: Go 中终止超时的进程
tags:
- go
- exec
---

最近在写 [better-domains](http://domain.sibo.io) 的时候，用了 `os/exec` 执行系统的 `whois` 程序，运行一段时间后会在某次卡住，导致 CPU 占用 100%。

这里如果加上超时判断，当发生超时时自动杀死进程就不会出现该问题了。

```
// use whois query to detect is domain registered
func whoisQueryRegistered(domain string) bool {
	cmd := exec.Command("sleep", "5")

	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Start()

	done := make(chan error, 1)

	go func() {
		done <- cmd.Wait()
	}()
	select {
	case <-time.After(time.Duration(config.WhoisQueryTimeout) * time.Second):
		if err := cmd.Process.Kill(); err != nil {
			log.Printf("%s failed to kill process %v", domain, err)
			return false
		}
		log.Printf("%s process killed as timeout reached", domain)
		return false
	case err := <-done:
		if err != nil {
			return false
		} else {
			return out.String() != "" && strings.Index(out.String(), "No match for") == -1
		}
	}
}
```
