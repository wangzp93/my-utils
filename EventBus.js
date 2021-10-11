var EventBus = (function() {
    let obj = null
    return function() {
        if (obj === null && this instanceof EventBus) {
            this.events = {}

            this.on = function(event, fn) {
                (this.events[event] || (this.events[event] = [])).push(fn)
            }

            this.emit = function(event, data) {
                const cbs = this.events[event] || []
                cbs.map(function(cb) {
                    cb(data)
                })
            }

            this.off = function(event, fn) {
                if (!fn) {
                    delete this.events[event]
                } else {
                    const cbs = this.events[event] || []
                    for (let i=0, len=cbs.length; i<len; i++) {
                        if (fn === cbs[i]) {
                            cbs.splice(i, 1)
                            break
                        }
                    }
                }
            }
            obj = this
        }
        return obj
    }
}())