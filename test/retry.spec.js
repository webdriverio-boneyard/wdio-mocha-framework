import { MochaAdapter } from '../lib/adapter'

const syncSpecs = ['./test/fixtures/tests.retry.sync.spec.js']
const asyncSpecs = ['./test/fixtures/tests.retry.async.spec.js']
const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    pause: (ms = 500) => new Promise((resolve) => setTimeout(() => resolve(), ms)),
    command: (ms = 500) => new Promise((resolve) => setTimeout(() => resolve('foo'), ms)),
    getPrototype: () => WebdriverIO.prototype
}

const MOCHA_OPTS = {
    mochaOpts: {
        timeout: 10000
    }
}
process.send = NOOP

describe('retries flaky tests', () => {
    it('should be able to retry flaky sync tests', async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new MochaAdapter(0, MOCHA_OPTS, syncSpecs, {});
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    it('should be able to retry flaky async tests', async () => {
        global.browser = new WebdriverIO()
        global.browser.options = { sync: false }
        const adapter = new MochaAdapter(0, MOCHA_OPTS, asyncSpecs, {});
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })
})
