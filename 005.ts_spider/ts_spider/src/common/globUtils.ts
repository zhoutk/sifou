import * as uuid from 'uuid'
import * as superagent from 'superagent'
import * as charset from 'superagent-charset'
import * as fs from 'fs'
charset(superagent)

export default class GlobUtils {
    async spiderData(path: string, encoding?: string) {
        return await superagent
        .get(path)
        .buffer(true)
        .charset(encoding)
    }
    spiderDown(path: string, filename: string) {
        superagent(path).pipe(fs.createWriteStream(filename))
    }
    uuid() {
        return uuid.v1().split('-')[0]
    }
    isDev() {
        return G.NODE_ENV !== 'prod'
    }
    isLogin() {
        return true
    }
    arryParse(arr): Array<any>|null {
        try {
            if (Array.isArray(arr) || G.L.isNull(arr))
                return arr
            else if (typeof arr === 'string') {
                if (arr.startsWith('['))
                    arr = JSON.parse(arr)
                else
                    arr = arr.split(',')
            } else 
                return null
        } catch (err) {
            arr = null
        }
        return arr
    }
}