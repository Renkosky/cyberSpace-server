const router = require('koa-router')()
const User = require('../db/models/user')

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

module.exports = router
