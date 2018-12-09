const router = require('koa-router')()
const User = require('../db/models/user')
const Redis = require('koa-redis')
const nodeMailer = require('nodemailer')

const store = new Redis().client
router.get('/', function(ctx, next) {
  ctx.body = 'this is a users response!'
})

router.post('/addUser', async ctx => {
  const user = new User({
    username: ctx.request.body.username,
    password: ctx.request.body.password
  })
  let code
  try {
    await user.save()
    code = 0
  } catch (error) {
    code = -1
  }

  ctx.body = {
    code
  }
})

router.post('/getUser', async ctx => {
  const result = await User.findOne({ username: ctx.request.body.name })
  const results = await User.find({ username: ctx.request.body.name || null })
  ctx.body = {
    results
  }
})

router.get('/getAllUser', async ctx => {
  const results = await User.find({})
  ctx.body = {
    results
  }
})

router.post('/updateUser', async ctx => {
  const result = await User.where({
    name: ctx.request.body.name
  }).update({
    name: ctx.request.body.name
  })
  ctx.body = {
    result
  }
})

//注册接口
router.post('register', async ctx => {
  const { username, password, email, code } = ctx.request.body
  //检查验证码
  if (code) {
    //在发验证码时会把验证码保存在redis中这里就要从redis中取出
    const saveCode = await Store.hget(`nodemail:${username}`, 'code')
    const saveExpire = await Store.hget(`nodemail:${username}`, 'expire')
    if (code === saveCode) {
      if (new Date().getTime() - saveExpire > 0) {
        ctx.body = {
          code: -1,
          msg: '验证码过期，请重新尝试'
        }
      } else {
        ctx.body = {
          code: -1,
          msg: '请填写正确的验证码'
        }
      }
    }
  } else {
    ctx.body = {
      code: -1,
      msg: '请填写验证码'
    }
  }
  //检查用户名
})

module.exports = router
