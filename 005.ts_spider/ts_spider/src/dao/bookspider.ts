import BaseDao from '../db/baseDao'
import * as cheer from 'cheerio'
import * as moment from 'moment'

const protocol = 'http://localhost:5000'

export default class Bookspider {
    async spider(params = Object.create(null)): Promise<any> {
        let isbn = params.isbn || ''
        if (isbn.length > 0) {
            let remoteUrl = `http://search.dangdang.com/?key=${isbn}&act=input&category_path=01.00.00.00.00.00&type=01.00.00.00.00.00`
            let body = await G.tools.spiderData(remoteUrl)
            /*
            <li ddt-pit="1" class="line1" id="p25574845">
                    <a title=" 冷场（李诞2018年新书）"  ddclick="act=normalResult_picture&pos=25574845_0_1_p" class="pic" 
                    name="itemlist-picture"  dd_name="单品图片" href="http://product.dangdang.com/25574845.html"  
                    target="_blank" >
            */
            let reg = /<li ddt-pit="\d" class="line\d"[^>]+>[^<]+<a.*?http:\/\/product.dangdang.com\/(.*?)\.html"[^>]+>/
            let result = body.text.match(reg)
            if (result && result.length > 1) {
                let sku = result[1]
                let detailUrl = `http://product.dangdang.com/index.php?r=callback%2Fdetail&productId=${sku}&templateType=publish&describeMap=0100002959%3A1%2C0100002982%3A1&shopId=0&categoryPath=01.03.30.00.00.00`
                let book = await G.tools.spiderData(detailUrl, 'gb2312')
                let bookDetail = JSON.parse(book.text)

                let $ = cheer.load(bookDetail.data.html)
                let feature = $('#feature .descrip img').attr('src') || $('#feature').text()
                if (feature && feature.startsWith('http')) {
                    let filename = feature.substr(feature.lastIndexOf('/') + 1)
                    let path = `/bookimages/${isbn}_${moment().format('YYYYMMDD')}_${G.tools.uuid()}_${filename}`
                    G.tools.spiderDown(feature, `./public${path}`)
                    feature = protocol + path
                }
                let ab_text = $('#abstract').text()
                let ab_pic = $('#abstract .descrip img').attr('src')
                let absctract = ab_text && ab_text.length > 9 ? ab_text : ab_pic
                if (absctract && absctract.startsWith('http')) {
                    let filename = absctract.substr(absctract.lastIndexOf('/') + 1)
                    let path = `/bookimages/${isbn}_${moment().format('YYYYMMDD')}_${G.tools.uuid()}_${filename}`
                    G.tools.spiderDown(absctract, `./public${path}`)
                    absctract = protocol + path
                }
                let content = $('#content').text()
                let author_summary = $('#authorIntroduction').text()
                let catalog = $('#catalog').text()
                let details_json = { feature, absctract, content, author_summary, catalog }

                let info = await G.tools.spiderData(`http://product.dangdang.com/${sku}.html`, 'gb2312')
                $ = cheer.load(info.text)
                let bookName = $('h1').text()
                bookName = bookName.replace(/\s/g, '')
                let cbs = $('#product_info .t1').text()
                //作者:李诞出版社:四川文艺出版社出版时间:2018年11月 
                let regcbs = /作者:(.*?)出版社:(.*?)时间:(.*?)\s/

                let rscbs = cbs.match(regcbs)
                if (rscbs && rscbs.length > 3) {
                    Object.assign(details_json, { isbn, book_name: bookName, author_name: rscbs[1], publisher: rscbs[2], publish_day: rscbs[3] })
                }

                return G.jsResponse(G.STCODES.SUCCESS, 'spider ok.', [details_json])
            } else {
                return G.jsResponse(G.STCODES.NOTFOUND, 'book not found.', { isbn })
            }
        } else {
            return G.jsResponse(G.STCODES.PRAMAERR, 'params is wrong.')
        }
    }
}