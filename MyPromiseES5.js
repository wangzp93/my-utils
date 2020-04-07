/**
 * 使用ES5语法实现Promise
 * @param {function} callback 
 */
function MyPromise(callback) {
    this.status = "pending";
    this.value = undefined;
    this.resolveQueue = [];      // resolve状态回调队列
    this.rejectQueue = [];      // reject状态回调队列
    this.nextPromiseQueue = [];     // 下一个Promise的执行队列
    
    try {
        callback(resolve.bind(this), reject.bind(this));
    } catch(error) {
        reject.call(this, error);
    }
    
    function resolve(value) {
        if (this.status === "pending") {
            // value是Promise类型
            if (value instanceof this.constructor) {
                var _this = this;
                value.then(function(rsp) {
                    _this.value = rsp;
                    _this.status = "resolved";
                    handleQueue.call(_this);      // 处理任务队列
                }, function(err) {
                    _this.value = err;
                    _this.status = "rejected";
                    handleQueue.call(_this);      // 处理任务队列
                });
            }
            // value是含有then函数的对象
            else if (value && typeof value.then === "function") {
                try {
                    value.then(resolve.bind(this), reject.bind(this));
                } catch(error) {
                    reject.call(this, error);
                }
            }
            // value是普通数据
            else {
                this.value = value;     // 赋值
                this.status = "resolved";   // 改状态
                handleQueue.call(this);      // 处理任务队列
            }
        }
    }
    function reject(error) {
        if (this.status === "pending") {
            this.value = error;
            this.status = "rejected";
            handleQueue.call(this);      // 处理任务队列
        }
    }
    // 处理任务队列
    function handleQueue() {
        var nextQueue = this.nextPromiseQueue;
        var _this = this;
        if (this.status === "resolved") {
            this.resolveQueue.map(function(cb, i) {
                // 有回调函数，回调的返回结果，作为下一个Promise的值
                if (typeof cb === "function") {
                    nextQueue[i].resolve(cb(_this.value));
                }
                // 穿透，本次value作为下一个Promise的值
                else {
                    nextQueue[i].resolve(_this.value);
                }
            });
        } else if (this.status === "rejected") {
            this.rejectQueue.map(function(cb, i) {
                // 有回调，回调的返回结果，作为下一个Promise的值，并且新Promise为resolved状态
                if (typeof cb === "function") {
                    nextQueue[i].resolve(cb(_this.value));
                }
                // 穿透，本次error作为下一个Promise的值
                else {
                    nextQueue[i].reject(_this.value);
                }
            });
        }
        // 队列置空
        this.resolveQueue.splice(0);
        this.rejectQueue.splice(0);
        this.nextPromiseQueue.splice(0);
    }
}
MyPromise.prototype.then = function(onResolved, onRejected) {
    var _this = this;
    return new this.constructor(function(resolve, reject) {
        // 异步
        if (_this.status === "pending") {
            // 加入队列, 等待执行
            _this.resolveQueue.push(onResolved);
            _this.rejectQueue.push(onRejected);
            _this.nextPromiseQueue.push({
                resolve: resolve,
                reject: reject
            });
        }
        // 同步成功
        else if (_this.status === "resolved") {
            // 有回调函数，回调的返回结果，作为下一个Promise的值
            if (typeof onResolved === "function") {
                resolve(onResolved(_this.value));
            }
            // 穿透，本次value作为下一个Promise的值
            else {
                resolve(_this.value);
            }
        }
        // 同步失败
        else if (_this.status === "rejected") {
            // 有回调，回调的返回结果，作为下一个Promise的值，并且新Promise为resolved状态
            if (typeof onRejected === "function") {
                resolve(onRejected(_this.value));
            }
            // 穿透，本次value作为下一个Promise的值，并且新Promise为rejected状态
            else {
                reject(_this.value);
            }
        }
    });
}
MyPromise.prototype.catch = function(onRejected) {
    var _this = this;
    return new this.constructor(function(resolve, reject) {
        // 异步
        if (_this.status === "pending") {
            _this.resolveQueue.push(null);
            _this.rejectQueue.push(onRejected);
            _this.nextPromiseQueue.push({
                resolve: resolve,
                reject: reject
            });
        }
        // 同步失败
        else if (_this.status === "rejected") {
            if (typeof onRejected === "function") {
                resolve(onRejected(_this.value));
            }
            // 穿透
            else {
                reject(_this.value);
            }
        }
        // 同步成功
        else if (_this.status === "resolved") {
            resolve(_this.value);
        }
    });
}
MyPromise.prototype.finally = function(cb) {
    var _this = this;
    return new this.constructor(function(resolve, reject) {
        if (_this.status === "pending") {
            _this.resolveQueue.push(cb);
            _this.rejectQueue.push(cb);
            _this.nextPromiseQueue.push({
                resolve: resolve,
                reject: reject
            });
        } else if (_this.status === "resolved") {
            cb();
            resolve(_this.value);
        } else if (_this.status === "rejected") {
            cb();
            reject(_this.value);
        }
    });
}
MyPromise.resolve = function(value) {
    // value是Primose对象
    if (value instanceof this) {
        return value;
    }
    // value是含有then函数的对象
    else if (value && typeof value.then === "function") {
        return new this(value.then);
    }
    // value是普通数据
    else {
        return new this(function(resolve, reject) {
            resolve(value);
        });
    }
}
MyPromise.reject = function(error) {
    return new this(function(resolve, reject) {
        reject(error);
    });
}
MyPromise.all = function(promiseList) {
    if (!(promiseList instanceof Array)) {
        return;
    }
    var rspList = [];
    var count = 0;      // 记录rspList中的个数
    var _this = this;
    return new this(function(resolve, reject) {
        for (var i=0, len=promiseList.length; i<len; i++) {
            var p = promiseList[i];
            // 是Promise类型, 执行then
            if (p instanceof _this) {
                (function(j) {
                    p.then(function(rsp) {
                        rspList[j] = rsp;
                        if (++count === len) {
                            // 如果rspList全部返回, 执行resolve
                            resolve(rspList);
                        }
                    }, function(err) {
                        // 有一个报错, 就执行reject
                        reject(err);
                    });
                }(i));
            }
            // 不是Promise类型, 直接作为结果
            else {
                rspList[i] = p;
                if (++count === len) {
                    // 如果rspList全部返回, 执行resolve
                    resolve(rspList);
                }
            }
        }
    });
}
MyPromise.race = function(promiseList) {
    if (!(promiseList instanceof Array)) {
        return;
    }
    var _this = this;
    return new this(function(resolve, reject) {
        for (var i=0, len=promiseList.length; i<len; i++) {
            var p = promiseList[i];
            if (p instanceof _this) {
                p.then(function(rsp) {
                    resolve(rsp);
                }, function(err) {
                    reject(err);
                });
            }
            // 如果不是Promise类型, 直接作为返回结果
            else {
                resolve(p);
            }
        }
    });
}
MyPromise.allSettled = function(promiseList) {
    if (!(promise instanceof Array)) {
        return;
    }
    var rspList = [];
    var count = 0;
    var _this = this;
    return new this(function(resolve, reject) {
        for (var i=0, len=promiseList.length; i<len; i++) {
            var p = promiseList[i];
            if (p instanceof _this) {
                (function(j) {
                    p.then(function(rsp) {
                        rspList[j] = rsp;
                        if (++count === len) {
                            resolve(rspList);
                        }
                    }, function(err) {
                        rspList[j] = err;
                        if (++count === len) {
                            resolve(rspList);
                        }
                    });
                }(i))
            } else {
                rspList[i] = p;
                if (++count === len) {
                    resolve(rspList);
                }
            }
        }
    });
}
