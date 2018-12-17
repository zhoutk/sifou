# 蜘蛛实时爬取数据提供图书信息微服务

> 相关视频： 

- [运用typescript进行node.js后端开发精要][1]  
- [nodejs实战之智能微服务快速开发框架][2] 
- [JSON-ORM（对象关系映射）设计与实现][3] 
- [Koa2封装数据库高级操作][4] 
- [蜘蛛实时爬取数据提供图书信息微服务][5]  

## 特点
- 成熟项目经验，经过总结、提炼、精简、重构，实现图书信息的实时抓取并提供restful服务。  
- 一种ajax动态内页内容的抓取的讲解。
- 正则表达式与内页解析工具的实战。
- 课程内容与结构经过精心准备，设计合理、节奏紧凑、内容翔实。
- 真实再现了思考、编码、调试、除错的整个开发过程。


## 项目介绍
基于gels（凝胶项目）-- 一个微服务管理快速开发框架和网络爬虫技术开发图书信息微服务，使用typescript语言编写。  

## 设计思路
使用gels，只需要关注核心业务，其它由框架提供快速开发接口。图书信息实时抓取并使用自制循环队列进行缓存和批量写入数据库，图片都保存到本地。即：一本书只到网上爬取一次，并用循环队列来减少数据库交互，加大并发支持。

## 适合人群

- Typescript初学者与中级者，带你逐步进入后端开发奇妙世界
- 适合从实战角度来学习编程的人，带你一步步实现一个完整的项目
- node.js平台开发者，与你分享个人的设计思想与编程技巧
- 熟练前端开发者，想步入后端编程的行列，从实战出发吧
- 想了解网页爬虫与动态网页抓取技术的实践者

## gels安装运行 
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
- 运行数据脚本，建立图书存储表
    ```
        CREATE TABLE `books` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `isbn` varchar(32) NOT NULL DEFAULT '',
        `book_name` varchar(1024) DEFAULT '',
        `author_name` varchar(128) DEFAULT '',
        `publisher` varchar(1024) DEFAULT '',
        `publish_day` varchar(64) DEFAULT NULL,
        `details_json` json DEFAULT NULL,
        `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
        `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `isbn` (`isbn`)
        ) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8;
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

## 项目结构

```
├── package.json
├── src                              //源代码目录
│   ├── app.ts                       //koa配置及启动
│   ├── common                       //通用函数或元素目录
│   │   ├── globUtils.ts 			
│   ├── config                       //配置文件目录
│   │   ├── configs.ts
|   ├── dao   
|   |   ├── books.ts                 //图书抓取业务
│   ├── db                           //数据封装目录
│   │   ├── baseDao.ts
│   ├── globals.d.ts                 //全局声明定义文件
│   ├── index.ts                     //运行入口
│   ├── inits                        //启动初始化配置目录
│   │   ├── global.ts
│   ├── middlewares                  //中间件目录
│   │   └── session.ts
│   └── routers                      //路由配置目录
│       └── router_rs.ts
├── tsconfig.json
└── tslint.json
```

## 使用的数据库接口
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
## 使用默认路由

- /rs/:table[/:id]，支持四种restful请求，GET, POST, PUT, DELELTE，除GET外，其它请求检测是否授权

## 提供的restful_api
- [GET] /rs/books[?key=value&...], 列表查询，支持各种智能查询
- [GET] /rs/books/{isbn}, 单条查询，若缓存及库中没有，从网络爬取图书信息
- [POST] /rs/books, 新增图书信息
- [PUT] /rs/books/{id}, 修改图书信息
- [DELETE] /rs/books/{id}, 删除图书信息

## 相关视频课程
 
[运用typescript进行node.js后端开发精要][1]  
[nodejs实战之智能微服务快速开发框架][2]  
[JSON-ORM（对象关系映射）设计与实现][3]  
[Koa2封装数据库高级操作][4]  
[蜘蛛实时爬取数据提供图书信息微服务][5]
  
## 资源地址

凝胶（gels）项目： https://github.com/zhoutk/gels  
视频讲座资料： https://github.com/zhoutk/sifou  
个人博客： https://segmentfault.com/blog/zhoutk  

  [1]: https://segmentfault.com/l/1500000016954243
  [2]: https://segmentfault.com/l/1500000017034959
  [3]: https://segmentfault.com/l/1500000017108031
  [4]: https://segmentfault.com/l/1500000017274102
  [5]: https://segmentfault.com/l/1500000017329004
