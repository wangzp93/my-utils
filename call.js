/**
 * 手写call
 */
Function.prototype.myCall = function() {
    var _this = arguments[0] || Window;     // 获取this指向的目标
    var args = [];      // 存放实际参数
    for (var i=1, len=arguments.length; i<len; i++) {
        args.push(arguments[i]);
    }
    _this.fn = this;    // 把自身绑定到目标上
    var res = eval("_this.fn("+ args.join(",") +")");  //   用eval调用，否则实参买法传，并接收返回结果
    delete _this.fn;    // 过河拆桥
    return res;
}