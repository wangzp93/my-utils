var MyPromise = /** @class */ (function () {
    function MyPromise(callback) {
        this.status = "pending"; // 状态
        this.value = undefined; // 数据
        this.resolveQueue = []; // resolve回调队列
        this.rejectQueue = []; // reject回调队列
        this.nextPromiseQueue = []; // 新promise执行队列
        try {
            callback(resolve.bind(this), reject.bind(this));
        }
        catch (error) {
            reject.call(this, error);
        }
        /**
         * 执行成功回调，入参有三种情况
         * 1. 传入Promise类型时，穿透
         * 2. 传入带then函数的对象时，执行then
         * 3. 传入普通数据，作为Promise值
         * @param value
         */
        function resolve(value) {
            var _this = this;
            if (this.status === "pending") {
                // 如果是Promise类型，获取它的值和状态
                if (value instanceof this.constructor) {
                    value.then(function (rsp) {
                        _this.value = rsp;
                        _this.status = "resolved";
                        handleQueue.call(_this); // 处理回调队列
                    }, function (err) {
                        _this.value = err;
                        _this.status = "rejected";
                        handleQueue.call(_this); // 处理回调队列
                    });
                }
                // 如果是带then函数的对象，执行then函数
                else if (value && typeof value.then === "function") {
                    try {
                        value.then(resolve.bind(this), reject.bind(this));
                    }
                    catch (error) {
                        reject.call(this, error);
                    }
                }
                // 只是普通数据
                else {
                    this.value = value;
                    this.status = "resolved";
                    handleQueue.call(this); // 处理回调队列
                }
            }
        }
        /**
         * 执行失败回调
         * @param error
         */
        function reject(error) {
            if (this.status === "pending") {
                this.value = error;
                this.status = "rejected";
                handleQueue.call(this); // 处理回调队列
            }
        }
        /**
         * 异步时会出现回调队列，在这里封装成方法统一处理
         * Promise状态改变后会调用
         */
        function handleQueue() {
            var _this = this;
            var nextQueue = this.nextPromiseQueue;
            // resolve处理方式
            if (this.status === "resolved") {
                this.resolveQueue.map(function (cb, i) {
                    // 回调函数存在，返回结果作为新promise的值
                    if (typeof cb === "function") {
                        nextQueue[i].resolve(cb(_this.value));
                    }
                    // 回调函数不存在，当前value作为新promise的值
                    else {
                        nextQueue[i].resolve(_this.value);
                    }
                });
            }
            // reject处理方式
            else if (this.status === "rejected") {
                this.rejectQueue.map(function (cb, i) {
                    // 回调函数存在，返回结果作为新promise的值，并且新promise为resolve状态
                    if (typeof cb === "function") {
                        nextQueue[i].resolve(cb(_this.value));
                    }
                    // 回调函数不存在，当前value作为新promise的值
                    else {
                        nextQueue[i].reject(_this.value);
                    }
                });
            }
            // 最后清空队列
            this.resolveQueue.splice(0);
            this.rejectQueue.splice(0);
            this.nextPromiseQueue.splice(0);
        }
    }
    /**
     * 对Promise的处理，返回新Promise
     * 成功时：有回调，新Promise为resolved，返回结果作为value
     *         无回调，Promise穿透
     * 失败时：有回调，新Promise为resolved，返回结果作为value
     *         无回调，Promise穿透
     */
    MyPromise.prototype.then = function (onResolved, onRejected) {
        var _this = this;
        return new MyPromise(function (resolve, reject) {
            // 异步
            if (_this.status === "pending") {
                // 加入队列，等待执行
                _this.resolveQueue.push(onResolved);
                _this.rejectQueue.push(onRejected);
                _this.nextPromiseQueue.push({
                    resolve: resolve,
                    reject: reject
                });
            }
            // 同步成功
            else if (_this.status === "resolved") {
                // 有回调函数，回调结果作为Promise值
                if (typeof onResolved === "function") {
                    resolve(onResolved(_this.value));
                }
                // 没有回调函数，穿透
                else {
                    resolve(_this.value);
                }
            }
            // 同步失败
            else if (_this.status === "rejected") {
                // 有回调函数，回调结果作为Promise值，并且为resolved状态
                if (typeof onRejected === "function") {
                    resolve(onRejected(_this.value));
                }
                // 没有回调函数，穿透
                else {
                    reject(_this.value);
                }
            }
        });
    };
    /**
     * 对Promise失败状态处理，返回新Promise
     * 有回调，新Promise为resolved，返回结果作为value
     * 无回调，穿透
     */
    MyPromise.prototype["catch"] = function (onRejected) {
        var _this = this;
        return new MyPromise(function (resolve, reject) {
            if (_this.status === "pending") {
                // 加入队列，等待执行
                _this.resolveQueue.push(null); // 传个空，用来占位
                _this.rejectQueue.push(onRejected);
                _this.nextPromiseQueue.push({
                    resolve: resolve,
                    reject: reject
                });
            }
            // 失败
            else if (_this.status === "rejected") {
                // 有回调
                if (typeof onRejected === "function") {
                    resolve(onRejected(_this.value));
                }
                // 无回调，穿透
                else {
                    reject(_this.value);
                }
            }
            // 成功，直接穿透
            else if (_this.status === "resolved") {
                resolve(_this.value);
            }
        });
    };
    /**
     * 始终执行，返回一个新Promise，直接穿透
     */
    MyPromise.prototype["finally"] = function (callback) {
        var _this = this;
        return new MyPromise(function (resolve, reject) {
            // 异步
            if (_this.status === "pending") {
                // 成功与失败队列都加入，始终执行
                _this.resolveQueue.push(callback);
                _this.rejectQueue.push(callback);
                _this.nextPromiseQueue.push({
                    resolve: resolve,
                    reject: reject
                });
            }
            // 同步成功
            else if (_this.status === "resolved") {
                callback();
                resolve(_this.value);
            }
            // 同步失败
            else if (_this.status === "rejected") {
                callback();
                reject(_this.value);
            }
        });
    };
    /**
     * 生成一个resolved状态的Promise，有三种情况
     * 1. 传入Promise，直接返回
     * 2. 传入带then函数的对象，以当前函数作为参数进行new
     * 3. 传入普通数据，作为Promise的值
     */
    MyPromise.resolve = function (value) {
        // 传入Promise类型
        if (value instanceof this) {
            return value;
        }
        // 传入带then函数的对象
        else if (value && typeof value.then === "function") {
            return new this(value.then);
        }
        // 普通数据
        else {
            return new this(function (resolve) {
                resolve(value);
            });
        }
    };
    /**
     * 生成一个rejected状态的Promise
     */
    MyPromise.reject = function (error) {
        return new this(function (resolve, reject) {
            reject(error);
        });
    };
    /**
     * 传入Promise数组，返回新Promise
     * 全部成功则成功，值为结果集rspList
     * 有一个失败就算失败，值为错误信息
     */
    MyPromise.all = function (promiseList) {
        var _this = this;
        if (!(promiseList instanceof Array)) {
            return;
        }
        var rspList = [];
        var count = 0;
        return new this(function (resolve, reject) {
            var _loop_1 = function (i, len) {
                var p = promiseList[i];
                // 是Promise类型
                if (p instanceof _this) {
                    p.then(function (rsp) {
                        // 成功，加入数组
                        rspList[i] = rsp;
                        if (++count === len) {
                            // 全部返回时，执行resolve
                            resolve(rspList);
                        }
                    }, function (err) {
                        // 失败，直接reject
                        reject(err);
                    });
                }
                // 不是Promise类型，直接放入
                else {
                    rspList[i] = p;
                    if (++count === len) {
                        // 全部返回时，执行resolve
                        resolve(rspList);
                    }
                }
            };
            for (var i = 0, len = promiseList.length; i < len; i++) {
                _loop_1(i, len);
            }
        });
    };
    /**
     * 传入Promise数组，返回新Promise
     * 返回第一个执行结果，无论成功还是失败
     */
    MyPromise.race = function (promiseList) {
        var _this = this;
        if (!(promiseList instanceof Array)) {
            return;
        }
        return new this(function (resolve, reject) {
            for (var i = 0, len = promiseList.length; i < len; i++) {
                var p = promiseList[i];
                // 是Promise类型
                if (p instanceof _this) {
                    p.then(function (rsp) {
                        resolve(rsp);
                    }, function (err) {
                        reject(err);
                    });
                }
                // 不是Promise类型，直接返回
                else {
                    resolve(p);
                }
            }
        });
    };
    /**
     * 传入Promise数组，返回新Promise
     * 返回所有执行结果，无论成功还是失败
     */
    MyPromise.allSettled = function (promiseList) {
        var _this = this;
        if (!(promiseList instanceof Array)) {
            return;
        }
        var rspList = [];
        var count = 0;
        return new this(function (resolve, reject) {
            var _loop_2 = function (i, len) {
                var p = promiseList[i];
                // Promise对象
                if (p instanceof _this) {
                    p.then(function (rsp) {
                        rspList[i] = rsp;
                        if (++count === len) {
                            resolve(rspList);
                        }
                    }, function (err) {
                        rspList.push(err);
                        if (++count === len) {
                            resolve(rspList);
                        }
                    });
                }
                // 非Promise对象
                else {
                    rspList[i] = p;
                    if (++count === len) {
                        resolve(rspList);
                    }
                }
            };
            for (var i = 0, len = promiseList.length; i < len; i++) {
                _loop_2(i, len);
            }
        });
    };
    return MyPromise;
}());
