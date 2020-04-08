/**
 * 使用TypeScript语法实现Promise
 */
interface CbObj {
    onResolved: Function,
    onRejected: Function,
    resolve: Function,
    reject: Function
}
class PromiseTS {
    private status: string = "pending";     // 状态
    private value: any = undefined;          // 数据
    private readonly cbQueue: CbObj[] = [];    // 回调队列集合
    constructor(callback: Function) {
        try {
            callback(resolve.bind(this), reject.bind(this));
        } catch(error) {
            reject.call(this, error);
        }
        /**
         * 执行成功回调，入参有三种情况
         * 1. 传入Promise类型时，穿透
         * 2. 传入带then函数的对象时，执行then
         * 3. 传入普通数据，作为Promise的值
         * @param value
         */
        function resolve(value: any): void {
            let run = (): void => {
                if (this.status === "pending") {
                    // 如果是Promise类型，获取它的值和状态
                    if (value instanceof this.constructor) {
                        value.then((rsp: any)=> {
                            this.value = rsp;
                            this.status = "resolved";
                            handleQueue.call(this);     // 处理回调队列
                        }, (err: any)=> {
                            this.value = err;
                            this.status = "rejected";
                            handleQueue.call(this);     // 处理回调队列
                        });
                    }
                    // 如果是带then函数的对象，执行then函数
                    else if (value && typeof value.then === "function") {
                        try {
                            value.then(resolve.bind(this), reject.bind(this));
                        } catch(error) {
                            reject.call(this, error);
                        }
                    }
                    // 只是普通数据
                    else {
                        this.value = value;
                        this.status = "resolved";
                        handleQueue.call(this);     // 处理回调队列
                    }
                }
            }
            // setTimeout模拟微任务，使Promise始终异步执行
            setTimeout(run, 0);
        }
        /**
         * 执行失败回调，错误信息直接作为Promise的值
         * @param error 
         */
        function reject(error: any): void {
            let run = (): void => {
                if (this.status === "pending") {
                    this.value = error;
                    this.status = "rejected";
                    handleQueue.call(this);     // 处理回调队列
                }
            }
            // setTimeout模拟微任务，使Promise始终异步执行
            setTimeout(run, 0);
        }
        /**
         * 异步时会出现回调队列，在这里封装成方法统一处理
         * Promise状态改变后会调用
         */
        function handleQueue(): void {
            // resolve处理方式
            if (this.status === "resolved") {
                this.cbQueue.map((cbObj: CbObj)=> {
                    // 回调函数存在，返回结果作为新promise的值
                    if (typeof cbObj.onResolved === "function") {
                        try {
                            cbObj.resolve(cbObj.onResolved(this.value));
                        } catch(error) {
                            cbObj.reject(error);
                        }
                    }
                    // 回调函数不存在，当前value作为新promise的值
                    else {
                        cbObj.resolve(this.value);
                    }
                });
            }
            // reject处理方式
            else if (this.status === "rejected") {
                this.cbQueue.map((cbObj: CbObj)=> {
                    // 回调函数存在，返回结果作为新promise的值，并且新promise为resolve状态
                    if (typeof cbObj.onRejected === "function") {
                        try {
                            cbObj.resolve(cbObj.onRejected(this.value));
                        } catch(error) {
                            cbObj.reject(error);
                        }
                    }
                    // 回调函数不存在，当前value作为新promise的值
                    else {
                        cbObj.reject(this.value);
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
    private then(onResolved: Function, onRejected: Function): PromiseTS {
        return new PromiseTS((resolve: Function, reject: Function)=> {
            if (this.status === "pending") {
                // 加入队列，等待执行
                this.cbQueue.push({
                    onResolved,
                    onRejected,
                    resolve,
                    reject
                });
            }
            // 同步
            else {
                // 成功
                if (this.status === "resolved") {
                    // 有回调
                    if (typeof onResolved === "function") {
                        try {
                            resolve(onResolved(this.value));
                        } catch(error) {
                            reject(error);
                        }
                    }
                    // 无回调，穿透
                    else {
                        resolve(this.value);
                    }
                }
                // 失败
                else if (this.status === "rejected") {
                    // 有回调
                    if (typeof onRejected === "function") {
                        try {
                            resolve(onRejected(this.value));
                        } catch(error) {
                            reject(error);
                        }
                    }
                    // 无回调，穿透
                    else {
                        reject(this.value);
                    }
                }
            }
        });
    }
    /**
     * 对Promise失败状态处理，返回新Promise
     * 有回调，新Promise为resolved，返回结果作为value
     * 无回调，穿透
     */
    private catch(onRejected: Function): PromiseTS {
        return this.then(null, onRejected);
    }
    /**
     * 始终执行，返回一个新Promise，直接穿透
     */
    private finally(callback: Function): PromiseTS {
        return this.then((rsp: any)=> {
            callback();
            return this.constructor["resolve"](rsp);
        }, (err: any)=> {
            callback();
            return this.constructor["reject"](err);
        });
    }
    /**
     * 生成一个resolved状态的Promise，有三种情况
     * 1. 传入Promise，直接返回
     * 2. 传入带then函数的对象，以当前函数作为参数进行new
     * 3. 传入普通数据，作为Promise的值
     */
    static readonly resolve = function(value: any): PromiseTS {
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
            return new this((resolve: Function, reject: Function)=> {
                resolve(value);
            });
        }
    }
    /**
     * 生成一个rejected状态的Promise
     */
    static readonly reject = function(error: any): PromiseTS {
        return new this((resolve: Function , reject: Function)=> {
            reject(error);
        });
    }
    /**
     * 传入Promise数组，返回新Promise
     * 全部成功则成功，值为结果集rspList
     * 有一个失败就算失败，值为错误信息
     */
    static readonly all = function(promiseList: any[]): PromiseTS {
        if (!(promiseList instanceof Array)) {
            return;
        }
        let rspList: any[] = [];
        let count: number = 0;
        return new this((resolve: Function, reject: Function)=> {
            for (let i=0, len=promiseList.length; i<len; i++) {
                let p: any = promiseList[i];
                // 是Promise类型
                if (p instanceof this) {
                    p.then((rsp: any)=> {
                        // 成功，加入数组
                        rspList[i] = rsp;
                        if (++count === len) {
                            // 全部返回时，执行resolve
                            resolve(rspList);
                        }
                    }, (err: any)=> {
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
            }
        });
    }
    /**
     * 传入Promise数组，返回新Promise
     * 返回第一个执行结果，无论成功还是失败
     */
    static readonly race = function(promiseList: any[]): PromiseTS {
        if (!(promiseList instanceof Array)) {
            return;
        }
        return new this((resolve: Function, reject: Function)=> {
            for (let i=0, len=promiseList.length; i<len; i++) {
                let p: any = promiseList[i];
                // 是Promise类型
                if (p instanceof this) {
                    p.then((rsp: any)=> {
                        resolve(rsp);
                    }, (err: any)=> {
                        reject(err);
                    });
                }
                // 不是Promise类型，直接返回
                else {
                    resolve(p);
                }
            }
        });
    }
    /**
     * 传入Promise数组，返回新Promise
     * 返回所有执行结果，无论成功还是失败
     */
    static readonly allSettled = function(promiseList: any[]): PromiseTS {
        if (!(promiseList instanceof Array)) {
            return;
        }
        let rspList: any[] = [];
        let count: number = 0;
        return new this((resolve: Function, reject: Function)=> {
            for (let i=0, len=promiseList.length; i<len; i++) {
                let p: any = promiseList[i];
                // Promise对象
                if (p instanceof this) {
                    p.then((rsp: any)=> {
                        rspList[i] = rsp;
                        if (++count === len) {
                            resolve(rspList);
                        }
                    }, (err: any)=> {
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
            }
        });
    }
}