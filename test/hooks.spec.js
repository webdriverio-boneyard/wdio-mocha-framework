import config from './fixtures/sample.conf'
import adapterFactory from '../lib/adapter'

const specs = ['./test/fixtures/sample.spec.js']
const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    command: (a) => new Promise((r) => {
        setTimeout(() => r(a + 1), 2000)
    })
}
global.browser = new WebdriverIO()

process.send = NOOP

describe('MochaAdapter executes hooks', () => {
    before(async () => {
        await adapterFactory.run(0, config, specs, config.capabilities)
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
            beforeHook.args[0].should.be.equal(config.capabilities)
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
            afterHook.args[0].should.be.equal(config.capabilities)
            afterHook.args[1].should.be.equal(specs)
        })
    })
})
