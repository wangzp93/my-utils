/**
 * 节流函数，在特定时间内，只能执行一次
 * @param {function} fn 被节流的函数
 * @param {number} wait 节流时间(毫秒)
 */
function throttle(fn, wait) {
    var lastTime = 0;
    return function() {
        var nowTime = new Date().getTime();
        if (nowTime - lastTime > wait) {
            fn.apply(this, arguments);  // 超过节流时间后，可以执行了
            lastTime = nowTime;     // lastTime变为当前时间
        }
    }
}