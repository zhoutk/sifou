import { globInit } from './inits/global'
import appIniter from './app'

(async () => {
    globInit()
    let app = await appIniter.init()
    app.listen(G.CONFIGS.port, () => {
        G.logger.info('√ rest server listen on 5000.')
    })
})()