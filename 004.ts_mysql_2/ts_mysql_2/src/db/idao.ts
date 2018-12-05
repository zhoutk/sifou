import TransElement from './transElement';

export default interface IDao {
    select(tablename: string, params: object, fields?: Array<string>): Promise<any>;
    create(tablename: string, params: object): Promise<any>;
    update(tablename: string, params: object, id: number|string): Promise<any>;
    delete(tablename: string,  id: number|string): Promise<any>;
    querySql(sql: string, values: Array<any>, params: object, fields?: Array<string>): Promise<any>;
    execSql(sql: string, values: Array<any>): Promise<any>;
    insertBatch(tablename: string, elements: Array<any>): Promise<any>;
    transGo(element: Array<TransElement>, isAsync?: boolean): Promise<any>;
}
