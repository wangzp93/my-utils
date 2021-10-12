/**
 * 微信小程序utils
 * @type {(function(): (null|undefined))|*}
 */
const WxUtil = (function() {
    let singleObj = null // 单例模式
    const reqQueue = [] // 因没有session而待请求的队列

    return function() {
        if (singleObj === null && this instanceof WxUtil) {
            singleObj = this
        } else {
            return singleObj
        }

        // 静默登录
        this.login = function() {
            // wx.login不需要任何授权，可直接调用
            wx.login().then((res) => {
                const params = {
                    code: res.code
                }
                // 用code调接口，获取unionId等信息
                get('/login', params).then((userInfo) => {
                    // 缓存登录信息
                    wx.setStorageSync('session', userInfo.session)

                    // 登录成功后，清空请求队列
                    while (reqQueue.length > 0) {
                        const reqItem = reqQueue[0]
                        const options = reqItem.options
                        const resolve = reqItem.resolve
                        resolve(this.http(options))
                    }
                })
            })
        }

        // GET
        this.get = function(url, params = {}) {
            const options = {
                url,
                method: 'GET',
                params
            }
            return this.http(options)
        }

        // POST
        this.post = function(url, params = {}) {
            const options = {
                url,
                method: 'POST',
                params
            }
            return this.http(options)
        }

        // 公共请求
        this.http = function(options) {
            // 校验session
            const session = wx.getStorageSync('session')
            if (!session) {
                // 没有session，把请求放入队列
                return new Promise(function(resolve) {
                    reqQueue.push({
                        options,
                        resolve
                    })
                })
            }

            const url = 'https://www.xxx.com/' + options.url,
                method = options.method || 'GET',
                data = options.params
            data.session = session

            // 发送请求
            return new Promise(function(resolve, reject) {
                wx.request({
                    url,
                    method,
                    data,
                    success: resolve,
                    fail: reject
                })
            })
        }
    }
}())

export default WxUtil
