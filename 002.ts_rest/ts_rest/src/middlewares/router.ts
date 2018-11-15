import * as Router from 'koa-router'
import * as jwt from 'jsonwebtoken'
import BaseDao from '../db/baseDao'

const config = G.CONFIGS.jwt

const METHODS = {
    GET: 'retrieve',
    POST: 'create',
    PUT: 'update',
    DELETE: 'delete'
}

export default () => {
    let router = new Router
    let processRs = async (ctx, next) => {
        let method = ctx.method.toUpperCase()
        let tableName: string = ctx.params.table
        let id: string|number|undefined = ctx.params.id
        let params = method === 'POST' || method === 'PUT' ? ctx.request.body : ctx.request.query
        if (id !== undefined)
            params.id = id
        let {fields, ...restParams} = params

        ctx.body = await new BaseDao(tableName)[METHODS[method]](restParams, fields)
    }

    let processOp = async (ctx, next) => {
        let { command } = ctx.params
        switch (command) {
            case 'login':
                let rs = await new BaseDao('users').retrieve({ username: ctx.request.body.username })
                if (rs.status === 200) {
                    let user = rs.data[0]
                    let token = jwt.sign({
                        userid: user.id,
                        username: user.username,
                    }, config.secret, {
                            expiresIn: config.expires_max,
                        }
                    )
                    ctx.body = G.jsResponse(200, 'login success.', { token })
                } else {
                    ctx.body = G.jsResponse(301, 'The user is missing.')
                }
                break
            default:
                ctx.body = G.jsResponse(404, 'command is not found.')
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