import path from 'path'
import Mocha from 'mocha'

import { runInFiberContext, wrapCommands, executeHooksWithArgs } from 'wdio-sync'

const INTERFACES = {
    bdd: ['before', 'beforeEach', 'it', 'after', 'afterEach'],
    tdd: ['suiteSetup', 'setup', 'test', 'suiteTeardown', 'teardown'],
    qunit: ['before', 'beforeEach', 'test', 'after', 'afterEach']
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
        this.runner = {}
    }

    async run () {
        if (typeof this.config.mochaOpts.ui !== 'string' || !INTERFACES[this.config.mochaOpts.ui]) {
            this.config.mochaOpts.ui = 'bdd'
        }

        const mocha = new Mocha(this.config.mochaOpts)
        mocha.loadFiles()
        mocha.reporter(NOOP)
        mocha.fullTrace()
        this.specs.forEach((spec) => mocha.addFile(spec))

        this.requireExternalModules(this.config.mochaOpts.compilers, this.config.mochaOpts.requires)
        wrapCommands(global.browser, this.config.beforeCommand, this.config.afterCommand)
        mocha.suite.on('pre-require', () => INTERFACES[this.config.mochaOpts.ui].forEach((fnName) => {
            runInFiberContext(
                INTERFACES[this.config.mochaOpts.ui][2],
                this.config.beforeHook,
                this.config.afterHook,
                fnName
            )
        }))

        await executeHooksWithArgs(this.config.before, [this.capabilities, this.specs])
        let result = await new Promise((resolve, reject) => {
            this.runner = mocha.run(resolve)

            Object.keys(EVENTS).forEach((e) =>
                this.runner.on(e, this.emit.bind(this, EVENTS[e])))

            this.runner.suite.beforeAll(this.wrapHook('beforeSuite'))
            this.runner.suite.beforeEach(this.wrapHook('beforeTest'))
            this.runner.suite.afterEach(this.wrapHook('afterTest'))
            this.runner.suite.afterAll(this.wrapHook('afterSuite'))
        })
        await executeHooksWithArgs(this.config.after, [result, this.capabilities, this.specs])
        return result
    }

    /**
     * Hooks which are added as true Mocha hooks need to call done() to notify async
     */
    wrapHook (hookName) {
        return (done) => executeHooksWithArgs(
            this.config[hookName],
            this.prepareMessage(hookName)
        ).then(() => done())
    }

    prepareMessage (hookName) {
        const params = { type: hookName }

        switch (hookName) {
        case 'beforeSuite':
        case 'afterSuite':
            params.payload = this.runner.suite.suites[0]
            break
        case 'beforeTest':
        case 'afterTest':
            params.payload = this.runner.test
            break
        }

        params.err = this.runner.lastError
        delete this.runner.lastError
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

            if (params.type.match(/Test/)) {
                message.passed = (params.payload.state === 'passed')
                message.duration = params.payload.duration
            }
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
        // REVIEW - don't emit events for root test suite
        if (payload.root) return

        let message = this.formatMessage({type: event, payload, err})

        message.cid = this.cid
        message.specs = this.specs
        message.event = event
        message.runner = {}
        message.runner[this.cid] = this.capabilities

        if (err) {
            this.runner.lastError = err
        }
        process.emit(event, message)
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

const _MochaAdapter = MochaAdapter
const adapterFactory = {}

adapterFactory.run = async function (cid, config, specs, capabilities) {
    const adapter = new _MochaAdapter(cid, config, specs, capabilities)
    return await adapter.run()
}

export default adapterFactory
export { MochaAdapter, adapterFactory }
