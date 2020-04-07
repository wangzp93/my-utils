/**
 * 使用ES6语法实现Promise
 */
class MyPromise {
    constructor(callback) {
        this.status = "pending";
        this.value = undefined;
        this.resolveQueue = [];
        this.rejectQueue = [];
        this.nextPromiseQueue = [];
        
        try {
            callback(resolve.bind(this), reject.bind(this));
        } catch(error) {
            reject.call(this, error);
        }
        
        function resolve(value) {
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
        function reject(error) {
            if (this.status === "pending") {
                this.value = error;
                this.status = "rejected";
                handleQueue.call(this);
            }
        }
        function handleQueue() {
            let nextQueue = this.nextPromiseQueue;
            if (this.status === "resolved") {
                this.resolveQueue.map((cb, i)=> {
                    if (typeof cb === "function") {
                        nextQueue[i].resolve(cb(this.value));
                    } else {
                        nextQueue[i].resolve(this.value);
                    }
                });
            } else if (this.status === "rejected") {
                this.rejectQueue.map((cb, i)=> {
                    if (typeof cb === "function") {
                        nextQueue[i].resolve(cb(this.value));
                    } else {
                        nextQueue[i].reject(this.value);
                    }
                });
            }
            this.resolveQueue.splice(0);
            this.rejectQueue.splice(0);
            this.nextPromiseQueue.splice(0);
        }
    }
    then(onResolved, onRejected) {
        return new this.constructor((resolve, reject)=> {
            if (this.status === "pending") {
                this.resolveQueue.push(onResolved);
                this.rejectQueue.push(onRejected);
                this.nextPromiseQueue.push({
                    resolve,
                    reject
                });
            } else if (this.status === "resolved") {
                if (typeof onResolved === "function") {
                    resolve(onResolved(this.value));
                } else {
                    resolve(this.value);
                }
            } else if (this.status === "rejected") {
                if (typeof onRejected === "function") {
                    resolve(onRejected(this.value));
                } else {
                    reject(this.value);
                }
            }
        });
    }
    catch(onRejected) {
        return new this.constructor((resolve, reject)=> {
            if (this.status === "pending") {
                this.resolveQueue.push(null);
                this.rejectQueue.push(onRejected);
                this.nextPromiseQueue.push({
                    resolve,
                    reject
                });
            } else if (this.status === "rejected") {
                if (typeof onRejected === "function") {
                    resolve(onRejected(this.value));
                } else {
                    reject(this.value);
                }
            } else if (this.status === "resolved") {
                resolve(this.value);
            }
        });
    }
    finally(callback) {
        return new this.constructor((resolve, reject)=> {
            if (this.status === "pending") {
                this.resolveQueue.push(callback);
                this.rejectQueue.push(callback);
                this.nextPromiseQueue.push({
                    resolve,
                    reject
                });
            } else if (this.status === "resolved") {
                callback();
                resolve(this.value);
            } else if (this.status === "rejected") {
                callback();
                reject(this.value);
            }
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
                        resolve(err);
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