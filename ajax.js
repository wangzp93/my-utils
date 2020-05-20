/**
 * 手写ajax
 * @param {url, method, data, async, success, error} options 
 */
// myAjax({
//     url: "https://api.jisuapi.com/idcard/query",
//     method: "post",
//     data: {
//         appkey: "yourappkey",
//         idcard: "士大夫撒旦"
//     },
//     timeout: 3000,
//     success(rsp) {
//         console.log(rsp)
//     },
//     error(err) {

//     }
// });
function myAjax(options) {
    var url = options.url;
    var method = options.method || "get";
    method = method.toUpperCase();
    var async = options.async===false? false: true;
    var data = options.data || {};

    var xhr = new XMLHttpRequest();

    // 当get请求时，处理参数
    if (method === "GET") {
        var paramStr = "";
        var i = 0;
        for (var key in data) {
            paramStr += (i++===0? "": "&") + (key + "=" + data[key]);
        }

        if (paramStr != "") {
            url += ("?" + paramStr);
        }
        data = null;
    }

    // 配置xhr
    xhr.open(method, url, async);
    xhr.timeout = options.timeout || 3000;

    // 当post请求时，处理参数
    if (method === "POST") {
        // Request Payload
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        data = JSON.stringify(data);

        // Form Data
        // var paramStr = "";
        // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        // var i = 0;
        // for (var key in data) {
        //     paramStr += (i++===0? "": "&") + (key + "=" + data[key]);
        // }
        // data = paramStr;
    }
    // 成功时回调
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (typeof options.success === "function") {
                    options.success(JSON.parse(xhr.responseText));
                }
            }
        }
    }
    // 失败时回调
    xhr.onerror = function(error) {
        if (typeof options.error === "function") {
            options.error(error);
        }
    }
    // 发送请求
    xhr.send(data);
}