## 项目介绍
这是标准数据库封装的上半部分，智能查询（JSON-ORM）的实现。

## 设计思路
将前端送到后端的json对象自动映射成为标准的SQL查询语句。我的这种ORM方式，服务端不需要写一行代码，只需完成关系数据库的设计，就能为前端提供标准服务接口。遵循一套统一的接口来实现数据库封装，达到业务层可以随意切换数据库的目的。

## 适合人群

- Typescript初学者与中级者，带你逐步进入后端开发奇妙世界
- 适合从实战角度来学习编程的人，带你一步步实现一个完整的项目
- node.js平台开发者，与你分享个人的设计思想与编程技巧
- 熟练前端开发者，想步入后端编程的行列，从实战出发吧

## 安装运行 
- 运行数据脚本
    ```
    SET NAMES utf8;
    SET FOREIGN_KEY_CHECKS = 0;

    -- ----------------------------
    --  Table structure for `users`
    -- ----------------------------
    DROP TABLE IF EXISTS `users`;
    CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(255) DEFAULT NULL,
    `password` varchar(255) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `power` json DEFAULT NULL,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

    -- ----------------------------
    --  Records of `users`
    -- ----------------------------
    BEGIN;
    INSERT INTO `users` VALUES ('1', 'white', '123', '22', null), ('2', 'john', '456i', '25', null), ('3', 'marry', null, '22', null), ('4', 'bill', '123', '11', null), ('5', 'alice', '122', '16', null), ('6', 'zhoutk', '123456', '26', null);
    COMMIT;

    SET FOREIGN_KEY_CHECKS = 1;
    ```
- 配置文件示例，./src/config/configs.ts
    ```
    export default {
        inits: {
            directory: {
                run: false,
                dirs: ['public/upload', 'public/temp']
            }
        },
        port: 5000,
        db_dialect: 'mysql',
        dbconfig: {
            db_host: 'localhost',
            db_port: 3306,
            db_name: 'strest',
            db_user: 'root',
            db_pass: '123456',
            db_char: 'utf8mb4',
            db_conn: 10,
        },
        jwt: {
            secret: 'zh-tf2Gp4SFU>a4bh_$3#46d0e85W10aGMkE5xKQ',
            expires_max: 36000      //10小时，单位：秒
        },
    }
    ```
- 在终端（Terminal）中依次运行如下命令
    ```
    git clone https://github.com/zhoutk/gels
    cd gels
    npm i -g yarn
    yarn global install typescript tslint nodemon
    yarn install
    tsc -w          //或 command + shift + B，选 tsc:监视
    yarn start      //或 node ./dist/index.js
    ```
## 项目结构

```
├── package.json
├── src                              //源代码目录
│   ├── app.ts                       //koa配置及启动
│   ├── common                       //通用函数或元素目录
│   │   ├── globUtils.ts 			
│   ├── config                       //配置文件目录
│   │   ├── configs.ts
│   ├── db                           //数据封装目录
│   │   ├── baseDao.ts
│   ├── globals.d.ts                 //全局声明定义文件
│   ├── index.ts                     //运行入口
│   ├── inits                        //启动初始化配置目录
│   │   ├── global.ts
│   │   ├── index.ts
│   │   ├── initDirectory.ts
│   ├── middlewares                  //中间件目录
│   │   ├── globalError.ts
│   │   ├── logger.ts
│   │   ├── router
│   │   └── session.ts
│   └── routers                      //路由配置目录
│       ├── index.ts
│       └── router_rs.ts
├── tsconfig.json
└── tslint.json
```

## 数据库接口设计  
- 事务元素接口，sql参数用于手动书写sql语句，id会作为最后一个参数被送入参数数组。
    ```
    export default interface TransElement {
        table: string;
        method: string;
        params: object | Array<any>;
        sql?: string;
        id?: string | number;
    }
    ```
- 数据库操作接口，包括基本CURD，两个执行手写sql接口，一个批量插入与更新二合一接口，一个事务操作接口。实践证明，下面八个接口，在绝大部分情况下已经足够。
    ```
    export default interface IDao {
        select(tablename: string, params: object, fields?: Array<string>): Promise<any>;
        insert(tablename: string, params: object): Promise<any>;
        update(tablename: string, params: object, id: string|number): Promise<any>;
        delete(tablename: string, id: string|number): Promise<any>;
        querySql(sql: string, values: Array<any>, params: object, fields?: Array<string>): Promise<any>;
        execSql(sql: string, values: Array<any>): Promise<any>;
        insertBatch(tablename: string, elements: Array<any>): Promise<any>;
        transGo(elements: Array<TransElement>, isAsync?: boolean): Promise<any>;
    }
    ```
- BaseDao，为业务层提供标准数据库访问的基类，是自动提供标准rest微服务的关键
	```
	import IDao from './idao'
	let dialect = G.CONFIGS.db_dialect					//依赖注入
	let Dao = require(`./${dialect}Dao`).default    

	export default class BaseDao {
	    private table: string
	    static dao: IDao                               //以组合的模式，解耦业务层与数据库访问层
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
	        return rs
	    }
	    async create(params = {}, fields = [], session = {userid: ''}): Promise<any> {
	        let rs
	        try {
	            rs = await BaseDao.dao.insert(this.table, params)
	        } catch (err) {
	            err.message = `data insert fail: ${err.message}`
	            return err
	        }
	        let { affectedRows } = rs
	        return G.jsResponse(200, 'data insert success.', { affectedRows, id: rs.insertId })
	    }
	    async update(params, fields = [], session = { userid: '' }): Promise<any> {
	        params = params || {}
	        const { id, ...restParams } = params
	        let rs
	        try {
	            rs = await BaseDao.dao.update(this.table, restParams, id)
	        } catch (err) {
	            err.message = `data update fail: ${err.message}`
	            return err
	        }
	        let { affectedRows } = rs
	        return G.jsResponse(200, 'data update success.', { affectedRows, id })
	    }
	    async delete(params = {}, fields = [], session = {userid: ''}): Promise<any> {
	        let id = params['id']
	        let rs
	        try {
	            rs = await BaseDao.dao.delete(this.table, id)
	        } catch (err) {
	            err.message = `data delete fail: ${err.message}`
	            return err
	        }
	        let {affectedRows} = rs
	        return G.jsResponse(200, 'data delete success.', { affectedRows, id })
	    }
	}
	```

## 智能查询（JSON-ORM）
> 查询保留字：fields, page, size, sort, search, lks, ins, ors, count, sum, group

- fields, 定义查询结果字段，支持数组和逗号分隔字符串两种形式
    ```
    查询示例：  /rs/users?username=white&age=22&fields=["username","age"]
    生成sql：   SELECT username,age FROM users  WHERE username = ?  and age = ?
    ```
- page, 分页参数，第几页
- size, 分页参数，每页行数
- sort, 查询结果排序参数
    ```
    查询示例：  /rs/users?page=1&size=10&sort=age desc
    生成sql：   SELECT * FROM users  ORDER BY age desc LIMIT 0,10
    ```
- search, 模糊查询切换参数，不提供时为精确匹配
    ```
    查询示例：  /rs/users?username=i&password=1&search
    生成sql：   SELECT * FROM users  WHERE username like ?  and password like ?
    ```
- ins, 数据库表单字段in查询，一字段对多个值，例：
    ```
    查询示例：  /rs/users?ins=["age",11,22,26]
    生成sql：   SELECT * FROM users  WHERE age in ( ? )
    ```
- ors, 数据库表多字段精确查询，or连接，多个字段对多个值，支持null值查询，例：
    ```
    查询示例：  /rs/users?ors=["age",1,"age",22,"password",null]
    生成sql：   SELECT * FROM users  WHERE  ( age = ?  or age = ?  or password is null )
    ```
- lks, 数据库表多字段模糊查询，or连接，多个字段对多个值，支持null值查询，例：
    ```
    查询示例：  /rs/users?lks=["username","i","password",null]
    生成sql：   SELECT * FROM users  WHERE  ( username like ?  or password is null  )
    ```
- count, 数据库查询函数count，行统计，例：
    ```
    查询示例：  /rs/users?count=["1","total"]&fields=["username"]
    生成sql：   SELECT username,count(1) as total  FROM users
    ```
- sum, 数据库查询函数sum，字段求和，例：
    ```
    查询示例：  /rs/users?sum=["age","ageSum"]&fields=["username"]
    生成sql：   SELECT username,sum(age) as ageSum  FROM users
    ```
- group, 数据库分组函数group，例：
    ```
    查询示例：  /rs/users?group=age&count=["*","total"]&fields=["age"]
    生成sql：   SELECT age,count(*) as total  FROM users  GROUP BY age
    ```

> 不等操作符查询支持

支持的不等操作符有：>, >=, <, <=, <>, =；逗号符为分隔符，一个字段支持一或二个操作。  
特殊处：使用"="可以使某个字段跳过search影响，让模糊匹配与精确匹配同时出现在一个查询语句中

- 一个字段一个操作，示例：
    ```
    查询示例：  /rs/users?age=>,10
    生成sql：   SELECT * FROM users  WHERE age> ?
    ```
- 一个字段二个操作，示例：
    ```
    查询示例：  /rs/users?age=>,10,<=,35
    生成sql：   SELECT * FROM users  WHERE age> ? and age<= ?
    ```
- 使用"="去除字段的search影响，示例：
    ```
    查询示例：  /rs/users?age==,22&username=i&search
    生成sql：   SELECT * FROM users  WHERE age= ?  and username like ?
    ```

## 相关项目地址
凝胶（gels）项目： https://github.com/zhoutk/gels  
视频讲座资料： https://github.com/zhoutk/sifou  
个人博客： https://github.com/zhoutk/blog  

## 相关视频课程
 
[运用typescript进行node.js后端开发精要][1]   
[nodejs实战之智能微服务快速开发框架][2]   
[JSON-ORM（对象关系映射）设计与实现][3]   


  [1]: https://segmentfault.com/l/1500000016954243
  [2]: https://segmentfault.com/l/1500000017034959
  [3]: https://segmentfault.com/l/1500000017108031
