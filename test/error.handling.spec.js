import { MochaAdapter } from '../lib/adapter'

const errorHandlingSpecs = ['./test/fixtures/error.handling.spec.js']
const errorHandlingPromiseSpecs = ['./test/fixtures/error.handling.promise.spec.js']
const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    pause: (ms = 500) => new Promise((r) => setTimeout(() => r(), ms)),
    command: (ms = 500) => new Promise((r) => setTimeout(() => r('foo'), ms)),
    getPrototype: () => WebdriverIO.prototype
}

process.send = NOOP

describe('ignores service hook errors', () => {
    it('should ignore directly thrown errors', async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new MochaAdapter('0a', {
            beforeSuite: () => { throw new Error('beforeSuite failed') },
            beforeHook: () => { throw new Error('beforeHook failed') },
            beforeTest: () => { throw new Error('beforeTest failed') },
            beforeCommand: () => { throw new Error('beforeCommand failed') },
            afterCommand: () => { throw new Error('beforeCommand failed') },
            afterTest: () => { throw new Error('afterTest failed') },
            afterHook: () => { throw new Error('afterHook failed') },
            afterSuite: () => { throw new Error('afterSuite failed') }
        }, errorHandlingSpecs, {});
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    it('should ignore rejected promises', async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new MochaAdapter('0a', {
            beforeSuite: () => Promise.reject(new Error('beforeSuite failed')),
            beforeHook: () => Promise.reject(new Error('beforeHook failed')),
            beforeTest: () => Promise.reject(new Error('beforeTest failed')),
            beforeCommand: () => Promise.reject(new Error('beforeCommand failed')),
            afterCommand: () => Promise.reject(new Error('beforeCommand failed')),
            afterTest: () => Promise.reject(new Error('afterTest failed')),
            afterHook: () => Promise.reject(new Error('afterHook failed')),
            afterSuite: () => Promise.reject(new Error('afterSuite failed'))
        }, errorHandlingPromiseSpecs, {});
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })
})
