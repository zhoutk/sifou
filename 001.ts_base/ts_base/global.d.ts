import lodash from 'lodash'

type LODASH = typeof lodash

declare global {
    var __: LODASH,
    PI: 3.14
}