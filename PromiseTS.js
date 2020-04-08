var PromiseTS = /** @class */ (function () {
    function PromiseTS(callback) {
        this.status = "pending"; // 状态
        this.value = undefined; // 数据
        this.cbQueue = []; // 回调队列集合
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
         * 3. 传入普通数据，作为Promise的值
         * @param value
         */
        function resolve(value) {
            var _this = this;
            var run = function () {
                if (_this.status === "pending") {
                    // 如果是Promise类型，获取它的值和状态
                    if (value instanceof _this.constructor) {
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
                            value.then(resolve.bind(_this), reject.bind(_this));
                        }
                        catch (error) {
                            reject.call(_this, error);
                        }
                    }
                    // 只是普通数据
                    else {
                        _this.value = value;
                        _this.status = "resolved";
                        handleQueue.call(_this); // 处理回调队列
                    }
                }
            };
            // setTimeout模拟微任务，使Promise始终异步执行
            setTimeout(run, 0);
        }
        /**
         * 执行失败回调，错误信息直接作为Promise的值
         * @param error
         */
        function reject(error) {
            var _this = this;
            var run = function () {
                if (_this.status === "pending") {
                    _this.value = error;
                    _this.status = "rejected";
                    handleQueue.call(_this); // 处理回调队列
                }
            };
            // setTimeout模拟微任务，使Promise始终异步执行
            setTimeout(run, 0);
        }
        /**
         * 异步时会出现回调队列，在这里封装成方法统一处理
         * Promise状态改变后会调用
         */
        function handleQueue() {
            var _this = this;
            // resolve处理方式
            if (this.status === "resolved") {
                this.cbQueue.map(function (cbObj) {
                    // 回调函数存在，返回结果作为新promise的值
                    if (typeof cbObj.onResolved === "function") {
                        try {
                            cbObj.resolve(cbObj.onResolved(_this.value));
                        }
                        catch (error) {
                            cbObj.reject(error);
                        }
                    }
                    // 回调函数不存在，当前value作为新promise的值
                    else {
                        cbObj.resolve(_this.value);
                    }
                });
            }
            // reject处理方式
            else if (this.status === "rejected") {
                this.cbQueue.map(function (cbObj) {
                    // 回调函数存在，返回结果作为新promise的值，并且新promise为resolve状态
                    if (typeof cbObj.onRejected === "function") {
                        try {
                            cbObj.resolve(cbObj.onRejected(_this.value));
                        }
                        catch (error) {
                            cbObj.reject(error);
                        }
                    }
                    // 回调函数不存在，当前value作为新promise的值
                    else {
                        cbObj.reject(_this.value);
                    }
                });
            }
            // 最后清空队列
            this.cbQueue.splice(0);
        }
    }
    /**
     * 对Promise的处理，返回新Promise
     * 成功时：有回调，新Promise为resolved，返回结果作为value
     *         无回调，Promise穿透
     * 失败时：有回调，新Promise为resolved，返回结果作为value
     *         无回调，Promise穿透
     */
    PromiseTS.prototype.then = function (onResolved, onRejected) {
        var _this = this;
        return new PromiseTS(function (resolve, reject) {
            if (_this.status === "pending") {
                // 加入队列，等待执行
                _this.cbQueue.push({
                    onResolved: onResolved,
                    onRejected: onRejected,
                    resolve: resolve,
                    reject: reject
                });
            }
            // 同步
            else {
                // 成功
                if (_this.status === "resolved") {
                    // 有回调
                    if (typeof onResolved === "function") {
                        try {
                            resolve(onResolved(_this.value));
                        }
                        catch (error) {
                            reject(error);
                        }
                    }
                    // 无回调，穿透
                    else {
                        resolve(_this.value);
                    }
                }
                // 失败
                else if (_this.status === "rejected") {
                    // 有回调
                    if (typeof onRejected === "function") {
                        try {
                            resolve(onRejected(_this.value));
                        }
                        catch (error) {
                            reject(error);
                        }
                    }
                    // 无回调，穿透
                    else {
                        reject(_this.value);
                    }
                }
            }
        });
    };
    /**
     * 对Promise失败状态处理，返回新Promise
     * 有回调，新Promise为resolved，返回结果作为value
     * 无回调，穿透
     */
    PromiseTS.prototype["catch"] = function (onRejected) {
        return this.then(null, onRejected);
    };
    /**
     * 始终执行，返回一个新Promise，直接穿透
     */
    PromiseTS.prototype["finally"] = function (callback) {
        var _this = this;
        return this.then(function (rsp) {
            callback();
            return _this.constructor["resolve"](rsp);
        }, function (err) {
            callback();
            return _this.constructor["reject"](err);
        });
    };
    /**
     * 生成一个resolved状态的Promise，有三种情况
     * 1. 传入Promise，直接返回
     * 2. 传入带then函数的对象，以当前函数作为参数进行new
     * 3. 传入普通数据，作为Promise的值
     */
    PromiseTS.resolve = function (value) {
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
            return new this(function (resolve, reject) {
                resolve(value);
            });
        }
    };
    /**
     * 生成一个rejected状态的Promise
     */
    PromiseTS.reject = function (error) {
        return new this(function (resolve, reject) {
            reject(error);
        });
    };
    /**
     * 传入Promise数组，返回新Promise
     * 全部成功则成功，值为结果集rspList
     * 有一个失败就算失败，值为错误信息
     */
    PromiseTS.all = function (promiseList) {
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
    PromiseTS.race = function (promiseList) {
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
    PromiseTS.allSettled = function (promiseList) {
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
    return PromiseTS;
}());
