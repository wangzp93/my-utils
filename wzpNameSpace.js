/*
 * 命名空间
 * ns_str 待创建的属性，例 "window.WZPUTILS"
 * obj 待创建属性的值
 */
function namespace(ns_str, obj){
	var parts = ns_str.split("."),
		parent = window;
	//剥离前面冗余的全局变量
	if(parts[0] === "window"){
		parts = parts.slice(1);
	}
	for(var i=0, len=parts.length; i<len; i++){
		var part = parts[i];
		if(typeof parent[part] === "undefined"){
			parent[part] = (i === len - 1 ? obj : {});
		}
		parent = parent[part];
	}
	return parent;
}

namespace("window.wzpUtils", (function(){
	var isNotIe = true,	//是否IE8及以下，考虑兼容性
	
		//子节点后插入
		insertAfter = function(parentNode, newNode, existNode){
			var nextNode = existNode.nextSibling;
			if(nextNode){	//如果存在，在它前边插入
				parentNode.insertBefore(newNode, nextNode);
			}else{	//不存在，直接添加到最后
				parentNode.appendChild(newNode);
			}
		},
		
		//子节点倒序
		reverseChildNodes = function(parentNode){
			var childNodes = parentNode.childNodes,
				firstChild = parentNode.firstChild,
				lastIndex = childNodes.length - 1;
			for(var i=lastIndex; i>0; i--){
				parentNode.insertBefore(childNodes[lastIndex], firstChild);
			}
		},
		
		//获取滚动条位置(兼容性)
		getScrollOffset = (function(){
			var func = function(){};
			if(typeof window.pageXOffset === "number"){	//非IE8
				func = function(){
					return {
						x: window.pageXOffset,
						y: window.pageYOffset
					};
				};
			}else{	//IE8
				func = function(){
					return {
						x: document.body.scrollLeft + document.documentElement.scrollLeft,
						y: document.body.scrollTop + document.documentElement.scrollTop
					};
				};
			}
			return func;
		}()),
		
		//获取窗口可视区尺寸(兼容性)
		getViewportOffset = (function(){
			var func = function(){};
			if(typeof window.innerWidth === "number"){	//非ie8
				func = function(){
					return {
						width: window.innerWidth,
						height: window.innerHeight
					};
				};
			}else if(document.compatMode === "CSS1Compat"){	//标准模式
				func = function(){
					return {
						width: document.documentElement.clientWidth,
						height: document.documentElement.clientHeight
					};
				};
			}else if(document.compatMode === "BackCompat"){	//混杂模式
				func = function(){
					return {
						width: document.body.clientWidth,
						height: document.body.clientHeight
					};
				};
			}else{
				func = function(){
					return {
						width: 0,
						height: 0
					};
				};
			}
			return func;
		}()),
		
		//任意元素相对文档位置(依赖getCSSStyle方法)
		getElementPosition = function(elem){
			var left = elem.offsetLeft,
				top = elem.offsetTop,
				offsetParent = elem.offsetParent;
			if(offsetParent != document.body){
				//如果offsetParent不是body，说明有position的父级
				//递归继续去算父级偏移，并加上border宽度
				var offset = this.getElementPosition(offsetParent),	//获取父级偏移
					cssStyle = this.getCSSStyle(offsetParent),	//获取父级css
					borderLeftWidth = parseInt(cssStyle.borderLeftWidth),	//左border宽
					borderTopWidth = parseInt(cssStyle.borderTopWidth);		//上border宽
				left += (borderLeftWidth + offset.left);
				top += (borderTopWidth + offset.top);
			}
			return {
				left: left,
				top: top
			};
		},
		
		//获取Css属性(兼容性)
		getCSSStyle = (function(){
			var func = function(){};
			if(typeof window.getComputedStyle === "function"){	//非ie8
				func = function(elem){
					return window.getComputedStyle(elem, null);
				}
			}else{	//ie8
				func = function(elem){
					return elem.currentStyle;
				}
			}
			return func;
		}()),
		
		//绑定事件(兼容性)
		addEvent = (function(){
			var func = function(){};
			if(typeof Node.prototype.addEventListener === "function"){	//非ie8
				func = function(elem, type, fn){
					elem.addEventListener(type, fn, false);
				}
			}else if(typeof Node.prototype.attachEvent === "function"){	//ie8
				func = function(elem, type, fn){
					elem.attachEvent('on' + type, function(){
						fn.call(elem);	//IE的attachEvent事件中，this指向window
					});
				}
			}else{
				func = function(elem, type, fn){
					elem['on' + type] = fn;
				}
			}
			return func;
		}()),
		
		//解除绑定事件(兼容性)
		removeEvent = (function(){
			var func = function(){};
			if(typeof Node.prototype.removeEventListener === "function"){	//非ie8
				func = function(elem, type, fn){
					elem.removeEventListener(type, fn, false);
				}
			}else if(typeof Node.prototype.detachEvent === "function"){	//ie8
				func = function(elem, type, fn){
					elem.detachEvent(type, fn);
				}
			}else{
				func = function(elem, type){
					elem['on' + type] = null;
				}
			}
			return func;
		}()),
		
		//获取  事件源对象(兼容性)
		getTarget = function(event){
			return event.target || event.srcElement;
		},
		
		//取消冒泡(兼容性)
		stopBubble = (function(){
			var func = function(){};
			if(typeof Event.prototype.stopPropagation === "function"){	//非ie8
				func = function(event){
					event.stopPropagation();
				}
			}else{	//ie8
				func = function(event){
					event.cancelBubble = true;
				}
			}
			return func;
		}()),
		
		//取消默认事件(兼容性)
		cancelDefault = (function(){
			var func = function(){};
			if(typeof Event.prototype.preventDefault === "function"){	//非ie8
				func = function(event){
					event.preventDefault();
				}
			}else{	//ie8
				func = function(event){
					event.returnValue = false;
				}
			}
			return func;
		}()),
		
		//异步(按需)加载js(兼容性)
		asyncJs = (function(){
			var sc = document.createElement('script'),
				func = function(){};
			if(sc.onload){	//非ie8
				func = function(src, callback){
					var script = document.createElement('script');
					script.type = "text/javascript";
					script.onload = function(){
						this.onload = null;
						callback();
					}
					script.src = src;	//这步执行，就会去下载src里的内容了，并且是异步下载
					document.head.appendChild(script);	//执行到这步，src下载的代码才会执行
				}
			}else{	//ie8
				func = function(src, callback){
					var script = document.createElement('script');
					script.type = "text/javascript";
					//IE，根据状态改变事件，监听状态码
					script.onreadystatechange = function(){
						var readyState = this.readyState;
						if(readyState == "complete" || readyState == "loaded"){
							this.onreadystatechange = null;
							callback();
						}
					}
					script.src = src;	//这步执行，就会去下载src里的内容了，并且是异步下载
					document.head.appendChild(script);	//执行到这步，src下载的代码才会执行
				}
			}
			return func;
		}());
		
		
	return {
		insertAfter: insertAfter,		//子节点后插入
		reverseChildNodes: reverseChildNodes,		//子节点倒序
		getScrollOffset: getScrollOffset,		//获取滚动条位置(兼容性)
		getViewportOffset: getViewportOffset,	//获取窗口可视区尺寸(兼容性)
		getElementPosition: getElementPosition,	//任意元素相对文档位置
		getCSSStyle: getCSSStyle,		//获取Css属性(兼容性)
		addEvent: addEvent,				//绑定事件(兼容性)
		removeEvent: removeEvent,		//解除绑定事件(兼容性)
		getTarget: getTarget,			//获取  事件源对象(兼容性)
		stopBubble: stopBubble,			//取消冒泡(兼容性)
		cancelDefault: cancelDefault,	//取消默认事件(兼容性)
		asyncJs: asyncJs,				//异步(按需)加载js(兼容性)
	};
}()));