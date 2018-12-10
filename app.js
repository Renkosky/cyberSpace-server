// import Koa from 'koa'
// const app = new Koa()
// import views from 'koa-views'
// import static from 'koa-static'
// import json from 'koa-json'
// import onerror from 'koa-onerror'
// import bodyparser from 'koa-bodyparser'
// import session from './middleware/addsession'
// import logger from 'koa-logger'
// import Redis from 'koa-redis'
// import mongoose from 'mongoose'
// import dbconfig from './db/config'
// import users from './routes/users.mjs'
const Koa = require('Koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const addsession = require('./middleware/addsession')
const session = require('koa-generic-session')
const Redis = require('koa-redis')
const mongoose = require('mongoose')
const dbconfig = require('./db/config')
const index = require('./routes/index')
const users = require('./routes/users')
const passport = require('./util/passport')

// error handler
onerror(app)

// middlewares
app.keys = ['keys', 'othkeys'] //session加密
app.use(
  session({
    key: 'cyber',
    prefix: 'cyber:uid',
    store: new Redis()
  })
)
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
)
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))
app.use(addsession())
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

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
// router.allowedMethods()用在了路由匹配router.routes()之后,所以在当所有路由中间件最后调用.此时根据ctx.status设置response响应头
mongoose.connect(
  dbconfig.dbs,
  {
    useNewUrlParser: true
  }
)
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
