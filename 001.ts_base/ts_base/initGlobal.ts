import lodash from 'lodash'
import bluebird from 'bluebird'

export default {
    init() {
        Object.assign(global, {
            PI: 3.14,
            __: lodash,
            Promise: bluebird,
        })
    }
}