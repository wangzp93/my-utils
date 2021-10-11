function deepClone(obj) {
    let result = null
    if (typeof obj === 'object' && obj !== null) {
        if (Object.prototype.toString.call(obj) === '[object Object]') {
            result = {}
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = deepClone(obj[key])
                }
            }
        } else if (Array.isArray(obj)) {
            result = []
            for (let i=0, len=obj.length; i<len; i++) {
                result.push(deepClone(obj[i]))
            }
        } else if (obj instanceof Date) {
            result = new Date(obj)
        } else if (obj instanceof RegExp) {
            result = new RegExp(obj)
        }
    } else {
        // 原始值和function 直接赋值
        result = obj
    }
    return result
}