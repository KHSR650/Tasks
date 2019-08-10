class LogPrinter {
    constructor(processName = "INDEX") {
        this.processName = processName;
    }

    log(...args) {
        args = args.map(_e => {
            if (typeof _e == "object") {
                _e = JSON.stringify(_e)
            }
            return _e;
        });
        console.log(`${this.processName} || ${args}`);
    }
}

module.exports = LogPrinter;