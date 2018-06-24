//-----------------------制作缓存--------------------------
var _CacheFun = {
		__cache : {},
		//获取所有缓存对象
		_getCacheObj: function() {
//            if (!this.__cache) {
//                this.__cache = {};
//            }
            return this.__cache || {};
        },
        //新增一个对象到缓存里
        _bindCache: function(id, data) {
            var cache = this._getCacheObj();
            cache[id] = data;
        },
        //获取一个对象从缓存里
        _getCache: function(id) {
            var cache = this._getCacheObj();
            if (cache) {
                if (id && id.length) {
                    return cache[id];
                } else {
                    return null;
                }
            }else{
            	return null;
            }
        },
        //清空缓存
        _clearCache: function() {
            this.__cache = {};
        }
};