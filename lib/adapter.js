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
const SETTLE_TIMEOUT = 5000

/**
 * Mocha runner
 */
class MochaAdapter {
    constructor (cid, config, specs, capabilities) {
        /**
         * rename requires option to stay backwards compatible
         * ToDo remove with next major release
         */
        if (config.mochaOpts && config.mochaOpts.requires) {
            if (Array.isArray(config.mochaOpts.require)) {
                config.mochaOpts.require.push(config.mochaOpts.requires)
            } else {
                config.mochaOpts.require = config.mochaOpts.requires
            }
        }

        this.cid = cid
        this.capabilities = capabilities
        this.specs = specs
        this.config = Object.assign({
            mochaOpts: {}
        }, config)
        this.runner = {}

        this.sentMessages = 0 // number of messages sent to the parent
        this.receivedMessages = 0 // number of messages received by the parent
        this.messageCounter = 0
        this.messageUIDs = {
            suite: {},
            hook: {},
            test: {}
        }
    }

    options (options, context) {
        let {require = [], compilers = []} = options

        if (typeof require === 'string') {
            require = [require]
        }

        this.requireExternalModules([...compilers, ...require], context)
    }

    async run () {
        let {mochaOpts} = this.config

        if (typeof mochaOpts.ui !== 'string' || !INTERFACES[mochaOpts.ui]) {
            mochaOpts.ui = 'bdd'
        }

        const mocha = new Mocha(mochaOpts)
        mocha.loadFiles()
        mocha.reporter(NOOP)
        mocha.fullTrace()
        this.specs.forEach((spec) => mocha.addFile(spec))

        wrapCommands(global.browser, this.config.beforeCommand, this.config.afterCommand)

        mocha.suite.on('pre-require', (context, file, mocha) => {
            this.options(mochaOpts, {
                context, file, mocha, options: mochaOpts
            })

            INTERFACES[mochaOpts.ui].forEach((fnName) => {
                let testCommand = INTERFACES[mochaOpts.ui][2]

                runInFiberContext(
                    [testCommand, testCommand + '.only'],
                    this.config.beforeHook,
                    this.config.afterHook,
                    fnName
                )
            })
        })

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
        await this.waitUntilSettled()

        return result
    }

    /**
     * Hooks which are added as true Mocha hooks need to call done() to notify async
     */
    wrapHook (hookName) {
        return () => executeHooksWithArgs(
            this.config[hookName],
            this.prepareMessage(hookName)
        ).catch((e) => {
            console.log(`Error in ${hookName} hook`, e.stack)
        })
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
                stack: params.err.stack,
                type: params.err.type || params.err.name,
                expected: params.err.expected,
                actual: params.err.actual
            }
        }

        if (params.payload) {
            message.title = params.payload.title
            message.parent = params.payload.parent ? params.payload.parent.title : null

            /**
             * get title for hooks in root suite
             */
            if (message.parent === '' && params.payload.parent && params.payload.parent.suites) {
                message.parent = params.payload.parent.suites[0].title
            }

            message.fullTitle = params.payload.fullTitle ? params.payload.fullTitle() : message.parent + ' ' + message.title
            message.pending = params.payload.pending || false
            message.file = params.payload.file

            // Add the current test title to the payload for cases where it helps to
            // identify the test, e.g. when running inside a beforeEach hook
            if (params.payload.ctx && params.payload.ctx.currentTest) {
                message.currentTest = params.payload.ctx.currentTest.title
            }

            if (params.type.match(/Test/)) {
                message.passed = (params.payload.state === 'passed')
                message.duration = params.payload.duration
            }
        }

        return message
    }

    requireExternalModules (modules, context) {
        modules.forEach(module => {
            if (module) {
                module = module.replace(/.*:/, '')

                if (module.substr(0, 1) === '.') {
                    module = path.join(process.cwd(), module)
                }

                this.load(module, context)
            }
        })
    }

    emit (event, payload, err) {
        // For some reason, Mocha fires a second 'suite:end' event for the root suite,
        // with no matching 'suite:start', so this can be ignored.
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

        let {uid, parentUid} = this.generateUID(message)
        message.uid = uid
        message.parentUid = parentUid

        // When starting a new test, propagate the details to the test runner so that
        // commands, results, screenshots and hooks can be associated with this test
        if (event === 'test:start') {
            this.sendInternal(event, message)
        }

        this.send(message, null, {}, () => ++this.receivedMessages)
        this.sentMessages++
    }

    generateUID (message) {
        var uid, parentUid

        switch (message.type) {
        case 'suite:start':
            uid = this.getUID(message.title, 'suite', true)
            parentUid = uid
            break

        case 'suite:end':
            uid = this.getUID(message.title, 'suite')
            parentUid = uid
            break

        case 'hook:start':
            uid = this.getUID(message.title, 'hook', true)
            parentUid = this.getUID(message.parent, 'suite')
            break

        case 'hook:end':
            uid = this.getUID(message.title, 'hook')
            parentUid = this.getUID(message.parent, 'suite')
            break

        case 'test:start':
            uid = this.getUID(message.title, 'test', true)
            parentUid = this.getUID(message.parent, 'suite')
            break

        case 'test:pending':
        case 'test:end':
        case 'test:pass':
        case 'test:fail':
            uid = this.getUID(message.title, 'test')
            parentUid = this.getUID(message.parent, 'suite')
            break

        default:
            throw new Error(`Unknown message type : ${message.type}`)
        }

        return {
            uid,
            parentUid
        }
    }

    getUID (title, type, start) {
        if (start !== true && this.messageUIDs[type][title]) {
            return this.messageUIDs[type][title]
        }

        let uid = title + this.messageCounter++

        this.messageUIDs[type][title] = uid

        return uid
    }

    sendInternal (event, message) {
        process.emit(event, message)
    }

    /**
     * reset globals to rewire it out in tests
     */
    send (...args) {
        return process.send.apply(process, args)
    }

    /**
     * wait until all messages were sent to parent
     */
    waitUntilSettled () {
        return new Promise((resolve) => {
            const start = (new Date()).getTime()
            const interval = setInterval(() => {
                const now = (new Date()).getTime()

                if (this.sentMessages !== this.receivedMessages && now - start < SETTLE_TIMEOUT) return
                clearInterval(interval)
                resolve()
            }, 100)
        })
    }

    load (name, context) {
        try {
            module.context = context

            require(name)
        } catch (e) {
            throw new Error(`Module ${name} can't get loaded. Are you sure you have installed it?\n` +
                            `Note: if you've installed WebdriverIO globally you need to install ` +
                            `these external modules globally too!`)
        }
    }
}

const _MochaAdapter = MochaAdapter
const adapterFactory = {}

adapterFactory.run = async function (cid, config, specs, capabilities) {
    const adapter = new _MochaAdapter(cid, config, specs, capabilities)
    const result = await adapter.run()
    return result
}

export default adapterFactory
export { MochaAdapter, adapterFactory }
