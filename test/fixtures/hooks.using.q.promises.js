global.___wdio = {
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

import q from 'q'

export default {
    capabilities: {
        browserName: 'chrome'
    },

    mochaOpts: {
        timeout: 5000
    },

    onPrepare: (...args) => {
        global.___wdio.onPrepare.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.onPrepare.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    before: (...args) => {
        global.___wdio.before.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.before.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    beforeSuite: (...args) => {
        global.___wdio.beforeSuite.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.beforeSuite.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    beforeHook: (...args) => {
        global.___wdio.beforeHook.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.beforeHook.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    afterHook: (...args) => {
        global.___wdio.afterHook.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.afterHook.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    beforeTest: (...args) => {
        global.___wdio.beforeTest.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.beforeTest.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    beforeCommand: (...args) => {
        global.___wdio.beforeCommand.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.beforeCommand.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    afterCommand: (...args) => {
        global.___wdio.afterCommand.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.afterCommand.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    afterTest: (...args) => {
        global.___wdio.afterTest.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.afterTest.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    afterSuite: (...args) => {
        global.___wdio.afterSuite.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.afterSuite.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    after: (...args) => {
        global.___wdio.after.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.after.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    onComplete: (...args) => {
        global.___wdio.onComplete.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.onComplete.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    }
}
