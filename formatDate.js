Date.prototype.format = function(format) {
    let str = ''
    if (format == null) {
        return str
    }
    const year = this.getFullYear(),
        month = ('0' + (this.getMonth() + 1)).substr(-2),
        day = ('0' + this.getDate()).substr(-2),
        hour = ('0' + this.getHours()).substr(-2),
        minutes = ('0' + this.getMinutes()).substr(-2),
        seconds = ('0' + this.getSeconds()).substr(-2),
        milliSeconds = ('00' + this.getMilliseconds()).substr(-3)

    const regYear = /^Y{4}/,
        regMonth = /M{2}/,
        regDay = /D{2}/,
        regHour = /H{2}/,
        regMin = /m{2}/,
        regSec = /s{2}/,
        milliSec = /S{3}/

    str = format.replace(regYear, year)
        .replace(regMonth, month)
        .replace(regDay, day)
        .replace(regHour, hour)
        .replace(regMin, minutes)
        .replace(regSec, seconds)
        .replace(milliSec, milliSeconds)

    return str
}