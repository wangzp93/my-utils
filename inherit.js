/**
 * 手写继承，圣杯模式
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