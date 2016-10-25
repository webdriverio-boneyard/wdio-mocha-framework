import { MochaAdapter } from '../lib/adapter'

const WebdriverIO = class {}
const NOOP = () => {}
process.send = NOOP

const adapter = (mochaOpts, spec) => {
    return new MochaAdapter(0, { mochaOpts }, [ spec ], {})
}

const module = (name) => {
    return `./test/fixtures/tests.options.${name}`
}

describe('Options', () => {
    global.browser = new WebdriverIO()

    it('should apply module', async () => {
        const options = { require: module('require') }
        const actual = (await adapter(options, module('require.spec')).run())

        actual.should.be.equal(0, 'actual test failed')
    })

    it('should apply modules', async () => {
        for (let option of ['compilers', 'require']) {
            const options = { [option]: [module(option)] }
            const actual = (await adapter(options, module(`${option}.spec`)).run())

            actual.should.be.equal(0, `actual test "${option}" failed`)
        }
    })
})
