const router = require('koa-router')()
const User = require('../db/models/user')
const Redis = require('koa-redis')
const nodemailer = require('nodemailer')
const Email = require('../db/config')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const koaJwt = require('koa-jwt') //路由权限控制
const passport = require('koa-passport')
const Store = new Redis().client

const mongoose = require('mongoose')
const jwtSecret = 'secretCyberSpace'
const tokenExpiresTime = 1000 * 60 * 60 * 24 * 7
router.prefix('/api')
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
router.post('/register', async ctx => {
  // const { username, password, email, code } = ctx.request.body
  const { username, password, email } = ctx.request.body

  //检查用户名
  let user = User.find({
    username
  })
  if (user.length) {
    ctx.stats = 410
    ctx.body = {
      code: -1,
      msg: '已被注册'
    }
  }

  let newUser = await User.create({
    username,
    password,
    email,
    create_time: new Date()
  })
  if (newUser) {
    let res = await axios.post('/login', {
      username,
      password
    })

    if (res.data && res.data.code === 0) {
      ctx.body = {
        code: 0,
        msg: '注册成功',
        username,
        user_id: newUser._id
      }
    } else {
      ctx.body = {
        code: -1,
        msg: 'error'
      }
    }
  } else {
    ctx.status = 500
    ctx.body = {
      code: -1,
      mgs: '注册失败'
    }
  }
})

router.post('/login', async (ctx, next) => {
  const { username, password } = ctx.request.body
  const result = await User.findOne({
    username: username,
    password: password
  })
  if (result) {
    let payload = {
      name: result.username,
      _id: result.id
    }
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: tokenExpiresTime
    })
    return (ctx.body = {
      code: 0,
      token: token,
      _id: result.id,
      message: '登陆成功'
    })
  } else {
    return (ctx.body = {
      code: -1,
      data: null,
      message: '用户名或密码错误'
    })
  }
})

router.get('/getUserById/:id', async ctx => {
  let { id } = ctx.params
  let result = await User.findById(id)
  ctx.body = {
    result
  }
  if (result) {
    ctx.body = {
      code: 0,
      userInfo: {
        username: result.username,
        createTime: result.create_time,
        email: result.email
      }
    }
  } else {
    ctx.body = {
      code: -1,
      message: '没有这个用户'
    }
  }
})
module.exports = router
