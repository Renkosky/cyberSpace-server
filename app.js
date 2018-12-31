const Koa = require('Koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const mongoose = require('mongoose')
const dbconfig = require('./db/config')
const jwt = require('jsonwebtoken')
const koaJwt = require('koa-jwt')
const axios = require('axios')
var proxy = require('koa-better-http-proxy')
const index = require('./routes/index')
const users = require('./routes/users')
// error handler
onerror(app)
const host = process.env.HOST || '127.0.0.1'
const post = process.env.PORT || 9093

axios.defaults.baseURL = 'http://localhost:9093'

// middlewares
// app.keys = ['keys', 'othkeys'] //session加密
// app.use(
//   session({
//     key: 'cyber',
//     prefix: 'cyber:uid',
//     store: new Redis()
//   })
// )

app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
)
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(
  views(__dirname + '/views', {
    extension: 'pug'
  })
)

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

mongoose.connect(
  dbconfig.dbs,
  {
    useNewUrlParser: true
  }
)
// app中开启koa-passport对session的支持
// initialzie()函数的作用是只是简单为当前context添加passport字段，便于后面的使用。而
// passport.session()则是passport自带的策略，用于从session中提取用户信息，

// app.use(passport.initialize())
// app.use(passport.session())
app.use(
  koaJwt({
    secret: 'jwtSecret'
  }).unless({ path: [/^\//, /^\/login/, /^\register/, /^\/getAllUser/] })
)
// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
//router.allowedMethods() //用在了路由匹配router.routes()之后,所以在当所有路由中间件最后调用.此时根据ctx.status设置response响应头

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})
// app.use(
//   proxy('/register', { target: 'http://127.0.0.1:3000', changeOrigin: true })
// )
module.exports = app
