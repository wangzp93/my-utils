/**
 * 手写继承，圣杯模式
 * 需要一个中间函数
 * 通过中间函数实现继承，既可以保证不会继承多余属性，又能使父子原型改变时互不影响
 */
var inherit = (function() {
    function F() {}
    return function(Son, Father) {
        F.prototype = Father.prototype;
        Son.prototype = new F();
        Son.prototype.constructor = Son;
        Son.prototpye.uber = Father.prototype;
    }
}());