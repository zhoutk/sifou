import * as Koa from 'koa'

export default {
    async init () {
        const app = new Koa()
        const middlewares = [
            'logger',
            'bodyParser',
            'session',
            'router'
        ]
        for ( let n of middlewares) {
            const middle = await this.loadMiddleware.apply(null, [].concat(n))
            if (middle) {
                for (let m of [].concat(middle)) {
                    m && app.use.apply(app, [].concat(m))
                }
            }
        }
        return app
    },
    async loadMiddleware(name, ...args) {
        const middlware = require(`./middlewares/${name}`).default
        return middlware && await middlware.apply(null, args) || async function (ctx, next) {
            await next()
        }
    }
}