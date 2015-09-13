import path from 'path';
import Mocha from 'mocha';

const INTERFACES = {
    bdd: ['before', 'beforeEach', 'it', 'after', 'afterEach'],
    tdd: ['suiteSetup', 'setup', 'test', 'suiteTeardown', 'teardown']
};

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
};

const DONOTHING = function() {};

let adapter;

/**
 * Mocha runner
 */
adapter.run = async function(cid, config, specs, capabilities) {
    let compilers = config.mochaOpts.compilers || [];
    let requires = config.mochaOpts.require || [];
    let runner;

    if(config.mochaOpts && typeof config.mochaOpts.ui !== 'string' || !config.mochaOpts.ui.match(/(bdd|tdd)/i)) {
        config.mochaOpts.ui = 'bdd';
    }

    const mocha = new Mocha(config.mochaOpts);
    mocha.loadFiles();
    mocha.reporter(DONOTHING);

    compilers.concat(requires).forEach((mod) => {
        mod = mod.split(':');
        mod = mod[mod.length - 1];

        if (mod[0] === '.') {
            mod = path.join(process.cwd(), mod);
        }

        require(mod);
    });

    specs.forEach((spec) => mocha.addFile(spec));
    mocha.suite.on('pre-require', () => interfaces[config.mochaOpts.ui].forEach(runInFiberContext.bind(null, config.mochaOpts.ui)));

    /**
     * ToDo: run before hook in fiber context
     */

    try {
        runner = mocha.run(defer.resolve.bind(defer));
    } catch(e) {
        defer.reject(e);
    }

    Object.keys(EVENTS).forEach((e) => {
        runner.on(e, (payload, err) => {
            let error;

            if(err) {
                error = {
                    message: err.message,
                    stack: err.stack,
                };
            }

            let message = {
                event: events[e],
                cid: cid,
                title: payload.title,
                pending: payload.pending || false,
                parent: payload.parent ? payload.parent.title : null,
                type: payload.tests ? 'suite' : 'test',
                file: payload.file,
                err: error,
                duration: payload.duration,
                runner: {}
            };

            message.runner[cid] = capabilities;
            process.send(message);
        });
    });
};

export default adapter;
