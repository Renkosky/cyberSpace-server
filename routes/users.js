const router = require('koa-router')()
const User = require('../db/models/user')
const Redis = require('koa-redis')
const nodemailer = require('nodemailer')
const Email = require('../db/config')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const koaJwt = require('koa-jwt')
const passport = require('koa-passport')
const Store = new Redis().client

const jwtSecret = 'secretCyberSpace'
const tokenExpiresTime = 1000 * 60 * 60 * 24 * 7

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
  console.log(process.env.NODE_ENV)
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

  let newUser = await User.create({ username, password, email, creat_time:new Date() });
  if (newUser) {
    let res = await axios.post('/login', {
      username,
      password,
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
  console.log(username, password)
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
      data: token,
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

router.post('/verify', async (ctx, next) => {
  let { username } = ctx.request.body
  const saveExpire = await Store.hget(`ndoemail:${username}`, 'expire')
  if (saveExpire && new Date().getTime() - saveExpire > 0) {
    ctx.body = {
      code: -1,
      msg: '验证过于频繁，1分钟内一次'
    }
    return false
  }
  let transporter = nodemailer.createTransport({
    host: Email.smtp.host,
    port: 587,
    secure: false,
    auth: {
      user: Email.smtp.user,
      pass: Email.smtp.pass
    }
  })
  let ko = {
    code: Email.smtp.code(),
    expire: Email.smtp.expire(),
    email: ctx.request.body.email,
    user: ctx.request.body.username
  }
  let mailOptions = {
    from: `"认证邮件" <${Email.smtp.user}>`,
    to: ko.email,
    subject: 'Syberspace注册码',
    html: `您的邀请码是${ko.code}`
  }
  await transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return console.log('error')
    } else {
      Store.hmset(
        `nodemail:${ko.user}`,
        'code',
        ko.code,
        'expire',
        ko.expire,
        'email',
        ko.email
      )
    }
  })

  ctx.body = {
    code: 0,
    msg: '验证码发送，请等待'
  }
})

router.get('/exit', async (ctx, next) => {
  await ctx.logout()
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      code: 0
    }
  } else {
    ctx.body = {
      code: -1
    }
  }
})
router.get('/getUser', async ctx => {
  if (!ctx.isAuthenticated()) {
    const { username, email } = ctx.session.passport.user
    ctx.body = {
      user: username,
      email
    }
  } else {
    ctx.body = {
      user: '',
      email: ''
    }
  }
})
module.exports = router
