/**
 * 防抖函数，延迟执行一次，等待时间内不重复执行
 * @param {function} fn 被防抖的函数
 * @param {number} wait 等待时间
 */
function debounce(fn, wait) {
    var timer = null;   // 定时器
    return function() {
        // 每次先清除上次定时器
        clearTimeout(timer);
        var _this = this,
            _args = arguments;
        
        // 创建定时器
        timer = setTimeout(function() {
            fn.apply(_this, _args);
        }, wait);
    }
}