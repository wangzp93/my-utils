/***
 * 缓存工具
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