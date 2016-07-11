---
layout: post
title: Swift & JavaScript integration
tags:
- cocoa
- swift
- javascript
---

## Swift call JavaScript

Call JavaScript from swift is an easy task:

    webView.windowScriptObject.callWebScriptMethod("alert", withArguments: ["Hello, JavaScript"])

or:

    webView.windowScriptObject.evaluateWebScript("alert('Hello, JavaScript')")

## JavaScript call Swift

This is not documented well, you need set `WebFrameLoadDelegate` for WebView.

First, set your WebView's `WebFrameLoadDelegate`, I control-drag my WebView to ViewController and set it's 'frameLoadDelegate' to my ViewController.

Implement `WebFrameLoadDelegate` for my ViewController:

    extension ViewController: WebFrameLoadDelegate {

        func webView(webView: WebView!, didClearWindowObject windowObject: WebScriptObject!, forFrame frame: WebFrame!) {
            self.webView.windowScriptObject.setValue(self, forKey: "Cocoa") // Cocoa is my key, you can change it as your wish
        }

        override class func webScriptNameForSelector(sel: Selector) -> String? { // this method is required
            if sel == #selector(cocoaLog) {
                return "log";
            }
            return nil
        }

        override class func isSelectorExcludedFromWebScript(sel: Selector) -> Bool { // this method is required
            switch (sel) {
            case #selector(cocoaLog):
                return false
            default:
                return true
            }
        }

        func cocoaLog(message: String) { // This method is exported to JavaScript
            print("from javascript:\(message)")
        }

    }


After this, I can call `Cocoa.log` in my JavaScript.
