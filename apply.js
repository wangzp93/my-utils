/**
 * 手写apply，和call类似
 */
Function.prototype.myApply = function() {
    var _this = arguments[0] || Window;
    var args = [];
    var _arguments = arguments[1];
    for (var i=0, len=_arguments.length; i<len; i++) {
        args.push(_arguments[i]);
    }
    _this.fn = this;
    var res = eval("_this.fn("+ args.join(",") +")");
    delete _this.fn;
    return res;
}