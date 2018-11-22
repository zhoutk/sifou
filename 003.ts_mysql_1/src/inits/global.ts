import * as lodash from 'lodash'
import * as bluebird from 'bluebird'
import CONFIGS from '../config/configs'
import { configure, getLogger} from 'log4js'
import logCfg from '../config/log4js'

let GlobVar = {
    L: lodash,
    CONFIGS,
    logger: (() => {
        configure(logCfg)
        return getLogger('default')
    })(),
    arryParse(arr): Array<any>|null {
        try {
            if (Array.isArray(arr) || G.L.isNull(arr)) {
                return arr
            } else if (typeof arr === 'string') {
                if (arr.startsWith('[')) {
                    arr = JSON.parse(arr)
                } else {
                    arr = arr.split(',')
                }
            }
        } catch (err) {
            arr = null
        }
        return arr
    },
    jsResponse(status: number, message = '', data?: object|Array<any>) {
        if (Array.isArray(data)) {
            return { status, message, data}
        } else {
            return Object.assign({}, data, {status, message})
        }
    }
}

function globInit() {
    Object.assign(global,
        { G: GlobVar },
        { Promise: bluebird }
    )
}

export {globInit, GlobVar}