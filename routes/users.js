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
  let user = await User.findOne({
    username
  })
  if (user && user.username) {
    ctx.status = 410
    ctx.body = {
      code: -1,
      message: '该用户名已被注册！'
    }
  } else {
    let newUser = await User.create({
      username,
      password,
      email,
      create_time: new Date()
    })
    if (newUser) {
      let res = await axios.post('api/login', { username, password })

      if (res.data && res.data.code === 0) {
        ctx.body = {
          code: 0,
          message: '注册成功',
          username,
          user_id: newUser._id
        }
      } else {
        ctx.body = { code: -1, message: 'error' }
      }
    } else {
      ctx.status = 500
      ctx.body = { code: -1, mgs: '注册失败' }
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
  let token = ctx.header.authorization
  let payload = jwt.decode(token, jwtSecret)
  let result = await User.findById(id)
  ctx.body = {
    result
  }
  if (result) {
    ctx.body = {
      code: 0,
      userInfo: {
        _id: result._id,
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
router.get('/getUserInfo', async ctx => {
  let token = ctx.header.authorization
  let payload = jwt.decode(token, jwtSecret)
  let { _id } = payload
  let result = await User.findById(_id)
  if (result) {
    ctx.body = {
      code: 0,
      userInfo: {
        username: result.username,
        createTime: result.create_time,
        email: result.email,
        _id: result._id
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
