export default interface IDao {
    select(tablename: string, params: object, fields?: Array<string>): Promise<any>;
    create(tablename: string, params: object): Promise<any>;
    update(tablename: string, params: object, id: number|string): Promise<any>;
    delete(tablename: string,  id: number|string): Promise<any>;
}