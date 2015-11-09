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

/**
 * mimik globals to rewire it out in tests
 */
const require = require
const process = process

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

    await runHook(config.before)
    let result = await new Promise((resolve, reject) => {
        runner = mocha.run(resolve)
        Object.keys(EVENTS).forEach((e) => runner.on(e, adapter.emit.bind(null, runner, EVENTS[e], cid, capabilities)))
        runner.suite.afterEach(adapter.afterEach.call(null, runner, cid, capabilities, config))
    })
    await runHook(config.after)
    return result
}

adapter.afterEach = function (runner, cid, capabilities, config) {
    return function (done) {
        let message = adapter.formatMessage({
            cid,
            capabilities,
            payload: this.currentTest,
            err: runner.lastError
        })
        runHook(config.afterTest.bind(null, message), done)
    }
}

adapter.requireExternalModules = function (compilers = [], requires = []) {
    compilers.concat(requires).forEach((mod) => {
        mod = mod.split(':')
        mod = mod[mod.length - 1]

        if (mod[0] === '.') {
            mod = path.join(process.cwd(), mod)
        }

        require(mod)
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
        cid: params.cid,
        err: params.err,
        title: params.payload.title,
        pending: params.payload.pending || false,
        parent: params.payload.parent ? params.payload.parent.title : null,
        type: params.payload.tests ? 'suite' : 'test',
        file: params.payload.file,
        duration: params.payload.duration,
        passed: (params.payload.state === 'passed'),
        runner: {}
    }

    message.runner[params.cid] = params.capabilities
    return message
}

adapter.emit = function (runner, event, cid, capabilities, payload, err) {
    let message = adapter.formatMessage({cid, capabilities, payload, err})
    message.event = event

    if (err) {
        runner.lastError = err
    } else if (event === 'test:start') {
        delete runner.lastError
    }

    process.send(message)
}

export default adapter
