//子节点后添加
Node.prototype.insertAfter = function(newElem, existElem){
	var nextNode = existElem.nextSibling;
	if(nextNode){	//如果存在，在它前边插入
		this.insertBefore(newElem, nextNode);
	}else{	//不存在
		this.appendChild(newElem);
	}
};
//子节点倒序
Node.prototype.reverseChildNodes = function(){
	var childNodes = this.childNodes,
		firstChild = this.firstChild,
		lastIndex = childNodes.length-1;
	for(var i=lastIndex; i>0; i--){
		this.insertBefore(childNodes[lastIndex], firstChild);
	}
};
//获取滚动条位置(兼容性)
function getScrollOffset(){
	return {
		x: window.pageXOffset || document.body.scrollLeft + document.documentElement.scrollLeft,
		y: window.pageYOffset || document.body.scrollTop + document.documentElement.scrollTop
	};
}
//获取窗口可视区尺寸(兼容性)
function getViewportOffset(){
	var width = 0,
	    height = 0;
	if(window.innerWidth){
		width = window.innerWidth;
		height = window.innerHeight;
	}else{
		if(document.compatMode === "CSS1Compat"){	//标准模式
			width = document.documentElement.clientWidth;
			height = document.documentElement.clientHeight;
		}else if(document.compatMode === "BackCompat"){	//混杂模式
			width = document.body.clientWidth;
			height = document.body.clientHeight;
		}
	}
	return {
		width: width,
		height: height
	};
}
//任意元素相对文档位置
Element.prototype.getElementPosition = function(){
	var left = this.offsetLeft,
		top = this.offsetTop,
		offsetParent = this.offsetParent;
	if(offsetParent != document.body){	//如果有position父级，递归再去算
		var offset = offsetParent.getElementPosition();
		left += (parseInt(offsetParent.style.borderLeftWidth) + offset.left);
		top += (parseInt(offsetParent.style.borderTopWidth) + offset.top);
	}
	return {
		left: left,
		top: top
	};
};
//获取Css属性(兼容性)
Element.prototype.getCSSStyle = function(){
	if(window.getComputedStyle){
		return window.getComputedStyle(this, null);
	}else{
		return this.currentStyle;
	}
};
//绑定事件(兼容性)
Node.prototype.addEvent = function(eventType, fn){
	if(this.addEventListener){
		this.addEventListener(eventType, fn, false);
	}else if(this.attachEvent){
		this.attachEvent('on' + eventType, function(){
			fn.call(this);	//IE的attachEvent事件中，this指向window
		});
	}else{
		this['on' + eventType] = fn;
	}
};
//解除绑定事件(兼容性)
Node.prototype.removeEvent = function(eventType, fn){
	if(this.removeEventListener){
		this.removeEventListener(eventType, fn, false);
	}else if(this.detachEvent){
		this.detachEvent(eventType, fn);
	}else{
		this['on' + eventType] = null;
	}
};
//获取  事件对象(兼容性)
//var event = e || window.event;
//获取  事件源对象(兼容性)
Event.prototype.getTarget = function(){
	return this.target || this.srcElement;
};
//取消冒泡(兼容性)
Event.prototype.stopBubble = function(){
	if(this.stopPropagation){
		this.stopPropagation();
	}else{
		this.cancelBubble = true;
	}
};
//取消默认事件(兼容性)
Event.prototype.cancelDefault = function(){
	if(this.preventDefault){
		this.preventDefault();
	}else{
		this.returnValue = false;
	}
};
//异步(按需)加载js(兼容性)
function asyncJs(src, callback){
	var script = document.createElement('script');
	script.type = "text/javascript";
	if(script.onload){
		//除了IE，可以利用onload事件
		script.onload = function(){
			this.onload = null;
			callback();
		}
	}else{
		//IE，根据状态改变事件，监听状态码
		script.onreadystatechange = function(){
			var readyState = this.readyState;
			if(readyState == "complete" || readyState == "loaded"){
				this.onreadystatechange = null;
				callback();
			}
		}
	}
	//为避免先加载完资源，后绑定事件，造成事件无法触发
	//所以src写在绑定事件后边
	script.src = src;	//这步执行，就会去下载src里的内容了，并且是异步下载
	document.head.appendChild(script);	//执行到这步，src下载的代码才会执行
}
//模拟$(fn)
/*document.addEvent('DOMContentLoaded', function(){
	
});*/
// 深度克隆
function deepClone (origin) {
	var target = null;
	if (origin instanceof Object) {		// 是引用值，需要进一步判断
		if (origin instanceof Array) {		// 是数组
			target = [];
			for (var i=0, len=origin.length; i<len; i++) {
				target[i] = deepClone(origin[i]);
			}
		} else if (origin instanceof Function) {	// 是函数
			target = origin;
		} else {		// 否则是对象
			target = Object.create(null);
			for (var prop in origin) {
				if (origin.hasOwnProperty(prop)) {
					target[prop] = deepClone(origin[prop]);
				}
			}
		}
	} else {		// 是原始值，直接赋值
		target = origin;
	}
	return target;
}
// 重写bind
Function.prototype.newBind = function () {
    var target = arguments[0] || window;
    var args = [].slice.call(arguments, 1);
    var self = this;
    var S = function () {};
    var F = function () {
        var _args = [].slice.call(arguments);
        return self.apply(this instanceof F ? this : target, args.concat(_args));
    };
    S.prototype = this.prototype;
    F.prototype = new S();
    return F;
}
// 继承 圣杯模式
var inherit = (function () {
    var F = function () {};
    return function (Father, Son) {
        F.prototype = Father.prototype;
        Son.prototype = new F();
        Son.prototype.constructor = Father;
        Son.prototype.uber = Father.prototype;
    }
}());
// 拖拽 (原理)
function dragDom(elem){
	elem.onmousedown = function(e){
		e = e || window.event;
		var clientX = e.clientX,
			clientY = e.clientY,
			left = elem.offsetLeft,
			top = elem.offsetTop,
			x = clientX - left,
			y = clientY - top;
		document.onmousemove = function(e){
			e = e || window.event;
			var clientX = e.x,
				clientY = e.y;
			elem.style.left = clientX - x + "px";
			elem.style.top = clientY - y + "px";
		}
	};
	elem.onmouseup = function(){
		document.onmousemove = null;
	};
}
//节流 (被节流的函数, 等待时间)
function throttle(handler, wait) {
	var lastTime = 0;
	return function(){
		var nowTime = new Date().getTime();
		if(nowTime - lastTime > wait) {
			handler.apply(this, arguments);
			lastTime = nowTime;
		}
	}
}
// 防抖 (被防抖的函数, 等待时间)
function debounce(handler, wait) {
	var timer = null;
	return function() {
		var self = this,
			args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function(){
			handler.apply(self, args);
		}, wait);
	}
}
// 更改对象的原型 (仅适用于Chrome和FireFox，在IE中不工作)
Object.setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
	obj.__proto__ = proto;
	return obj; 
};