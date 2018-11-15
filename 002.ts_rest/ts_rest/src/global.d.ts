import lodash from 'lodash'
import config from './config/configs'
import {Logger} from 'log4js'

type LODASH = typeof lodash
type CFG = typeof config

declare global {
    var G: {
        PAGESIZE: 10,
        L: LODASH,
        CONFIGS: CFG,
        logger: Logger,
        jsResponse: (status: number, message: string, data?: object|Array<any>) => object
    }
}