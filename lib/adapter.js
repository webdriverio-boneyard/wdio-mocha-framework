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
var require = require
var process = process

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
        Object.keys(EVENTS).forEach((e) => runner.on(e, adapter.emit.bind(null, EVENTS[e], cid, capabilities)))
    })
    await runHook(config.after)
    return result
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

adapter.emit = function (event, cid, capabilities, payload, err) {
    if (err) {
        err = {
            message: err.message,
            stack: err.stack
        }
    }

    let message = {
        event,
        cid,
        err,
        title: payload.title,
        pending: payload.pending || false,
        parent: payload.parent ? payload.parent.title : null,
        type: payload.tests ? 'suite' : 'test',
        file: payload.file,
        duration: payload.duration,
        runner: {}
    }

    message.runner[cid] = capabilities
    process.send(message)
}

export default adapter
