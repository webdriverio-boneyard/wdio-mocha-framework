global._____wdio = {}

describe('sample test', () => {
    before(() => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._____wdio.before = new Date().getTime() - start
    })

    beforeEach(() => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._____wdio.beforeEach = new Date().getTime() - start
    })

    it('foo', () => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._____wdio.it = new Date().getTime() - start
    })

    describe('nested', () => {
        it('bar', () => {
            const start = new Date().getTime()
            browser.command().should.be.equal('foo')
            global._____wdio.nestedit = new Date().getTime() - start
        })
    })

    afterEach(() => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._____wdio.afterEach = new Date().getTime() - start
    })

    after(() => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._____wdio.after = new Date().getTime() - start
    })
})
