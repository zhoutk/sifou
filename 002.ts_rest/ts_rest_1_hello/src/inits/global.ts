import * as lodash from 'lodash'
import * as Bluebird from 'bluebird'

export default {
    init() {
        let gVar = {
            L: lodash
        }
        Object.assign(global, 
            {G: gVar},
            { Promise: Bluebird}
        )
    }
}