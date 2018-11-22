import { createPool, PoolOptions} from 'mysql2'
import IDao from './idao'
import { listenerCount } from 'cluster';

const OPMETHODS = {
    Insert: 'INSERT INTO ?? SET ?',
    Update: 'UPDATE ?? SET ? WHERE ?',
    Delete: 'DELETE FROM ?? WHERE ?',
}

const QUERYEXTRAKEY = ['ins', 'lks', 'ors']
const QUERYSTATICSKEY = ['count', 'sum']
const QUERYUNEQOPERS = ['<', '<=', '>', '>=', '<>', '=']

let options: PoolOptions = {
    host: G.CONFIGS.dbconfig.db_host,
    port: G.CONFIGS.dbconfig.db_port,
    database: G.CONFIGS.dbconfig.db_name,
    user: G.CONFIGS.dbconfig.db_user,
    password: G.CONFIGS.dbconfig.db_pass,
    charset: G.CONFIGS.dbconfig.db_char,
    connectionLimit: G.CONFIGS.dbconfig.db_conn,
}
let pool = createPool(options)

export default class MysqlDao implements IDao {
    create(tablename: string, params: object): Promise<any> {
        return this.execQuery(OPMETHODS['Insert'], [tablename, params])
    }
    update(tablename: string, params: object, id: string | number): Promise<any> {
        return this.execQuery(OPMETHODS['Update'], [tablename, params, {id}])
    }
    delete(tablename: string, id: string | number): Promise<any> {
        return this.execQuery(OPMETHODS['Delete'], [tablename, {id}])
    }
    querySql(sql: string, values: any[], params: object, fields?: string[]): Promise<any> {
        fields = fields || []
        params = params || []
        return this.query('QuerySqlSelect', params, fields, sql, values)
    }
    select(tablename: string, params: object, fields?: string[]): Promise<any> {
        fields = fields || []
        return this.query(tablename, params, fields)
    }
    private query(tablename: string, params, fields = [], sql = '', values = []): Promise<any> {
        params = params || {}
        let where: string = '', extra = ''
        const AndJoinStr = ' and '
        let {search, page, size, sort, group, ...restParams} = params
        let {ins, lks, ors, count, sum} = restParams
        let queryKeys = {ins, lks, ors, count, sum}
        page = page || 0
        size = size || 10

        let keys: string[] = Object.keys(restParams)
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i]
            let value = params[key]

            if (where !== '')
                where += AndJoinStr
            
            if (QUERYEXTRAKEY.includes(key)) {        //若key是保留字
                let whereExtra = '', err = null
                let ele = queryKeys[key] = G.arryParse(queryKeys[key])
                if (!ele || ele.length < 2 || (key !== 'ins' && ele.length % 2 === 1)) {
                    err = `Format of ${key} is wrong.`
                    return Promise.reject(G.jsResponse(301, err))
                } else {
                    if (key === 'ins') {
                        let c = ele.shift()
                        whereExtra += c + ' in ( ? ) '
                        values.push(ele)
                    } else {
                        whereExtra = ' ( '
                        for (let j = 0; j < ele.length; j += 2) {
                            if (j > 0) {
                                whereExtra += ' or '
                            }
                            if (ele[j + 1] === null) {
                                whereExtra += ele[j] + ' is null '
                            } else {
                                whereExtra += `${ele[j]} ${key === 'lks' ? 'like' : '='} ? `
                                let whereStr = ele[j + 1]
                                if (key === 'lks')
                                    whereStr = `%${ele[j + 1]}%`
                                values.push(whereStr)
                            }
                        }
                        whereExtra += ' ) '
                    }
                    where += whereExtra
                }
            } else if (QUERYSTATICSKEY.includes(key)) {
                let ele = queryKeys[key] = G.arryParse(queryKeys[key])
                if (!ele || ele.length === 0 || ele.length % 2 === 1)
                    return Promise.reject(G.jsResponse(301, `Format of ${key} is wroing.`))
                for (let j = 0; j < ele.length; j += 2) {
                    extra += `,${key}(${ele[j]}) as ${ele[j + 1]} `
                }
            } else {                    //根据value进行处理
                let is_val_arr = G.arryParse(value)
                if (is_val_arr !== null)
                    value = is_val_arr
                if (QUERYUNEQOPERS.some((element) => {
                    if (Array.isArray(value)) {
                        return value.join().startsWith(element)
                    } else if (typeof value === 'string') {
                        return value.startsWith(element)
                    } else 
                        return false
                })) {
                    if (typeof value === 'string') {
                        value = value.split(',')
                    }
                    if (value.length === 2) {
                        where += key + value[0] + ' ? '
                        values.push(value[1])
                    } else if (value.length === 4) {
                        where += key + value[0] + ' ? and ' + key + value[2] + ' ? '
                        values.push(value[1])
                        values.push(value[3])
                    } else {
                        if (where.endsWith(AndJoinStr))
                            where = where.substr(0, where.length - AndJoinStr.length)
                    }
                } else if (search !== undefined) {
                    value = pool.escape(value).replace(/\', \'/g, "%' and " + key + " like '%")
                    value = value.substring(1, value.length - 1)
                    where += key + " like '%" + value + "%'"
                } else {
                    where += key + ' = ? '
                    values.push(value)
                }
            }
        }

        if (tablename === 'QuerySqlSelect') {
            sql = sql + (where === '' ? '' : (' and ' + where))
        } else {
            sql = `SELECT ${fields.length > 0 ? fields.join() : '*'}${extra} FROM ${tablename} `
            if (where !== '') {
                sql += ' WHERE ' + where
            }
        }

        if (group !== undefined) {
            let value = pool.escape(group)
            group = ' GROUP BY ' + value.substring(1, value.length - 1)
            sql += group
        }

        if (sort !== undefined) {
            let value = pool.escape(sort)
            sort = ' ORDER BY ' + value.substring(1, value.length - 1)
            sql += sort
        }

        if (page > 0) {
            page--
            sql = sql + ' LIMIT ' + page * size + ',' + size
        }

        return this.execQuery(sql, values)
    }
    private execQuery(sql: string, values: any): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(G.jsResponse(800, 'get database connection error.'))
                    G.logger.error('get database connection error. message: ' + err.message)
                } else {
                    connection.query(sql, values, (err, result) => {
                        connection.release()
                        let v = values ? '_Values_ : ' + JSON.stringify(values) : ''
                        if (err) {
                            reject(G.jsResponse(801, 'database query error. message: ' + err.message))
                            G.logger.error('database query error. message: ' + err.message)
                            G.logger.debug('Error_Sql_ : ' + sql + v)
                        } else {
                            resolve(G.jsResponse(200, 'database query success.', result))
                            G.logger.debug('_Sql_ : ' + sql + v)
                        }
                    })
                }
            })
        })
    }
}