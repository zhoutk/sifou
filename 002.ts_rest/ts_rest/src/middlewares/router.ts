import * as Router from 'koa-router'

export default (app) => {
    let router = new Router()
    let process = async (ctx, next) => {
        ctx.body = 'hello world.'
    }
    router.get('/rs/hello', process)
    app.use(router.routes()).use(router.allowedMethods())
    return [async (ctx, next) => {
            ctx.body = { status: 404, message: 'What you request is not found.'}
          }]
    
}