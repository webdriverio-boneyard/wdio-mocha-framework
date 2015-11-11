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

const DONOTHING = function () {}

let adapter = {}

/**
 * Mocha runner
 */
adapter.run = async function mochaAdapter (cid, config = { mochaOpts: {} }, specs = [], capabilities) {
    let compilers = config.mochaOpts.compilers
    let requires = config.mochaOpts.require
    let runner

    function prepareMessage (name, hookType, data) {
        if (runner) {
            let payload
            switch (hookType) {
            case 'suite':
                payload = runner.suite.suites[0]
                break

            case 'test':
                payload = runner.test
                break

            default:
                payload = runner.currentRunnable
                break
            }

            return adapter.formatMessage({
                name,
                payload,
                data,
                err: runner.lastError
            })
        }

        return adapter.formatMessage({
            name,
            data,
            config,
            specs
        })
    }

    function wrapHook (hookName, hookType, data = {}) {
        const hookFn = config[hookName]

        // Hooks which are added as true Mocha hooks need to call done() to notify async
        // completion.
        if (['test', 'suite'].indexOf(hookType) >= 0) {
            return function (done) {
                const boundHook = hookFn.bind(null, prepareMessage(hookName, hookType, data))
                runHook(boundHook, done)
            }
        }
        const boundHook = hookFn.bind(null, prepareMessage(hookName, hookType, data))
        return runHook(boundHook)
    }

    if (typeof config.mochaOpts.ui !== 'string' || !config.mochaOpts.ui.match(/(bdd|tdd)/i)) {
        config.mochaOpts.ui = 'bdd'
    }

    const mocha = new Mocha(config.mochaOpts)
    mocha.loadFiles()
    mocha.reporter(DONOTHING)

    adapter.requireExternalModules(compilers, requires)

    const hooks = {
        beforeHook: wrapFn(wrapHook.bind(null, 'beforeHook', 'internal')),
        afterHook: wrapFn(wrapHook.bind(null, 'afterHook', 'internal')),
        beforeCommand: wrapFn(wrapHook.bind(null, 'beforeCommand', 'internal')),
        afterCommand: wrapFn(wrapHook.bind(null, 'afterCommand', 'internal'))
    }

    wrapCommand(global.browser, hooks)

    specs.forEach((spec) => mocha.addFile(spec))
    mocha.suite.on('pre-require', () => INTERFACES[config.mochaOpts.ui].forEach(runInFiberContext.bind(null, INTERFACES, config.mochaOpts.ui, hooks)))

    await wrapHook('before')
    let result = await new Promise((resolve, reject) => {
        runner = mocha.run(resolve)
        Object.keys(EVENTS).forEach((e) => runner.on(e, adapter.emit.bind(null, EVENTS[e], runner, cid, capabilities)))

        runner.suite.beforeAll(wrapHook('beforeSuite', 'suite'))
        runner.suite.beforeEach(wrapHook('beforeTest', 'test'))
        runner.suite.afterEach(wrapHook('afterTest', 'test'))
        runner.suite.afterAll(wrapHook('afterSuite', 'suite'))
    })
    await wrapHook('after')
    return result
}

adapter.requireExternalModules = function (compilers = [], requires = []) {
    compilers.concat(requires).forEach((mod) => {
        mod = mod.split(':')
        mod = mod[mod.length - 1]

        if (mod[0] === '.') {
            mod = path.join(process.cwd(), mod)
        }

        adapter.load(mod)
    })
}

adapter.formatMessage = function (params) {
    let message = {}

    if (params.err) {
        message.err = {
            message: params.err.message,
            stack: params.err.stack
        }
    }

    if (params.payload) {
        message.title = params.payload.title
        message.pending = params.payload.pending || false
        message.parent = params.payload.parent ? params.payload.parent.title : null
        message.type = params.payload.tests ? 'suite' : 'test'
        message.file = params.payload.file
        message.duration = params.payload.duration
        message.passed = (params.payload.state === 'passed')
    }

    message.config = params.config
    message.specs = params.specs

    if (params.data) {
        for (let key in params.data) {
            message[key] = params.data[key]
        }
    }

    return message
}

adapter.emit = function (event, runner, cid, capabilities, payload, err) {
    let message = adapter.formatMessage({payload, err})

    message.cid = cid
    message.event = event
    message.runner = {}
    message.runner[cid] = capabilities

    if (err) {
        runner.lastError = err
    } else if (event === 'test:start') {
        delete runner.lastError
    }
    adapter.send(message)
}

/**
 * reset globals to rewire it out in tests
 */
adapter.send = (process.send || DONOTHING).bind(process)
adapter.load = function (module) {
    try {
        require(module)
    } catch (e) {
        throw new Error(`Module ${module} can't get loaded. Are you sure you have installed it?\n` +
                        `Note: if you've installed WebdriverIO globally you need to install ` +
                        `these external modules globally too!`)
    }
}

export default adapter
