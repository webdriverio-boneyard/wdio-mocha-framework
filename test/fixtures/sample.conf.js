global._wdio = {}

export default {
    capabilities: {
        browserName: 'chrome'
    },

    mochaOpts: {
        timeout: 5000
    },

    onPrepare: (...args) => {
        global._wdio.onPrepare = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.onPrepare.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    before: (...args) => {
        global._wdio.before = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.before.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    beforeSuite: (...args) => {
        global._wdio.beforeSuite = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.beforeSuite.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    beforeHook: (...args) => {
        global._wdio.beforeHook = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.beforeHook.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    afterHook: (...args) => {
        global._wdio.afterHook = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.afterHook.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    beforeTest: (...args) => {
        global._wdio.beforeTest = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.beforeTest.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    beforeCommand: (...args) => {
        global._wdio.beforeCommand = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.beforeCommand.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    afterCommand: (...args) => {
        global._wdio.afterCommand = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.afterCommand.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    afterTest: (...args) => {
        global._wdio.afterTest = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.afterTest.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    afterSuite: (...args) => {
        global._wdio.afterSuite = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.afterSuite.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    after: (...args) => {
        global._wdio.after = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.after.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    onComplete: (...args) => {
        global._wdio.onComplete = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.onComplete.end = new Date().getTime()
                resolve()
            }, 500)
        })
    }
}
