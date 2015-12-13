import { MochaAdapter } from '../lib/adapter'

const specs = ['./test/fixtures/tests.spec.js']
const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    pause: (ms = 500) => new Promise((r) => {
        setTimeout(() => r(), ms)
    })
}

process.send = NOOP

describe('MochaAdapter executes specs asyncronous', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        const adapter = new MochaAdapter(0, {}, specs, {})
        await adapter.run()
    })

    it('should run async commands in beforeEach blocks', () => {
        global._____wdio.beforeEach.should.be.greaterThan(499)
    })

    it('should run async commands in before blocks', () => {
        global._____wdio.before.should.be.greaterThan(499)
    })

    it('should run async commands in it blocks', () => {
        global._____wdio.it.should.be.greaterThan(499)
    })

    it('should run async commands in nested it blocks', () => {
        global._____wdio.nestedit.should.be.greaterThan(499)
    })

    it('should run async commands in after blocks', () => {
        global._____wdio.after.should.be.greaterThan(499)
    })

    it('should run async commands in afterEach blocks', () => {
        global._____wdio.afterEach.should.be.greaterThan(499)
    })
})
