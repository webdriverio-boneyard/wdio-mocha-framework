import sinon from 'sinon'
import adapter from '../lib/adapter'

/**
 * create mocks
 */
let wrapCommand = sinon.spy()
let runHook = sinon.spy()
let Mocka = sinon.spy()
let loadFiles = Mocka.prototype.loadFiles = sinon.spy()
let reporter = Mocka.prototype.reporter = sinon.stub()
let run = Mocka.prototype.run = sinon.stub()
let originalCWD, load, send
run.returns({ on: function () {} })
Mocka.prototype.suite = { on: function () {} }

describe('mocha adapter', () => {
    before(() => {
        adapter.__Rewire__('Mocha', Mocka)
        adapter.__Rewire__('runHook', runHook)
        adapter.__Rewire__('wrapCommand', wrapCommand)

        load = adapter.load = sinon.spy()
        send = adapter.send = sinon.spy()

        originalCWD = process.cwd
        Object.defineProperty(process, 'cwd', {
            value: function () { return '/mypath' }
        })
    })

    describe('can load external modules', () => {
        it('should do nothing if no modules are required', () => {
            adapter.requireExternalModules()
        })

        it('should load proper external modules', () => {
            adapter.requireExternalModules(['js:moduleA', 'xy:moduleB'], ['yz:moduleC'])
            load.calledWith('moduleA').should.be.true()
            load.calledWith('moduleB').should.be.true()
            load.calledWith('moduleC').should.be.true()
        })

        it('should load local modules', () => {
            adapter.requireExternalModules(['./lib/myModule'])
            load.lastCall.args[0].slice(-20).should.be.exactly('/mypath/lib/myModule')
        })
    })

    describe('sends event messages', () => {
        it('should have proper message payload', () => {
            let caps = { browserName: 'chrome' }
            let err = { unAllowedProp: true }
            adapter.emit('suite:start', 0, caps, {}, err)
            let msg = send.firstCall.args[0]
            msg.runner['0'].should.be.exactly(caps)
            msg.err.should.not.have.property('unAllowedProp')
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
            wrapCommand.called.should.be.true()
            runHook.called.should.be.true()
        })
    })

    after(() => {
        Object.defineProperty(process, 'cwd', {
            value: originalCWD
        })
    })
})
