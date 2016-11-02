import path from 'path'

let { context, file } = module.parent.context
let { it } = context

context.it = function (name, callback) {
    if (name && callback) {
        return it(...arguments)
    } else {
        name = path.basename(file, '.js')
    }
}
