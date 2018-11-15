import * as jwt from 'jsonwebtoken'

const config = G.CONFIGS.jwt

export default () => {
    return async (ctx, next) => {
        const { header: { token } } = ctx
        let urlStrs = ctx && ctx.url && ctx.url.split('/')
        if (token) {
            try {
                const decoded = jwt.verify(token, config.secret)
                //redis....
                ctx.session = decoded
                await next()
            } catch (err) {
                if (ctx.method === 'GET' || urlStrs[1] === 'op') {
                    return await next()
                }
                if (err.name === 'TokenExpiredError') {
                    ctx.body = G.jsResponse(501, 'Token Expired.')
                } else if (err.name === 'JsonWebTokenError') {
                    ctx.body = G.jsResponse(502, 'Invalid Token.')
                } else {
                    ctx.body = G.jsResponse(500, err.message)
                }
            }
        } else {
            if (ctx.method === 'GET' || urlStrs[1] === 'op') {
                await next()
            } else {
                ctx.body = G.jsResponse(505, 'Missing Auth Token.')
            }
        }

        
    }
}
