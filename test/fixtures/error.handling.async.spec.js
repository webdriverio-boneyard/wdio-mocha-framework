describe('dummy test', () => {
    before(() => {
    })

    it('sample test', () => {
        return browser.command().then((result) => {
            result.should.be.equal('foo')
        })
    })

    after(() => {
    })
})
