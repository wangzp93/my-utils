Date.prototype.format = function(format) {
	let str = ''
	if (format == null) {
		return str
	}
	const year = this.getFullYear(),
		month = this.getMonth() + 1,
		day = this.getDate(),
		hour = this.getHours(),
		minutes = this.getMinutes(),
		seconds = this.getSeconds(),
		milliSeconds = this.getMilliseconds()
	
	const regYear = /^y{4}/,
		regMonth = /M{2}/,
		regDay = /d{2}/,
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