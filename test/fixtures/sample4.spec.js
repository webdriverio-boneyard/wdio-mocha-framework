describe('dummy test', () => {
    before(() => {
        browser.addCommand('custom1', function (a) {
            global.__wdio.custom1.start = new Date().getTime()
            browser.pause(1000)
            global.__wdio.custom1.end = new Date().getTime()
            return a + 1
        })

        browser.addCommand('custom2', function async (a) {
            global.__wdio.custom2.start = new Date().getTime()
            return browser.pause(1000)
            .then(() => {
                global.__wdio.custom2.end = new Date().getTime()
                return a + 1
            })
        })
    })

    it('custom 1', () => {
        browser.custom1(1).should.be.equal(2)
    })

    it('custom 2', () => {
        browser.custom2(1).should.be.equal(2)
    })

    after(() => {
    })
})
