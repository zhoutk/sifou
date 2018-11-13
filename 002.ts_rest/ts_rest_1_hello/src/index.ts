import globIniter from './inits/global'
import appIniter from './app'

(async () => {
    globIniter.init()
    let app = await appIniter.init()
    app.listen(5000, () => {
        console.log('rest server listen on 5000.')
    })
})()