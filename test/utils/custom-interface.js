import Test from 'mocha/lib/test'
import commonMethods from 'mocha/lib/interfaces/common'

// Example custom-interface mimics Mochas bdd interface
module.exports = function (suite) {
    const suites = [suite]

    suite.on('pre-require', (context, file, mocha) => {
        const common = commonMethods(suites, context, mocha)

        context.before = common.before
        context.after = common.after
        context.beforeEach = common.beforeEach
        context.afterEach = common.afterEach

        context.describe = (title, fn) => common.suite.create({
            title: title,
            file: file,
            fn: fn
        })
        context.describe.skip = (title, fn) => common.suite.skip({
            title: title,
            file: file,
            fn: fn
        })
        context.describe.only = (title, fn) => common.suite.only({
            title: title,
            file: file,
            fn: fn
        })

        context.it = (title, fn) => {
            const suite = suites[0]
            if (suite.isPending()) {
                fn = null
            }
            const test = new Test(title, fn)
            test.file = file
            suite.addTest(test)
            return test
        }
        context.it.only = (title, fn) => common.test.only(mocha, context.it(title, fn))
        context.it.skip = (title) => context.it(title)
        context.it.retries = (n) => context.retries(n)

        context.testMochaContext = () => context
    })
}
