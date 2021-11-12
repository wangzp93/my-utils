/**
 * @author: wangzp
 * @date: 2021-11-12 18:45
 */
/**
 * 微信小程序内http请求
 * 1. 解决登录接口并行请求问题
 * 2. 解决多个接口并行时loading的处理
 * @returns {(function(): void)|*}
 * @constructor
 */
function WxHttp () {
  const HTTP_QUEUE = [] // 因没有session而等待请求的队列
  let loadingCount = 0 // 记录触发loading弹窗的个数
  // 公共请求
  function http (options) {
    // 校验session
    const session = wx.getStorageSync('session')
    if (!session) {
      // 没有session，把请求放入队列
      return new Promise(function(resolve) {
        HTTP_QUEUE.push({
          options,
          resolve
        })
      })
    }

    const url = 'https://www.xxx.com/' + options.url,
      method = options.method || 'GET',
      data = options.params
    data.session = session

    // 按需开启loading
    if (options.isLoading && loadingCount++ === 0) {
      wx.showLoading({
        title: '加载中...',
        mask: true,
      })
    }

    // 发送请求
    return new Promise(function(success, fail) {
      wx.request({
        url,
        method,
        data,
        header: {},
        success,
        fail,
        complete() {
          // 按需关闭loading
          if (options.isLoading && loadingCount-- === 1) {
            wx.hideLoading()
          }
        }
      })
    })
  }

  return function () {
    // 静默登录
    this.login = function() {
      // wx.login不需要任何授权，可直接调用
      wx.login().then((res) => {
        const params = {
          code: res.code
        }
        // 用code调后端接口，获取unionId等信息
        return this.get('/login', params)
      }).then((userInfo) => {
        // 缓存登录信息
        wx.setStorageSync('session', userInfo.session)

        // 登录成功后，清空请求队列
        while (HTTP_QUEUE.length > 0) {
          const { options, resolve } = HTTP_QUEUE[0]
          resolve(http(options))
        }
      })
    }

    // GET
    this.get = function(url, params = {}, isLoading = false) {
      if (typeof params === 'boolean') {
        isLoading = params
        params = {}
      }
      const options = {
        url,
        method: 'GET',
        params,
        isLoading,
      }
      return http(options)
    }

    // POST
    this.post = function(url, params = {}, isLoading = false) {
      if (typeof params === 'boolean') {
        isLoading = params
        params = {}
      }
      const options = {
        url,
        method: 'POST',
        params,
        isLoading,
      }
      return http(options)
    }
  }
}