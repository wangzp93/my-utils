/**
 * 使用ES5语法实现Promise
 * @param {function} callback 
 */
function PromiseES5(callback) {
    this.status = "pending";
    this.value = undefined;
    this.cbQueue = [];     // 回调队列集合
    
    try {
        callback(resolve.bind(this), reject.bind(this));
    } catch(error) {
        reject.call(this, error);
    }
    
    function resolve(value) {
        function run() {
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
        setTimeout(run.bind(this), 0);
    }
    function reject(error) {
        function run() {
            if (this.status === "pending") {
                this.value = error;
                this.status = "rejected";
                handleQueue.call(this);      // 处理任务队列
            }
        }
        setTimeout(run.bind(this), 0);
    }
    // 处理任务队列
    function handleQueue() {
        var _this = this;
        if (this.status === "resolved") {
            this.cbQueue.map(function(cbObj) {
                // 有回调函数，回调的返回结果，作为下一个Promise的值
                if (typeof cbObj.onResolved === "function") {
                    try {
                        cbObj.resolve(cbObj.onResolved(_this.value));
                    } catch(error) {
                        cbObj.reject(error);
                    }
                }
                // 穿透，本次value作为下一个Promise的值
                else {
                    cbObj.resolve(_this.value);
                }
            });
        } else if (this.status === "rejected") {
            this.cbQueue.map(function(cbObj) {
                // 有回调，回调的返回结果，作为下一个Promise的值，并且新Promise为resolved状态
                if (typeof cbObj.onRejected === "function") {
                    try {
                        cbObj.resolve(cbObj.onRejected(_this.value));
                    } catch(error) {
                        cbObj.reject(error);
                    }
                }
                // 穿透，本次error作为下一个Promise的值
                else {
                    cbObj.reject(_this.value);
                }
            });
        }
        // 队列置空
        this.cbQueue.splice(0);
    }
}
PromiseES5.prototype.then = function(onResolved, onRejected) {
    var _this = this;
    return new this.constructor(function(resolve, reject) {
        // 异步
        if (_this.status === "pending") {
            // 加入队列, 等待执行
            _this.cbQueue.push({
                onResolved: onResolved,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
            });
        }
        // 同步成功
        else if (_this.status === "resolved") {
            // 有回调函数，回调的返回结果，作为下一个Promise的值
            if (typeof onResolved === "function") {
                try {
                    resolve(onResolved(_this.value));
                } catch(error) {
                    reject(error);
                }
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
                try {
                    resolve(onRejected(_this.value));
                } catch(error) {
                    reject(error);
                }
            }
            // 穿透，本次value作为下一个Promise的值，并且新Promise为rejected状态
            else {
                reject(_this.value);
            }
        }
    });
}
PromiseES5.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}
PromiseES5.prototype.finally = function(callback) {
    var _this = this;
    return this.then(function(rsp) {
        callback();
        return _this.constructor.resolve(rsp);
    }, function(err) {
        callback();
        return _this.constructor.reject(err);
    });
}
PromiseES5.resolve = function(value) {
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
PromiseES5.reject = function(error) {
    return new this(function(resolve, reject) {
        reject(error);
    });
}
PromiseES5.all = function(promiseList) {
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
PromiseES5.race = function(promiseList) {
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
PromiseES5.allSettled = function(promiseList) {
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
