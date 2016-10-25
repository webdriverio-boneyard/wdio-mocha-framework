import path from 'path'

let { context, file } = module.parent.context
let { it } = context

context.it = function (name, callback) {
    if (callback) {
        return it(...arguments)
    } else {
        callback = name
        name = path.basename(file, '.js')
    }
}
