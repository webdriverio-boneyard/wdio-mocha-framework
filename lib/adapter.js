import path from 'path'
import Mocha from 'mocha'

import { runInFiberContext, wrapCommand, runHook } from 'wdio-sync'

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

    if (typeof config.mochaOpts.ui !== 'string' || !config.mochaOpts.ui.match(/(bdd|tdd)/i)) {
        config.mochaOpts.ui = 'bdd'
    }

    const mocha = new Mocha(config.mochaOpts)
    mocha.loadFiles()
    mocha.reporter(DONOTHING)

    adapter.requireExternalModules(compilers, requires)

    wrapCommand(global.browser)

    specs.forEach((spec) => mocha.addFile(spec))
    mocha.suite.on('pre-require', () => INTERFACES[config.mochaOpts.ui].forEach(runInFiberContext.bind(null, INTERFACES, config.mochaOpts.ui)))

    const hookWrapper = adapter.wrapHook.bind(null, config, specs)

    await hookWrapper(config.before)
    let result = await new Promise((resolve, reject) => {
        runner = mocha.run(resolve)
        Object.keys(EVENTS).forEach((e) => runner.on(e, adapter.emit.bind(null, runner, EVENTS[e], cid, capabilities)))
        runner.suite.beforeAll(hookWrapper(config.beforeSuite, runner, 'suite'))
        runner.suite.beforeEach(hookWrapper(config.beforeTest, runner, 'test'))
        runner.suite.afterEach(hookWrapper(config.afterTest, runner, 'test'))
        runner.suite.afterAll(hookWrapper(config.afterSuite, runner, 'suite'))
    })
    await hookWrapper(config.after)
    return result
}

adapter.wrapHook = function (config, specs, hookFn, runner, type) {
    if (runner) {
        return function (done) {
            let message = adapter.formatMessage({
                payload: (type === 'test' ? runner.test : runner.suite.suites[0]),
                err: runner.lastError
            })
            runHook(hookFn.bind(null, message), done)
        }
    }
    return runHook(hookFn.bind(null, config, specs))
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
    if (params.err) {
        params.err = {
            message: params.err.message,
            stack: params.err.stack
        }
    }

    let message = {
        err: params.err,
        title: params.payload.title,
        pending: params.payload.pending || false,
        parent: params.payload.parent ? params.payload.parent.title : null,
        type: params.payload.tests ? 'suite' : 'test',
        file: params.payload.file,
        duration: params.payload.duration,
        passed: (params.payload.state === 'passed')
    }

    return message
}

adapter.emit = function (runner, event, cid, capabilities, payload, err) {
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
