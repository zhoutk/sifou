import BaseDao from '../db/baseDao'
import * as cheer from 'cheerio'
import * as moment from 'moment'
import Bookspider from './bookspider'

const protocol = 'http://localhost:5000'

export default class Books extends BaseDao {
    constructor(table: string) {
        super(table)
    }
    async retrieve(params = Object.create(null), fields = [], session = { userid: '' }): Promise<any> {
        let isbn = params.isbn || ''

        if (isbn.length > 0) {
            let book = G.CircleQueue.find(isbn)
            if (book === undefined) {
                let rs = await super.retrieve({ isbn })
                if (rs.status === G.STCODES.SUCCESS) {
                    G.logger.debug(`ISBN: ${isbn} in database.`)
                    book = rs.data[0]
                }
            } else {
                G.logger.debug(`ISBN: ${isbn} in memery.`)
            }
            if (book === undefined) {
                let rs = await new Bookspider().spider({isbn})
                if (rs.status === G.STCODES.SUCCESS) {
                    G.logger.debug(`ISBN: ${isbn} spider real time.`)
                    book = rs.data[0]
                    let data = G.CircleQueue.push(book)
                    if (data) {
                        let elements = []
                        let keys = Object.keys(data)
                        keys.forEach((isbn) => {
                            elements.push({
                                isbn,
                                book_name: data[isbn].book_name,
                                author_name: data[isbn].author_name,
                                publisher: data[isbn].publisher,
                                publish_day: data[isbn].publish_day,
                                details_json: JSON.stringify(data[isbn])

                            })
                        })
                        super.insertBatch(this.table, elements)
                    }
                }
            }
            return book ? book : G.jsResponse(G.STCODES.NOTFOUND, 'book info not exist.' )
        } else {
            return G.jsResponse(G.STCODES.PRAMAERR, 'params is wrong.')
        }
    }
}