global.__wdio = {
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

    onPrepare: (...args) => {
        global.__wdio.onPrepare.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.onPrepare.end = new Date().getTime()
    },
    before: (...args) => {
        global.__wdio.before.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.before.end = new Date().getTime()
    },
    beforeSuite: (...args) => {
        global.__wdio.beforeSuite.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.beforeSuite.end = new Date().getTime()
    },
    beforeHook: (...args) => {
        global.__wdio.beforeHook.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.beforeHook.end = new Date().getTime()
    },
    afterHook: (...args) => {
        global.__wdio.afterHook.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.afterHook.end = new Date().getTime()
    },
    beforeTest: (...args) => {
        global.__wdio.beforeTest.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.beforeTest.end = new Date().getTime()
    },
    beforeCommand: (...args) => {
        global.__wdio.beforeCommand.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.beforeCommand.end = new Date().getTime()
    },
    afterCommand: (...args) => {
        global.__wdio.afterCommand.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.afterCommand.end = new Date().getTime()
    },
    afterTest: (...args) => {
        global.__wdio.afterTest.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.afterTest.end = new Date().getTime()
    },
    afterSuite: (...args) => {
        global.__wdio.afterSuite.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.afterSuite.end = new Date().getTime()
    },
    after: (...args) => {
        global.__wdio.after.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.after.end = new Date().getTime()
    },
    onComplete: (...args) => {
        global.__wdio.onComplete.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.onComplete.end = new Date().getTime()
    }
}
