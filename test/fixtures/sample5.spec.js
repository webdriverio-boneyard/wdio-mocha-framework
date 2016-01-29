describe('dummy test', () => {
    before(() => {
    })

    it('sample test', () => {
        return browser.command(1).then((result) => {
            result.should.be.equal(2)
        })
    })

    after(() => {
    })
})
