import lodash from 'lodash'

type LODASH = typeof lodash

declare global {
    var G: {
        L: LODASH
    }
}