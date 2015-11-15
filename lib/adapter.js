import path from 'path'
import Mocha from 'mocha'

import { runInFiberContext, wrapCommand, runHook, wrapFn } from 'wdio-sync'

const INTERFACES = {
    bdd: ['before', 'beforeEach', 'it', 'after', 'afterEach'],
    tdd: ['suiteSetup', 'setup', 'test', 'suiteTeardown', 'teardown']
}

const EVENTS = {
    'suite': 'suite:start',
    'suite end': 'suite:end',
    'test': 'test:start',
    'test end': 'test:end',
    'hook': 'hook:start',
    'hook end': 'hook:end',
    'pass': 'test:pass',
    'fail': 'test:fail',
    'pending': 'test:pending'
}

const NOOP = function () {}

/**
 * Mocha runner
 */
class MochaAdapter {
    constructor (cid, config, specs, capabilities) {
        this.cid = cid
        this.capabilities = capabilities
        this.specs = specs
        this.config = Object.assign({
            mochaOpts: {}
        }, config)
        this.runner = null
    }

    async run () {
        if (typeof this.config.mochaOpts.ui !== 'string' || !this.config.mochaOpts.ui.match(/(bdd|tdd)/i)) {
            this.config.mochaOpts.ui = 'bdd'
        }

        const mocha = new Mocha(this.config.mochaOpts)
        mocha.loadFiles()
        delete this.runner.lastError
        mocha.reporter(NOOP)

        this.requireExternalModules(this.config.mochaOpts.compilers, this.config.mochaOpts.requires)

        const hooks = {
            beforeHook: wrapFn(this.wrapHook.bind(this, 'beforeHook', 'internal')),
            afterHook: wrapFn(this.wrapHook.bind(this, 'afterHook', 'internal')),
            beforeCommand: wrapFn(this.wrapHook.bind(this, 'beforeCommand', 'internal')),
            afterCommand: wrapFn(this.wrapHook.bind(this, 'afterCommand', 'internal'))
        }

        wrapCommand(global.browser, hooks)

        this.specs.forEach((spec) => mocha.addFile(spec))
        mocha.suite.on('pre-require', () => INTERFACES[this.config.mochaOpts.ui].forEach(
            runInFiberContext.bind(null, INTERFACES, this.config.mochaOpts.ui, hooks))
        )

        await this.wrapHook('before')
        let result = await new Promise((resolve, reject) => {
            this.runner = mocha.run(resolve)

            Object.keys(EVENTS).forEach((e) =>
                this.runner.on(e, this.emit.bind(this, EVENTS[e])))

            this.runner.suite.beforeAll(this.wrapHook('beforeSuite', 'suite'))
            this.runner.suite.beforeEach(this.wrapHook('beforeTest', 'test'))
            this.runner.suite.afterEach(this.wrapHook('afterTest', 'test'))
            this.runner.suite.afterAll(this.wrapHook('afterSuite', 'suite'))
        })
        await this.wrapHook('after')
        return result
    }

    wrapHook (hookName, hookType, data = {}) {
        const hookFn = this.config[hookName]

        // Hooks which are added as true Mocha hooks need to call done() to notify async
        // completion.
        if (['test', 'suite'].indexOf(hookType) >= 0) {
            return (done) => {
                const boundHook = hookFn.bind(null, this.prepareMessage(hookName, hookType, data))
                runHook(boundHook, done)
            }
        }
        const boundHook = hookFn.bind(null, this.prepareMessage(hookName, hookType, data))
        return runHook(boundHook)
    }

    prepareMessage (hookName, hookType, data = {}) {
        const params = { type: hookName, data }

        if (this.runner) {
            let payload
            switch (hookType) {
            case 'suite':
                payload = this.runner.suite.suites[0]
                break
            case 'test':
                payload = this.runner.test
                break
            default:
                payload = this.runner.currentRunnable
                break
            }

            params.payload = payload
            params.err = this.runner.lastError

        // Useful to know the actual spec files currently being run
        } else if (hookName === 'before') {
            params.data.specs = this.specs
        }

        return this.formatMessage(params)
    }

    formatMessage (params) {
        let message = {
            type: params.type
        }

        if (params.err) {
            message.err = {
                message: params.err.message,
                stack: params.err.stack
            }
        }

        if (params.payload) {
            message.title = params.payload.title
            message.parent = params.payload.parent ? params.payload.parent.title : null
            message.pending = params.payload.pending || false
            message.file = params.payload.file
            message.duration = params.payload.duration
            message.passed = (params.payload.state === 'passed')
        }

        if (params.data) {
            message = Object.assign(message, params.data)
        }

        return message
    }

    requireExternalModules (compilers = [], requires = []) {
        compilers.concat(requires).forEach((mod) => {
            mod = mod.split(':')
            mod = mod[mod.length - 1]

            if (mod[0] === '.') {
                mod = path.join(process.cwd(), mod)
            }

            this.load(mod)
        })
    }

    emit (event, payload, err) {
        let message = this.formatMessage({type: event, payload, err})

        message.cid = this.cid
        message.event = event
        message.runner = {}
        message.runner[this.cid] = this.capabilities

        if (err) {
            this.runner.lastError = err
        } else if (event === 'test:start') {
            delete this.runner.lastError
        }
        this.send(message)
    }

    /**
     * reset globals to rewire it out in tests
     */
    send (...args) {
        return process.send.apply(process, args)
    }

    load (module) {
        try {
            require(module)
        } catch (e) {
            throw new Error(`Module ${module} can't get loaded. Are you sure you have installed it?\n` +
                            `Note: if you've installed WebdriverIO globally you need to install ` +
                            `these external modules globally too!`)
        }
    }
}

const adapterFactory = {}
adapterFactory.run = async function mochaAdapter (cid, config, specs, capabilities) {
    const adapter = new MochaAdapter(cid, config, specs, capabilities)
    return await adapter.run()
}

export default adapterFactory
