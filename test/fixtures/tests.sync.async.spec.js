global._______wdio = {}

describe('sample test', () => {
    before(() => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._______wdio.beforeSync = new Date().getTime() - start
    })

    before(function async () {
        const start = new Date().getTime()
        return browser.command().then(function (result) {
            result.should.be.equal('foo')
            global._______wdio.beforeAsync = new Date().getTime() - start
        })
    })

    beforeEach(() => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._______wdio.beforeEachSync = new Date().getTime() - start
    })

    beforeEach(function async () {
        const start = new Date().getTime()
        return browser.command().then((result) => {
            result.should.be.equal('foo')
            global._______wdio.beforeEachAsync = new Date().getTime() - start
        })
    })

    it('foo', () => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._______wdio.itSync = new Date().getTime() - start
    })

    it('foo async', function async () {
        const start = new Date().getTime()
        return browser.command().then((result) => {
            result.should.be.equal('foo')
            global._______wdio.itAsync = new Date().getTime() - start
        })
    })

    afterEach(() => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._______wdio.afterEachSync = new Date().getTime() - start
    })

    afterEach(function async () {
        const start = new Date().getTime()
        return browser.command().then((result) => {
            result.should.be.equal('foo')
            global._______wdio.afterEachAsync = new Date().getTime() - start
        })
    })

    after(() => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._______wdio.afterSync = new Date().getTime() - start
    })

    after(function async () {
        const start = new Date().getTime()
        return browser.command().then((result) => {
            result.should.be.equal('foo')
            global._______wdio.afterAsync = new Date().getTime() - start
        })
    })
})
