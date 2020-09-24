/**
 * 一个缓存工具
 */
function MyCache() {
    var cache = Object.create(null);
    this.getCache = function(id) {
        return cache[id];
    }
    this.setCache = function(id, data) {
        cache[id] = data;
    }
    this.clearCache = function(id) {
        delete cache[id];
    }
}

/**
 * 使用
 */
var myCache = new MyCache()
myCache.setCache('userId', '123')
myCache.getCache('userId')	// 123
