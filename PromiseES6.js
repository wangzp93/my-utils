/**
 * 使用ES6语法实现Promise
 */
class PromiseES6 {
    constructor(callback) {
        this.status = "pending";
        this.value = undefined;
        this.cbQueue = [];
        
        try {
            callback(resolve.bind(this), reject.bind(this));
        } catch(error) {
            reject.call(this, error);
        }
        
        function resolve(value) {
            let run = ()=> {
                if (this.status === "pending") {
                    if (value instanceof this.constructor) {
                        value.then((rsp)=> {
                            this.value = rsp;
                            this.status = "resolved";
                            handleQueue.call(this);
                        }, (err)=> {
                            this.value = err;
                            this.status = "rejected";
                            handleQueue.call(this);
                        });
                    } else if (value && typeof value.then === "function") {
                        try {
                            value.then(resolve.bind(this), reject.bind(this));
                        } catch(error) {
                            resolve.call(this, error);
                        }
                    } else {
                        this.value = value;
                        this.status = "resolved";
                        handleQueue.call(this);
                    }
                }
            }
            setTimeout(run, 0);
        }
        function reject(error) {
            let run = ()=> {
                if (this.status === "pending") {
                    this.value = error;
                    this.status = "rejected";
                    handleQueue.call(this);
                }
            }
            setTimeout(run, 0);
        }
        function handleQueue() {
            if (this.status === "resolved") {
                this.cbQueue.map((cbObj)=> {
                    if (typeof cbObj.onResolved === "function") {
                        try {
                            cbObj.resolve(cbObj.onResolved(this.value));
                        } catch(error) {
                            cbObj.reject(error);
                        }
                    } else {
                        cbObj.resolve(this.value);
                    }
                });
            } else if (this.status === "rejected") {
                this.cbQueue.map((cbObj)=> {
                    if (typeof cbObj.onRejected === "function") {
                        try {
                            cbObj.resolve(cbObj.onRejected(this.value));
                        } catch(error) {
                            cbObj.reject(error);
                        }
                    } else {
                        cbObj.reject(this.value);
                    }
                });
            }
            this.cbQueue.splice(0);
        }
    }
    then(onResolved, onRejected) {
        return new this.constructor((resolve, reject)=> {
            if (this.status === "pending") {
                this.cbQueue.push({
                    onResolved,
                    onRejected,
                    resolve,
                    reject
                });
            } else if (this.status === "resolved") {
                if (typeof onResolved === "function") {
                    try {
                        resolve(onResolved(this.value));
                    } catch(error) {
                        reject(error);
                    }
                } else {
                    resolve(this.value);
                }
            } else if (this.status === "rejected") {
                if (typeof onRejected === "function") {
                    try {
                        resolve(onRejected(this.value));
                    } catch(error) {
                        reject(error);
                    }
                } else {
                    reject(this.value);
                }
            }
        });
    }
    catch(onRejected) {
        return this.then(null, onRejected);
    }
    finally(callback) {
        return this.then((rsp)=> {
            callback();
            return this.constructor.resolve(rsp);
        }, (err)=> {
            return this.constructor.reject(err);
        });
    }
    static resolve(value) {
        if (value instanceof this) {
            return value;
        } else if (value && typeof value.then === "function") {
            return new this(value.then);
        } else {
            return new this((resolve, reject)=> {
                resolve(value);
            });
        }
    }
    static reject(error) {
        return new this((resolve, reject)=> {
            reject(error);
        });
    }
    static all(promiseList) {
        if (!Array.isArray(promiseList)) {
            return;
        }
        let rspList = [];
        let count = 0;
        return new this((resolve, reject)=> {
            for (let i=0, len=promiseList.length; i<len; i++) {
                let p = promiseList[i];
                if (p instanceof this) {
                    p.then((rsp)=> {
                        rspList[i] = rsp;
                        if (++count === len) {
                            resolve(rspList);
                        }
                    }, (err)=> {
                        reject(err);
                    });
                } else {
                    rspList[i] = p;
                    if (++count === len) {
                        resolve(rspList);
                    }
                }
            }
        });
    }
    static race(promiseList) {
        if (!(promiseList instanceof Array)) {
            return;
        }
        return new this((resolve, reject)=> {
            for (let i=0, len=promiseList.length; i<len; i++) {
                let p = promiseList[i];
                if (p instanceof this) {
                    p.then((rsp)=> {
                        resolve(rsp);
                    }, (err)=> {
                        reject(err);
                    });
                } else {
                    resolve(p);
                }
            }
        });
    }
    static allSettled(promiseList) {
        if (!(promiseList instanceof Array)) {
            return;
        }
        let rspList = [];
        let count = 0;
        return new this((resolve, reject)=> {
            for (let i=0, len=promiseList.length; i<len; i++) {
                let p = promiseList[i];
                if (p instanceof this) {
                    p.then((rsp)=> {
                        rspList[i] = rsp;
                        if (++count === len) {
                            resolve(rspList);
                        }
                    }, (err)=> {
                        rspList[i] = err;
                        if (++count === len) {
                            resolve(rspList);
                        }
                    });
                } else {
                    rspList[i] = p;
                    if (++count === len) {
                        resolve(rspList);
                    }
                }
            }
        });
    }
}