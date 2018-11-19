import IDao from './idao'
let dialect = G.CONFIGS.db_dialect
let Dao = require(`./${dialect}Dao`).default

export default class BaseDao {
    private table: string
    static dao: IDao
    constructor(table?: string) {
        this.table = table || ''
        if (!BaseDao.dao) {
            BaseDao.dao = new Dao()
        }
    }
    async retrieve(params = {}, fields = [], session = {userid: ''}): Promise<any> {
        let rs 
        try {
            rs = await BaseDao.dao.select(this.table, params, fields)
        } catch (err) {
            err.message = `data query fail: ${err.message}`
            return err
        }
        if (rs.status === 200 && (!rs.data || rs.data.length === 0)) {
            return G.jsResponse(202, 'query result is empty.')
        } else
            return rs
    }
    async create(params = {}, fields = [], session = {userid: ''}): Promise<any> {
        let rs 
        try {
            rs = await BaseDao.dao.create(this.table, params)
        } catch (err) {
            err.message = `data create fail: ${err.message}`
            return err
        }
        let { affectedRows, insertId } = rs
        return G.jsResponse(200, 'data insert success.', {affectedRows, id: insertId})
    }
    async update(params, fields = [], session = {userid: ''}): Promise<any> {
        params = params || {}
        let {id, ...restParams} = params
        let rs 
        try {
            rs = await BaseDao.dao.update(this.table, restParams, id)
        } catch (err) {
            err.message = `data update fail: ${err.message}`
            return err
        }
        let { affectedRows} = rs
        return G.jsResponse(200, 'data update success.', {affectedRows, id})
    }
    async delete(params, fields = [], session = {userid: ''}): Promise<any> {
        params = params || {}
        let {id} = params
        let rs 
        try {
            rs = await BaseDao.dao.delete(this.table, id)
        } catch (err) {
            err.message = `data detele fail: ${err.message}`
            return err
        }
        let { affectedRows} = rs
        return G.jsResponse(200, 'data delete success.', {affectedRows, id})
    }
}