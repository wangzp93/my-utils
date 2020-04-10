/**
 * 手写call
 */
Function.prototype.myCall = function() {
    // 获取this指向的目标
    var _this = arguments[0] || Window;
    // 存放实际参数
    var args = [];
    for (var i=1, len=arguments.length; i<len; i++) {
        args.push(arguments[i]);
    }

    // 把自身绑定到目标上
    _this.fn = this;
    // 用eval调用，否则实参买法传，并接收返回结果
    var res = eval("_this.fn("+ args.join(",") +")");
    // 删除多余的fn
    delete _this.fn;
    // 返回执行结果
    return res;
}