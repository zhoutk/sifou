export default {
    inits: {
        directory: {
            run: true,
            dirs: ['public/upload', 'public/bookimages']
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