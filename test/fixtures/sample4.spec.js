describe('dummy test', () => {
    before(() => {
        browser.addCommand('customWdio', function (a) {
            browser.pause(1000)
            return a + 1
        })

        browser.addCommand('customWdioPromise', function async (a) {
            return browser.pause(1000)
            .then(() => {
                return a + 1
            })
        })

        browser.addCommand('customNativePromise', function async (a) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(a + 1)
                }, 1000)
            })
        })

        browser.addCommand('customWrapWdio', function (a) {
            const b = browser.customWdio(a)
            return b + 1
        })

        browser.addCommand('customWrapWdioPromise', function (a) {
            const b = browser.customWdioPromise(a)
            return b + 1
        })

        browser.addCommand('customWrapTwoPromises', function (a) {
            global.__wdio.customWrapTwoPromises.start = new Date().getTime()
            return new Promise((resolve) => {
                const b = browser.customWdioPromise(a)
                const c = browser.customNativePromise(b)
                global.__wdio.customWrapTwoPromises.end = new Date().getTime()
                resolve(c)
            })
        })
    })

    it('custom wdio', () => {
        global.__wdio.customWdio.start = new Date().getTime()
        browser.customWdio(1).should.be.equal(2)
        global.__wdio.customWdio.end = new Date().getTime()
    })

    it('custom wdio promise', () => {
        global.__wdio.customWdioPromise.start = new Date().getTime()
        browser.customWdioPromise(1).should.be.equal(2)
        global.__wdio.customWdioPromise.end = new Date().getTime()
    })

    it('custom native promise', () => {
        global.__wdio.customNativePromise.start = new Date().getTime()
        browser.customNativePromise(1).should.be.equal(2)
        global.__wdio.customNativePromise.end = new Date().getTime()
    })

    it('custom command wrapping custom wdio', () => {
        global.__wdio.customWrapWdio.start = new Date().getTime()
        browser.customWrapWdio(1).should.be.equal(3)
        global.__wdio.customWrapWdio.end = new Date().getTime()
    })

    it('custom command wrapping custom wdio promise', () => {
        global.__wdio.customWrapWdioPromise.start = new Date().getTime()
        browser.customWrapWdioPromise(1).should.be.equal(3)
        global.__wdio.customWrapWdioPromise.end = new Date().getTime()
    })

    it('custom command wrapping two native promise commands', () => {
        global.__wdio.customWrapTwoPromises.start = new Date().getTime()
        browser.customWrapTwoPromises(1).should.be.equal(3)
        global.__wdio.customWrapTwoPromises.end = new Date().getTime()
    })

    after(() => {
    })
})
