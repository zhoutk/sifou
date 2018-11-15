import globIniter from './inits/global'
import appIniter from './app'

(async () => {
    globIniter.init()
    let app = await appIniter.init()
    app.listen(G.CONFIGS.port, () => {
        G.logger.info('√ rest server listen on 5000.')
    })
})()