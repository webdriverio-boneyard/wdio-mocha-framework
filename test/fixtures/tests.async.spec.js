global.______wdio = {}

describe('dummy test', () => {
    before(() => {
        const start = new Date().getTime()
        return browser.command().then((result) => {
            result.should.be.equal('foo')
            global.______wdio.before = new Date().getTime() - start
        })
    })

    beforeEach(() => {
        const start = new Date().getTime()
        return browser.command().then((result) => {
            result.should.be.equal('foo')
            global.______wdio.beforeEach = new Date().getTime() - start
        })
    })

    it('foo', () => {
        const start = new Date().getTime()
        return browser.command().then((result) => {
            result.should.be.equal('foo')
            global.______wdio.it = new Date().getTime() - start
        })
    })

    describe('nested', () => {
        it('bar', () => {
            const start = new Date().getTime()
            return browser.command().then((result) => {
                result.should.be.equal('foo')
                global.______wdio.nestedit = new Date().getTime() - start
            })
        })
    })

    afterEach(() => {
        const start = new Date().getTime()
        return browser.command().then((result) => {
            result.should.be.equal('foo')
            global.______wdio.afterEach = new Date().getTime() - start
        })
    })

    after(() => {
        const start = new Date().getTime()
        return browser.command().then((result) => {
            result.should.be.equal('foo')
            global.______wdio.after = new Date().getTime() - start
        })
    })
})
