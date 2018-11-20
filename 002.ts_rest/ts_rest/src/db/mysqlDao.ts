import { createPool, PoolOptions} from 'mysql2'
import IDao from './idao'

const OPMETHODS = {
    Insert: 'INSERT INTO ?? SET ?',
    Update: 'UPDATE ?? SET ? WHERE ?',
    Delete: 'DELETE FROM ?? WHERE ?',
}

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
    select(tablename: string, params: object, fields?: string[]): Promise<any> {
        fields = fields || []
        return this.query(tablename, params, fields)
    }
    private query(tablename: string, params, fields = [], sql = '', values = []): Promise<any> {
        params = params || {}
        let where: string = ''
        let {search, page, size, ...restParams} = params
        page = page || 0
        size = size || 10

        let keys: string[] = Object.keys(restParams)
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i]
            let value = params[key]

            if (where !== '')
                where += ' and '
            
            if (search !== undefined) {
                where += key + ' like ? '
                values.push(`%${value}%`)
            } else {
                where += key + ' = ? '
                values.push(value)
            }
        }

        sql = `SELECT ${fields.length > 0 ? fields.join() : '*'} FROM ${tablename} `
        if (where !== '') {
            sql += ' WHERE ' + where
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
                            reject(G.jsResponse(801, 'database query error.'))
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