/**
 * 节流函数，在特定时间内，只能执行一次
 * @param {function} fn 被节流的函数
 * @param {number} wait 节流时间(毫秒)
 */
// 思路1
function throttle(fn, wait) {
    var isRun = false;
	return function() {
		if (isRun) {
			return;
		}
		isRun = true
		fn.apply(this, arguments)
		setTimeout(function() {
			isRun = false
		}, wait)
	}
}
// 思路2
function throttle(fn, wait) {
    var lastTime = 0;
    return function() {
        var nowTime = Date.now();

        // 超过节流时间后，可以执行了
        if (nowTime - lastTime > wait) {
            fn.apply(this, arguments);
            // lastTime变为当前时间
            lastTime = nowTime;
        }
    }
}