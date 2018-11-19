import * as lodash from 'lodash'
import * as bluebird from 'bluebird'
import CONFIGS from '../config/configs'
import { configure, getLogger} from 'log4js'
import logCfg from '../config/log4js'

export default {
    init() {
        let gVar = {
            __: lodash,
            CONFIGS,
            logger: (() => {
                configure(logCfg)
                return getLogger('default')
            })(),
            jsResponse(status: number, message = '', data?: object|Array<any>) {
                if (Array.isArray(data)) {
                    return { status, message, data}
                } else {
                    return Object.assign({}, data, {status, message})
                }
            }
        }
        Object.assign(global, 
            {G: gVar}, 
            {Promise: bluebird}
        )
    }
}