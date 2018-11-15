export default interface IDao {
    select(tablename: string, params: object, fields?: Array<string>): Promise<any>;
    insert(tablename: string, params: object): Promise<any>;
    update(tablename: string, params: object, id: string|number): Promise<any>;
    delete(tablename: string, id: string|number): Promise<any>;
}