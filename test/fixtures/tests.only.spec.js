global.mochaExtra = {}

describe('dummy test', () => {
    it.skip('sample test pending', () => {
        const start = new Date().getTime()
        browser.pause()
        global.mochaExtra.itskip = new Date().getTime() - start
    })

    it.only('should only run this', () => {
        const start = new Date().getTime()
        browser.pause()
        global.mochaExtra.itonly = new Date().getTime() - start
    })

    it.only('should skip within spec', function () {
        this.skip()
        throw new Error('haha')
    })

    it('should not run this', () => {
        const start = new Date().getTime()
        browser.pause()
        global.mochaExtra.it = new Date().getTime() - start
    })
})
