global._____wdio = {}

describe('sample test', () => {
    before(() => {
        const start = new Date().getTime()
        browser.command().should.be.equal('foo')
        global._____wdio.before = new Date().getTime() - start
    })

    before(() => {
        const start = new Date().getTime()
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                global._____wdio.promisehook = new Date().getTime() - start
                resolve()
            }, 500)
        })
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

    it('can do promises', () => {
        const start = new Date().getTime()
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                global._____wdio.promise = new Date().getTime() - start
                resolve()
            }, 500)
        })
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
