import * as color from 'cli-color'
export default () => {
    return async (ctx, next) => {
        if (G.CONFIGS.http_log_print) {
            const start = Date.now()
            await next()
            const diff = Date.now() - start
            const msgs = [
                (ctx.method === 'POST' ? color.bgYellowBright.green : color.bgBlue)(`${ctx.method}`),
                color.cyan(ctx.url),
                (ctx.status >= 400 ? color.redBright : color.greenBright)(`[${ctx.status}]`),
                '-',
                color.yellow(`${diff}ms`),
                'params',
                color.green(JSON.stringify(ctx.method === 'POST' || ctx.method === 'PUT' ? ctx.request.body : ctx.request.query))
            ]
            G.logger.debug(msgs.join(' '))
        } else {
            await next()
        }
    }
}