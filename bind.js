/**
 * 手写bind函数
 */
Function.prototype.myBind = function() {
    // 获取this要指向的目标，默认是Window
    var target = arguments[0] || Window;
    // 获取实际参数列表
    var args = Array.prototype.slice.call(arguments, 1);

    var _this = this;
    function S() {
        // 获取新传入参数列表
        var _args = Array.prototype.slice.call(arguments, 0);
        // 判断如果是new调用，不改变this指向
        // 新老入参合并
        // 加return，把原函数的执行结果也返回出来
        return _this.apply(this instanceof S? this: target, args.concat(_args));
    }
    // 把原函数的原型也继承过来
    function F() {}
    F.prototype = this.prototype;
    S.prototype = new F();
    
    // 返回这个新函数
    return S;
}