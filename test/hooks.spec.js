import configQPromises from './fixtures/hooks.using.q.promises'
import configNativePromises from './fixtures/hooks.using.native.promises'
import configWDIOCommands from './fixtures/hooks.using.wdio.commands'
import configCustomCommands from './fixtures/hooks.using.custom.commands'
import configAsyncCommands from './fixtures/hooks.using.async.conf'
import { MochaAdapter } from '../lib/adapter'

const specs = ['./test/fixtures/sample.spec.js']
const specs2 = ['./test/fixtures/sample2.spec.js']
const specs3 = ['./test/fixtures/sample3.spec.js']
const specs4 = ['./test/fixtures/sample4.spec.js']
const specs5 = ['./test/fixtures/sample5.spec.js']
const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    /**
     * task of this command is to add 1 so we can have a simple demo test like
     * browser.command(1).should.be.equal(2)
     */
    command: (a) => new Promise((r) => {
        setTimeout(() => r(a + 1), 2000)
    }),
    pause: (ms = 500) => new Promise((r) => {
        setTimeout(() => r(), ms)
    }),
    getPrototype: () => WebdriverIO.prototype
}

process.send = NOOP

describe('MochaAdapter executes hooks using native Promises', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new MochaAdapter(0, configNativePromises, specs, configNativePromises.capabilities);
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    describe('before', () => {
        let beforeHook

        before(() => beforeHook = global._wdio.before)

        it('should get executed', () => {
            beforeHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHook.end - beforeHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain capabilities and spec parameters', () => {
            beforeHook.args[0].should.be.equal(configNativePromises.capabilities)
            beforeHook.args[1].should.be.equal(specs)
        })
    })

    describe('beforeSuite', () => {
        let beforeSuiteHook

        before(() => beforeSuiteHook = global._wdio.beforeSuite)

        it('should get executed', () => {
            beforeSuiteHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeSuiteHook.end - beforeSuiteHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right suite data', () => {
            let suite = beforeSuiteHook.args[0]
            suite.type.should.be.equal('beforeSuite')
            suite.title.should.be.equal('dummy test')
        })
    })

    describe('beforeHook', () => {
        let beforeHookHook

        before(() => beforeHookHook = global._wdio.beforeHook)

        it('should get executed', () => {
            beforeHookHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHookHook.end - beforeHookHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterHook', () => {
        let afterHookHook

        before(() => afterHookHook = global._wdio.afterHook)

        it('should get executed', () => {
            afterHookHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterHookHook.end - afterHookHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeTest', () => {
        let beforeTestHook

        before(() => beforeTestHook = global._wdio.beforeTest)

        it('should get executed', () => {
            beforeTestHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeTestHook.end - beforeTestHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right test data', () => {
            let test = beforeTestHook.args[0]
            test.type.should.be.equal('beforeTest')
            test.title.should.be.equal('sample test')
            test.parent.should.be.equal('dummy test')
            test.passed.should.be.false()
        })
    })

    describe('beforeCommand', () => {
        let beforeCommandHook

        before(() => beforeCommandHook = global._wdio.beforeCommand)

        it('should get executed', () => {
            beforeCommandHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeCommandHook.end - beforeCommandHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right command parameter', () => {
            beforeCommandHook.args[0].should.be.equal('command')
            beforeCommandHook.args[1][0].should.be.equal(1) // input
        })
    })

    describe('afterCommand', () => {
        let afterCommandHook

        before(() => afterCommandHook = global._wdio.afterCommand)

        it('should get executed', () => {
            afterCommandHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterCommandHook.end - afterCommandHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right command parameter', () => {
            afterCommandHook.args[0].should.be.equal('command')
            afterCommandHook.args[1][0].should.be.equal(1) // input
            afterCommandHook.args[2].should.be.equal(2) // result
        })
    })

    describe('afterTest', () => {
        let afterTestHook

        before(() => afterTestHook = global._wdio.afterTest)

        it('should get executed', () => {
            afterTestHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterTestHook.end - afterTestHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right test data', () => {
            let test = afterTestHook.args[0]
            test.type.should.be.equal('afterTest')
            test.title.should.be.equal('sample test')
            test.parent.should.be.equal('dummy test')
            test.duration.should.be.greaterThan(2990) // 2000ms command, 2 * 500ms hooks
            test.passed.should.be.true()
        })
    })

    describe('afterSuite', () => {
        let afterSuiteHook

        before(() => afterSuiteHook = global._wdio.afterSuite)

        it('should get executed', () => {
            afterSuiteHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterSuiteHook.end - afterSuiteHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right suite data', () => {
            let suite = afterSuiteHook.args[0]
            suite.type.should.be.equal('afterSuite')
            suite.title.should.be.equal('dummy test')
        })
    })

    describe('after', () => {
        let afterHook

        before(() => afterHook = global._wdio.after)

        it('should get executed', () => {
            afterHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterHook.end - afterHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain capabilities and spec parameters', () => {
            afterHook.args[0].should.be.equal(0)
            afterHook.args[1].should.be.equal(configNativePromises.capabilities)
            afterHook.args[2].should.be.equal(specs)
        })
    })

    after(() => {
        delete global.browser
    })
})

describe('MochaAdapter executes hooks using WDIO commands', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new MochaAdapter(0, configWDIOCommands, specs2, configWDIOCommands.capabilities);
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    describe('before', () => {
        let beforeHook

        before(() => beforeHook = global.__wdio.before)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHook.end - beforeHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeSuite', () => {
        let beforeSuiteHook

        before(() => beforeSuiteHook = global.__wdio.beforeSuite)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeSuiteHook.end - beforeSuiteHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeHook', () => {
        let beforeHookHook

        before(() => beforeHookHook = global.__wdio.beforeHook)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHookHook.end - beforeHookHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterHook', () => {
        let afterHookHook

        before(() => afterHookHook = global.__wdio.afterHook)

        it('should defer execution until promise was resolved', () => {
            let duration = afterHookHook.end - afterHookHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeTest', () => {
        let beforeTestHook

        before(() => beforeTestHook = global.__wdio.beforeTest)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeTestHook.end - beforeTestHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeCommand', () => {
        let beforeCommandHook

        before(() => beforeCommandHook = global.__wdio.beforeCommand)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeCommandHook.end - beforeCommandHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterCommand', () => {
        let afterCommandHook

        before(() => afterCommandHook = global.__wdio.afterCommand)

        it('should defer execution until promise was resolved', () => {
            let duration = afterCommandHook.end - afterCommandHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterTest', () => {
        let afterTestHook

        before(() => afterTestHook = global.__wdio.afterTest)

        it('should defer execution until promise was resolved', () => {
            let duration = afterTestHook.end - afterTestHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterSuite', () => {
        let afterSuiteHook

        before(() => afterSuiteHook = global.__wdio.afterSuite)

        it('should defer execution until promise was resolved', () => {
            let duration = afterSuiteHook.end - afterSuiteHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('after', () => {
        let afterHook

        before(() => afterHook = global.__wdio.after)

        it('should defer execution until promise was resolved', () => {
            let duration = afterHook.end - afterHook.start
            duration.should.be.greaterThan(490)
        })
    })
})

describe('MochaAdapter executes hooks using 3rd party libs (q library)', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new MochaAdapter(0, configQPromises, specs3, configQPromises.capabilities);
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    describe('before', () => {
        let beforeHook

        before(() => beforeHook = global.___wdio.before)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHook.end - beforeHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeSuite', () => {
        let beforeSuiteHook

        before(() => beforeSuiteHook = global.___wdio.beforeSuite)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeSuiteHook.end - beforeSuiteHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeHook', () => {
        let beforeHookHook

        before(() => beforeHookHook = global.___wdio.beforeHook)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHookHook.end - beforeHookHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterHook', () => {
        let afterHookHook

        before(() => afterHookHook = global.___wdio.afterHook)

        it('should defer execution until promise was resolved', () => {
            let duration = afterHookHook.end - afterHookHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeTest', () => {
        let beforeTestHook

        before(() => beforeTestHook = global.___wdio.beforeTest)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeTestHook.end - beforeTestHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeCommand', () => {
        let beforeCommandHook

        before(() => beforeCommandHook = global.___wdio.beforeCommand)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeCommandHook.end - beforeCommandHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterCommand', () => {
        let afterCommandHook

        before(() => afterCommandHook = global.___wdio.afterCommand)

        it('should defer execution until promise was resolved', () => {
            let duration = afterCommandHook.end - afterCommandHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterTest', () => {
        let afterTestHook

        before(() => afterTestHook = global.___wdio.afterTest)

        it('should defer execution until promise was resolved', () => {
            let duration = afterTestHook.end - afterTestHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterSuite', () => {
        let afterSuiteHook

        before(() => afterSuiteHook = global.___wdio.afterSuite)

        it('should defer execution until promise was resolved', () => {
            let duration = afterSuiteHook.end - afterSuiteHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('after', () => {
        let afterHook

        before(() => afterHook = global.___wdio.after)

        it('should defer execution until promise was resolved', () => {
            let duration = afterHook.end - afterHook.start
            duration.should.be.greaterThan(490)
        })
    })
})

describe('MochaAdapter executes custom commands', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new MochaAdapter(0, configCustomCommands, specs4, configCustomCommands.capabilities);
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    it('should defer execution until custom wdio command completes', () => {
        let duration = global.____wdio.customWdio.end - global.____wdio.customWdio.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom wdio promise command resolves', () => {
        let duration = global.____wdio.customWdioPromise.end - global.____wdio.customWdioPromise.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom native promise command resolves', () => {
        let duration = global.____wdio.customNativePromise.end - global.____wdio.customNativePromise.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom q promise command resolves', () => {
        let duration = global.____wdio.customQPromise.end - global.____wdio.customQPromise.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom command wrapping custom wdio command resolves', () => {
        let duration = global.____wdio.customWrapWdio.end - global.____wdio.customWrapWdio.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom command wrapping custom wdio promise command resolves', () => {
        let duration = global.____wdio.customWrapWdioPromise.end - global.____wdio.customWrapWdioPromise.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom command wrapping two native promise commands resolves', () => {
        let duration = global.____wdio.customWrapTwoPromises.end - global.____wdio.customWrapTwoPromises.start
        duration.should.be.greaterThan(1990)
    })

    // Doesn't currently wait: AssertionError: expected 0 to be above 1990
    // See: https://github.com/webdriverio/wdio-sync/issues/16
    it.skip('should defer execution until custom command wrapping wdio comamnd treated as promise resolves', () => {
        let duration = global.____wdio.customHandleWdioAsPromise.end - global.____wdio.customHandleWdioAsPromise.start
        duration.should.be.greaterThan(1990)
    })
})

describe('MochaAdapter executes async hooks', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = { sync: false }
        const adapter = new MochaAdapter(0, configAsyncCommands, specs5, configAsyncCommands.capabilities);
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    describe('before', () => {
        let beforeHook

        before(() => beforeHook = global._____wdio.before)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHook.end - beforeHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeSuite', () => {
        let beforeSuiteHook

        before(() => beforeSuiteHook = global._____wdio.beforeSuite)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeSuiteHook.end - beforeSuiteHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeHook', () => {
        let beforeHookHook

        before(() => beforeHookHook = global._____wdio.beforeHook)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHookHook.end - beforeHookHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterHook', () => {
        let afterHookHook

        before(() => afterHookHook = global._____wdio.afterHook)

        it('should defer execution until promise was resolved', () => {
            let duration = afterHookHook.end - afterHookHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeTest', () => {
        let beforeTestHook

        before(() => beforeTestHook = global._____wdio.beforeTest)

        it('should defer execution until promise was resolved', () => {
            let duration = beforeTestHook.end - beforeTestHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterTest', () => {
        let afterTestHook

        before(() => afterTestHook = global._____wdio.afterTest)

        it('should defer execution until promise was resolved', () => {
            let duration = afterTestHook.end - afterTestHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterSuite', () => {
        let afterSuiteHook

        before(() => afterSuiteHook = global._____wdio.afterSuite)

        it('should defer execution until promise was resolved', () => {
            let duration = afterSuiteHook.end - afterSuiteHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('after', () => {
        let afterHook

        before(() => afterHook = global._____wdio.after)

        it('should defer execution until promise was resolved', () => {
            let duration = afterHook.end - afterHook.start
            duration.should.be.greaterThan(490)
        })
    })
})
