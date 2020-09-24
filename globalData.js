/**
 * 封装全局变量
 */
function GlobalData() {
    const data = Object.create(null);
    this.getData = function() {
        return data;
    }
    this.setData = function(newData) {
        Object.assign(data, newData)
    }
    this.delData = function(key) {
        delete data[key];
    }
}
export default const globalData = new GlobalData()

// 使用
import globalData from './GlobalData.js';
globalData.setData({
    a: 'aaa'
})
globalData.getData()    // {a: 'aaa'}