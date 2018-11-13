import * as Router from 'koa-router'

export default (app) => {
    let router = new Router()
    let process = async (ctx, next) => {
        ctx.body = {status: 200, message: 'hello world.rs'}
    }
    let processOp = async (ctx, next) => {
        ctx.body = {status: 200, message: 'hello world.op'}
    }
    router.get('/rs/hello', process).post('/op/login', processOp)
    let middles = [router.routes(), router.allowedMethods()]

    middles.push(async (ctx, next) => {
        ctx.body = { status: 404, message: 'What you request is not found.'}
      })
    return middles
    
}