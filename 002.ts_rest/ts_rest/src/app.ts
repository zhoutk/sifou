import * as Koa from 'koa'

export default {
    async init () {
        const app = new Koa()
        app.proxy = true
        const middlewares = [
            'bodyParser',
            ['router', app]
        ]
        for (let n of middlewares) {
            const middles = await this.loadMiddleware.apply(null, [].concat(n))
            if (middles) {
                for (let m of [].concat(middles)) {
                    m && app.use.apply(app, [].concat(m))
                }
            }
        }
        return app
    },
    async loadMiddleware(name, ...args) {
        const middleware = require(`./middlewares/${name}`).default
        return middleware && await middleware.apply(null, args) || async function (ctx, next) { await next() }
    }
}