export default {
    http_log_print: true,
    db_dialect: 'mysql',
    port: 5000,
    dbconfig: {
        db_host: 'localhost',
        db_port: 3306,
        db_name: 'strest',
        db_user: 'root',
        db_pass: '123456',
        db_char: 'utf8mb4',
        db_conn: 10
    },
    jwt: {
        secret: '8q3hy78q3tjw4tw7yerth34t8yyrq',
        expires_max : 36000 
    }
}