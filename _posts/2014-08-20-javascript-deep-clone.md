---
layout: post
title: Javascript deep clone
---

最近项目需要使用 dropbox ,由于 dropbox oauth2 要求 https 的跳转地址，所以不得不继续使用已经两年没有维护的 [node-dbox](https://github.com/sintaxi/node-dbox) 。由于之前已经多次被坑，这次使用沿用了之前自己修改过的代码，迁移还算顺利。由于可能长期需要使用，所以打算修复源代码中的问题。

在查看 node-dbox 的 [源代码](https://github.com/sintaxi/node-dbox/blob/master/lib/oauth.js) 的时候发现一行有趣的代码： 

    var options   = JSON.parse(JSON.stringify(options))

以前没有见过这样的写法，所以查了一下，搜索到的资料并不多。后来通过这个问题 [Cloning: what's the fastest alternative to JSON.parse(JSON.stringify(x))?](http://stackoverflow.com/questions/7914968/cloning-whats-the-fastest-alternative-to-json-parsejson-stringifyx) 明白这是一种对象克隆的方式。

先来了解一下深度克隆和浅度克隆：

###深度克隆(deep clone) 和 浅度克隆(shallow clone)

在克隆数组或者对象的时候有两种方式，shallow clone 只克隆数据结构，不会克隆其中的元素，所以浅度克隆会共享每个元素。

deep clone 将拷贝每个元素。

shallow clone 可能会由于共享元素的改变而引起一些难以察觉的问题，要谨慎。

shallow clone 比较简单：

	Object.getOwnPropertyDescriptors = function (obj) {
		var ret = {};
		Object.getOwnPropertyNames(obj).forEach(function (name) {
			ret[name] = Object.getOwnPropertyDescriptor(obj, name);
		});
		return ret;
	};

	var shallowClone = function (obj) {
		return Object.create(
			Object.getPrototypeOf(obj),
			Object.getOwnPropertyDescriptors(obj)
		);
	};

###性能

找到一个性能测试的对比 <http://jsperf.com/deep-copy-vs-json-stringify-json-parse> ,测试结果 JSON.parse(JSON.stringify(a)) 的性能比 deep copy 慢 80% 。性能差异非常明显 :

![benchmark.png](/images/javascriptDeepClone/benchmark.png)

下面是测试用到的 `deepCopy` 方法：

	function deepCopy(o) {
		var copy = o,k;
	 
		if (o && typeof o === 'object') {
			copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
			for (k in o) {
				copy[k] = deepCopy(o[k]);
			}
		}
	 
		return copy;
	}

###多种实现 deep clone 的方法

####1.

	JSON.parse(JSON.stringify(obj));

如果对象中不包含方法，只有变量，可以这样使用。

####2.

	function deepCopy(o) {
		var copy = o,k;
	 
		if (o && typeof o === 'object') {
			copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
			for (k in o) {
				copy[k] = deepCopy(o[k]);
			}
		}
	 
		return copy;
	}

####3.

	//If Object.create isn't already defined, we just do the simple shim, without the second argument,
	//since that's all we need here
	var object_create = Object.create;
	if (typeof object_create !== 'function') {
		object_create = function(o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}

	function deepCopy(obj) {
		if(obj == null || typeof(obj) !== 'object'){
			return obj;
		}
		//make sure the returned object has the same prototype as the original
		var ret = object_create(obj.constructor.prototype);
		for(var key in obj){
			ret[key] = deepCopy(obj[key]);
		}
		return ret;
	}


####4.

	/**
	 * Deep copy an object (make copies of all its object properties, sub-properties, etc.)
	 * An improved version of http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
	 * that doesn't break if the constructor has required parameters
	 * 
	 * It also borrows some code from http://stackoverflow.com/a/11621004/560114
	 */ 
	function deepCopy(src, /* INTERNAL */ _visited) {
		if(src == null || typeof(src) !== 'object'){
			return src;
		}

		// Initialize the visited objects array if needed
		// This is used to detect cyclic references
		if (_visited == undefined){
			_visited = [];
		}
		// Otherwise, ensure src has not already been visited
		else {
			var i, len = _visited.length;
			for (i = 0; i < len; i++) {
				// If src was already visited, don't try to copy it, just return the reference
				if (src === _visited[i]) {
					return src;
				}
			}
		}

		// Add this object to the visited array
		_visited.push(src);

		//Honor native/custom clone methods
		if(typeof src.clone == 'function'){
			return src.clone(true);
		}

		//Special cases:
		//Array
		if (Object.prototype.toString.call(src) == '[object Array]') {
			//[].slice(0) would soft clone
			ret = src.slice();
			var i = ret.length;
			while (i--){
				ret[i] = deepCopy(ret[i], _visited);
			}
			return ret;
		}
		//Date
		if (src instanceof Date){
			return new Date(src.getTime());
		}
		//RegExp
		if(src instanceof RegExp){
			return new RegExp(src);
		}
		//DOM Elements
		if(src.nodeType && typeof src.cloneNode == 'function'){
			return src.cloneNode(true);
		}

		//If we've reached here, we have a regular object, array, or function

		//make sure the returned object has the same prototype as the original
		var proto = (Object.getPrototypeOf ? Object.getPrototypeOf(src): src.__proto__);
		if (!proto) {
			proto = src.constructor.prototype; //this line would probably only be reached by very old browsers 
		}
		var ret = object_create(proto);

		for(var key in src){
			//Note: this does NOT preserve ES5 property attributes like 'writable', 'enumerable', etc.
			//For an example of how this could be modified to do so, see the singleMixin() function
			ret[key] = deepCopy(src[key], _visited);
		}
		return ret;
	}

	//If Object.create isn't already defined, we just do the simple shim, without the second argument,
	//since that's all we need here
	var object_create = Object.create;
	if (typeof object_create !== 'function') {
		object_create = function(o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}

这里使用递归完成深度克隆。

###结论

深度克隆是一个复杂的任务，并没有一个完美的解决方案，要根据情况谨慎对待。

如果是简单场景，可以使用 JSON.parse(JSON.stringify(obj)) 完成。

如果自己完全知道对象的数据结构，手动克隆将是最稳妥也是最高效的方式。

###参考

1. [http://stackoverflow.com/questions/7914968/cloning-whats-the-fastest-alternative-to-json-parsejson-stringifyx](http://stackoverflow.com/questions/7914968/cloning-whats-the-fastest-alternative-to-json-parsejson-stringifyx)
2. [What is the difference between a deep copy and a shallow copy?](http://stackoverflow.com/questions/184710/what-is-the-difference-between-a-deep-copy-and-a-shallow-copy)
3. [Explanation of Deep and Shallow Copying](https://www.cs.utexas.edu/~scottm/cs307/handouts/deepCopying.htm)
4. [Deep Copy vs JSON Stringify / JSON Parse](http://jsperf.com/deep-copy-vs-json-stringify-json-parse)
5. [What is the most efficient way to clone an object?](http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/5344074#5344074)
