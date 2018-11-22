import * as Router from 'koa-router'
import BaseDao from '../db/baseDao'
import * as jwt from 'jsonwebtoken'

const jwtCfg = G.CONFIGS.jwt

const METHODS = {
    GET: 'retrieve',
    POST: 'create',
    PUT: 'update',
    DELETE: 'delete',
}

export default () => {
    let router = new Router
    let processRs = async (ctx, next) => {
        let method = ctx.method.toUpperCase()
        let tablename = ctx.params.table
        let id: string|number|undefined = ctx.params.id
        let params = method === 'POST' || method === 'PUT' ? ctx.request.body : ctx.request.query
        if (id !== undefined) {
            params.id = id
        }
        let {fields, ...restParams} = params
        if (fields !== undefined)
            fields = G.arryParse(fields)
        ctx.body = await new BaseDao(tablename)[METHODS[method]](restParams, fields, ctx.session)
    }

    let processOp = async (ctx, next) => {
        let { command } = ctx.params
        switch (command) {
            case 'query': 
                let result = await new BaseDao().querySql('select * from users where age > ? ', [11], {page: 2, size: 2, sort: 'age asc'})
                ctx.body = result
                break
            case 'login':
                let rs = await new BaseDao('users').retrieve({username: ctx.request.body.username})
                if (rs.status === 200) {
                    let user = rs.data[0]
                    let token = jwt.sign({
                        userid: user.id,
                        username: user.username,
                    }, jwtCfg.secret, {
                        expiresIn: jwtCfg.expires_max
                    })
                    ctx.body = G.jsResponse(200, 'login success.', {token})
                } else {
                    ctx.body = G.jsResponse(701, 'The user is missing.')
                }
                break
        
            default:
                ctx.body = G.jsResponse(405, 'command is not found.')
                break
        }
    }

    router.all('/rs/:table', processRs).all('/rs/:table/:id', processRs).post('/op/:command', processOp)

    let middles = [router.routes(), router.allowedMethods()]
    middles.push(async (ctx, next) => {
        ctx.body = {status: 404, message: 'What you request is not found.'} 
    })

    return middles
}