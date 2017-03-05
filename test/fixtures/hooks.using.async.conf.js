global._____wdio = {
    onPrepare: {},
    before: {},
    beforeSuite: {},
    beforeHook: {},
    afterHook: {},
    beforeTest: {},
    beforeCommand: {},
    afterCommand: {},
    afterTest: {},
    afterSuite: {},
    after: {},
    onComplete: {}
}

export default {
    capabilities: {
        browserName: 'chrome'
    },

    mochaOpts: {
        timeout: 5000
    },

    before: (...args) => {
        global._____wdio.before.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.before.end = new Date().getTime()
        })
    },
    beforeSuite: (...args) => {
        global._____wdio.beforeSuite.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.beforeSuite.end = new Date().getTime()
        })
    },
    beforeHook: (...args) => {
        global._____wdio.beforeHook.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.beforeHook.end = new Date().getTime()
        })
    },
    afterHook: (...args) => {
        global._____wdio.afterHook.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.afterHook.end = new Date().getTime()
        })
    },
    beforeTest: (...args) => {
        global._____wdio.beforeTest.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.beforeTest.end = new Date().getTime()
        })
    },
    beforeCommand: (...args) => {
        global._____wdio.beforeCommand.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.beforeCommand.end = new Date().getTime()
        })
    },
    afterCommand: (...args) => {
        global._____wdio.afterCommand.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.afterCommand.end = new Date().getTime()
        })
    },
    afterTest: (...args) => {
        global._____wdio.afterTest.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.afterTest.end = new Date().getTime()
        })
    },
    afterSuite: (...args) => {
        global._____wdio.afterSuite.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.afterSuite.end = new Date().getTime()
        })
    },
    after: (...args) => {
        global._____wdio.after.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.after.end = new Date().getTime()
        })
    }
}
