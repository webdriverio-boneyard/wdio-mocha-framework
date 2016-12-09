import sinon from 'sinon'
import { adapterFactory, MochaAdapter } from '../lib/adapter'

/**
 * create mocks
 */
const NOOP = function () {}
let Mocka = sinon.spy()

let addFile = Mocka.prototype.addFile = sinon.spy()
let loadFiles = Mocka.prototype.loadFiles = sinon.spy()
let reporter = Mocka.prototype.reporter = sinon.stub()
let run = Mocka.prototype.run = sinon.stub()
let fullTrace = Mocka.prototype.fullTrace = sinon.stub()

run.returns({
    on: NOOP,
    suite: {
        beforeAll: NOOP,
        beforeEach: NOOP,
        afterEach: NOOP,
        afterAll: NOOP
    }
})

Mocka.prototype.suite = { on: NOOP }

describe('mocha adapter', () => {
    before(() => {
        adapterFactory.__Rewire__('Mocha', Mocka)
        adapterFactory.__Rewire__('wrapCommands', NOOP)
        adapterFactory.__Rewire__('runInFiberContext', NOOP)
        adapterFactory.__Rewire__('executeHooksWithArgs', NOOP)
    })

    describe('factory', () => {
        let MockaAdapter = sinon.spy()
        let run = MockaAdapter.prototype.run = sinon.spy()

        before(() => {
            adapterFactory.__set__('_MochaAdapter', MockaAdapter)
            adapterFactory.run(1, 2, 3, 4)
        })

        it('should create an adapter instance', () => {
            MockaAdapter.calledWith(1, 2, 3, 4).should.be.true()
        })

        it('should immediatelly start run sequenz', () => {
            run.called.should.be.true()
        })

        after(() => {
            adapterFactory.__ResetDependency__('_MochaAdapter')
        })
    })

    describe('MochaAdapter', () => {
        let adapter, load, send, sendInternal, originalCWD

        let cid = 1
        const title = 'mocha-tests'
        let config = { framework: 'mocha', title: title }
        let specs = ['fileA.js', 'fileB.js']
        let caps = { browserName: 'chrome' }

        before(() => {
            originalCWD = process.cwd
            Object.defineProperty(process, 'cwd', {
                value: function () { return '/mypath' }
            })
        })

        beforeEach(() => {
            adapter = new MochaAdapter(cid, config, specs, caps)
            load = adapter.load = sinon.spy()
            send = adapter.send = sinon.stub()
            send.returns(true)

            sendInternal = adapter.sendInternal = sinon.spy()
        })

        describe('can load external modules', () => {
            it('should do nothing if no modules are required', () => {
                adapter.requireExternalModules([])
                load.called.should.be.false()
            })

            it('should throw an exception if passed invalid name', () => {
                adapter.requireExternalModules.bind(adapter, [1]).should.throw()
            })

            it('should do nothing if no compilers', () => {
                adapter.options({ compilers: [], require: [] })
                load.called.should.be.false()
                load.called.should.be.false()
            })

            it('should load modules', () => {
                let context = { context: true }

                adapter.options({
                    require: './lib/moduleA',
                    compilers: ['js:moduleB', './lib/moduleC']
                }, context)

                load.calledWith('/mypath/lib/moduleA', context).should.be.true()
                load.calledWith('moduleB', context).should.be.true()
                load.calledWith('/mypath/lib/moduleC', context).should.be.true()
            })
        })

        describe('sends event messages', () => {
            it('should have proper message payload', () => {
                let err = { unAllowedProp: true, message: 'Uuups' }
                adapter.emit('suite:start', config, err)

                let msg = send.firstCall.args[0]
                msg.type.should.be.exactly('suite:start')
                msg.cid.should.be.exactly(cid)
                msg.uid.should.startWith(title)
                msg.specs.should.be.exactly(specs)
                msg.runner[cid].should.be.exactly(caps)
                msg.err.should.not.have.property('unAllowedProp')
                msg.err.message.should.be.exactly('Uuups')
            })

            it('should not emit an internal message by default', () => {
                adapter.emit('suite:start', config)
                sendInternal.called.should.be.false()
            })

            it('should emit an internal message when starting a test', () => {
                adapter.emit('test:start', config)
                let event = sendInternal.firstCall.args[0]
                event.should.be.exactly('test:start')

                let msg = sendInternal.firstCall.args[1]
                msg.cid.should.be.exactly(cid)
                msg.uid.should.startWith(title)
                msg.specs.should.be.exactly(specs)
                msg.runner[cid].should.be.exactly(caps)
            })

            it('should not emit any messages for root test suite events', () => {
                adapter.emit('suite:end', { root: true })
                send.called.should.be.false()
                sendInternal.called.should.be.false()
            })
        })

        describe('runs Mocha tests', () => {
            it('should run return right amount of errors', () => {
                let promise = adapter.run().then((failures) => {
                    failures.should.be.exactly(1234)
                })
                process.nextTick(() => run.callArgWith(0, 1234))
                return promise
            })

            it('should load files, wrap commands and run hooks', () => {
                loadFiles.called.should.be.true()
                addFile.called.should.be.true()
                reporter.called.should.be.true()
                fullTrace.called.should.be.true()
            })
        })

        it('should wait until all events were sent', () => {
            const start = (new Date()).getTime()
            let promise = adapter.run().then((failures) => {
                const end = (new Date()).getTime();
                (end - start).should.be.greaterThan(500)
                failures.should.be.exactly(1234)
            })
            adapter.emit('suite:start', {}, {})
            adapter.emit('suite:end', {}, {})
            process.nextTick(() => run.callArgWith(0, 1234))

            setTimeout(() => {
                send.args[0][3]()
                send.args[1][3]()
            }, 500)

            return promise
        })

        after(() => {
            Object.defineProperty(process, 'cwd', {
                value: originalCWD
            })
        })
    })

    after(() => {
        adapterFactory.__ResetDependency__('Mocha')
        adapterFactory.__ResetDependency__('wrapCommands')
        adapterFactory.__ResetDependency__('runInFiberContext')
        adapterFactory.__ResetDependency__('executeHooksWithArgs')
    })
})
