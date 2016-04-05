import { MochaAdapter } from '../lib/adapter'

const syncSpecs = ['./test/fixtures/tests.sync.spec.js']
const asyncSpecs = ['./test/fixtures/tests.async.spec.js']
const syncAsyncSpecs = ['./test/fixtures/tests.sync.async.spec.js']
const onlySpecs = ['./test/fixtures/tests.only.spec.js']
const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    pause: (ms = 500) => new Promise((r) => setTimeout(() => r(), ms)),
    command: (ms = 500) => new Promise((r) => setTimeout(() => r('foo'), ms)),
    getPrototype: () => WebdriverIO.prototype
}

process.send = NOOP

describe('MochaAdapter', () => {
    describe('executes specs synchronous', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            global.browser.options = {}
            const adapter = new MochaAdapter(0, {}, syncSpecs, {});
            (await adapter.run()).should.be.equal(0, 'actual test failed')
        })

        it('should run sync commands in beforeEach blocks', () => {
            global._____wdio.beforeEach.should.be.greaterThan(499)
        })

        it('should run sync commands in before blocks', () => {
            global._____wdio.before.should.be.greaterThan(499)
        })

        it('should run sync commands in it blocks', () => {
            global._____wdio.it.should.be.greaterThan(499)
        })

        it('should run sync commands in nested it blocks', () => {
            global._____wdio.nestedit.should.be.greaterThan(499)
        })

        it('should run sync commands in after blocks', () => {
            global._____wdio.after.should.be.greaterThan(499)
        })

        it('should run sync commands in afterEach blocks', () => {
            global._____wdio.afterEach.should.be.greaterThan(499)
        })
    })

    describe('executes specs asynchronous', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            global.browser.options = { sync: false }
            const adapter = new MochaAdapter(0, {}, asyncSpecs, {});
            (await adapter.run()).should.be.equal(0, 'actual test failed')
        })

        it('should run async commands in beforeEach blocks', () => {
            global.______wdio.beforeEach.should.be.greaterThan(499)
        })

        it('should run async commands in before blocks', () => {
            global.______wdio.before.should.be.greaterThan(499)
        })

        it('should run async commands in it blocks', () => {
            global.______wdio.it.should.be.greaterThan(499)
        })

        it('should run async commands in nested it blocks', () => {
            global.______wdio.nestedit.should.be.greaterThan(499)
        })

        it('should run async commands in after blocks', () => {
            global.______wdio.after.should.be.greaterThan(499)
        })

        it('should run async commands in afterEach blocks', () => {
            global.______wdio.afterEach.should.be.greaterThan(499)
        })
    })

    describe('executes specs synchronous and asynchronous', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            global.browser.options = {}
            const adapter = new MochaAdapter(0, {}, syncAsyncSpecs, {});
            (await adapter.run()).should.be.equal(0, 'actual test failed')
        })

        it('should run sync commands in beforeEach blocks', () => {
            global._______wdio.beforeEachSync.should.be.greaterThan(499)
            global._______wdio.beforeEachAsync.should.be.greaterThan(499)
        })

        it('should run sync commands in before blocks', () => {
            global._______wdio.beforeSync.should.be.greaterThan(499)
            global._______wdio.beforeAsync.should.be.greaterThan(499)
        })

        it('should run sync commands in it blocks', () => {
            global._______wdio.itSync.should.be.greaterThan(499)
            global._______wdio.itAsync.should.be.greaterThan(499)
        })

        it('should run sync commands in after blocks', () => {
            global._______wdio.afterSync.should.be.greaterThan(499)
            global._______wdio.afterAsync.should.be.greaterThan(499)
        })

        it('should run sync commands in afterEach blocks', () => {
            global._______wdio.afterEachSync.should.be.greaterThan(499)
            global._______wdio.afterEachAsync.should.be.greaterThan(499)
        })
    })

    describe('MochaAdapter can execute it.only and it.skip', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            const adapter = new MochaAdapter(0, {}, onlySpecs, {});
            (await adapter.run()).should.be.equal(0, 'actual test failed')
        })

        it('should not have executed the it.skip block', () => {
            (typeof global.mochaExtra.itskip).should.be.equal('undefined')
        })

        it('should not have executed the it block', () => {
            (typeof global.mochaExtra.it).should.be.equal('undefined')
        })

        it('should run forced it block', () => {
            global.mochaExtra.itonly.should.be.greaterThan(499)
        })
    })
})
