import { createPool, PoolOptions} from 'mysql2'
import IDao from './idao'
import TransElement from './transElement'

const OPMETHODS = {
    Insert: 'INSERT INTO ?? SET ?',
    Update: 'UPDATE ?? SET ? WHERE ?',
    Delete: 'DELETE FROM ?? WHERE ?',
    Batch: 'INSERT INTO ?? (??) VALUES '
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
    transGo(elements: Array<TransElement>, isAsync: boolean = true): Promise<any> {
        let sqls = []
        elements.forEach((ele) => {
            let values: Array<any> = [ele.table]
            let params: object = ele.params
            values.push(params)
            if (ele.id !== undefined)
                values.push({id: ele.id})
            let sql = {text: '', values}
            sql.text = OPMETHODS[ele.method]
            sqls.push(sql)
        })
        return this.execTrans(sqls, isAsync)
    }
    private execTrans(sqls: Array<any>, isAsync: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(G.jsResponse(701, 'error: ' + err.message))
                    G.logger.error(err.message)
                } else {
                    conn.beginTransaction((err) => {
                        if (err) {
                            reject(G.jsResponse(701, 'error: ' + err.message))
                            G.logger.error(err.message)
                        } else {
                            
                            if (isAsync) {          //异步
                                let funcArr = []
                                sqls.forEach((sqlParam: {text: string; values: Array<any>}) => {
                                    funcArr.push(doOne(sqlParam))
                                })
                                Promise.all(funcArr).then((resp) => {
                                    conn.commit((err) => {
                                        if (err) {
                                            conn.rollback(() => {
                                                conn.release()
                                                G.logger.debug('trans fail. error: ' + err.message)
                                                reject(G.jsResponse(703, 'trans fail.')) 
                                            })
                                        } else {
                                            conn.release()
                                            G.logger.debug('trans success. ')
                                            resolve(G.jsResponse(200, 'trans success.', {affectedRows: resp.length})) 
                                        }
                                    })
                                }).catch((err) => {
                                    conn.rollback(() => {
                                        conn.release()
                                        reject(G.jsResponse(704, 'trans exception.'))
                                    })
                                })
                            } else {                //同步
                                goTrans(sqls)
                            }

                            function goTrans(sqlArray: Array<any>, result?) {
                                let sqlArr = G.L.cloneDeep(sqlArray)
                                if (sqlArr.length > 0) {
                                    doOne(sqlArr.pop()).then((result) => {
                                        goTrans(sqlArr, result)
                                    }).catch((err) => {
                                        reject(G.jsResponse(705, err.message))
                                    })
                                } else {
                                    conn.commit((err) => {
                                        if (err) {
                                            conn.rollback(() => {
                                                conn.release()
                                                G.logger.debug('trans fail. error: ' + err.message)
                                                reject(G.jsResponse(703, 'trans fail.')) 
                                            })
                                        } else {
                                            conn.release()
                                            G.logger.debug('trans success. ')
                                            resolve(G.jsResponse(200, 'trans success.', {affectedRows: sqls.length})) 
                                        }
                                    })
                                }
                            }

                            function doOne(sqlParam: {text: string; values: Array<any>}): Promise<any> {
                                return new Promise((resolve, reject) => {
                                    let sql = sqlParam.text
                                    let values = sqlParam.values
                                    conn.query(sql, values, (err, result) => {
                                        if (err) {
                                            conn.rollback(() => {
                                                G.logger.error('trans error: ' + err.message)
                                                reject(G.jsResponse(702, 'trans error: ' + err.message))
                                            })
                                        } else {
                                            G.logger.debug('trans success. sql: ' + sql)
                                            resolve(G.jsResponse(200, 'trans success.', result)) 
                                        }
                                    })
                                })
                            }

                        }
                    })

                }
            })
        })
    }
    insertBatch(tablename: string, elements: any[]): Promise<any> {
        let sql: string = OPMETHODS['Batch']
        let updateStr = ''
        let values: [any] = [tablename]
        let valKeys = []

        for (let i = 0; i < elements.length; i++) {
            if (i === 0) {
                valKeys = Object.keys(elements[i])
                values.push(valKeys)
            }
            let valueStr = []
            for (let j = 0; j < valKeys.length; j++) {
                valueStr.push(elements[i][valKeys[j]])
                if (i === 0) {
                    updateStr += valKeys[j] + ' = values(' + valKeys[j] + '),'
                }
            }
            values.push(valueStr)
            sql += ' (?),'
        }
        sql = sql.substring(0, sql.length - 1)
        sql += ' ON DUPLICATE KEY UPDATE '
        sql += updateStr.substring(0, updateStr.length - 1)

        return this.execQuery(sql, values)
    }
    execSql(sql: string, values: any[]): Promise<any> {
        return this.execQuery(sql, values)
    }
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