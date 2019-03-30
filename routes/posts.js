const router = require('koa-router')()
const Post = require('../db/models/post')

router.prefix('/api')

router.post('/newPost', async ctx => {
  const { uid, author, title, content } = ctx.request.body
  let newpost = await Post.create({
    uid,
    author,
    title,
    content
  })
  if (newpost) {
    ctx.body = {
      code: 0,
      message: '发布成功'
    }
  } else {
    ctx.body = {
      code: -1,
      message: '发布失败'
    }
  }
})

router.post('/getAllPosts', async ctx => {
  let { page } = ctx.request.body
  page = page || 1
  const posts = await Post.find({})
    .skip((page - 1) * 8)
    .limit(10)
  if (posts) {
    ctx.body = {
      code: 0,
      posts
    }
  } else {
    ctx.body = {
      code: -1
    }
  }
})

router.get('/getPostInfo/:id', async ctx => {
  const { id } = ctx.params
  const postInfo = await Post.findById(id)
  if (postInfo) {
    ctx.body = {
      code: 0,
      postInfo
    }
  } else {
    ctx.body = {
      code: -1
    }
  }
})

router.post('/postComment', async ctx => {
  const { pid, uid, content, author } = ctx.request.body

  const postInfo = await Post.update(
    { _id: pid },
    {
      $addToSet: {
        comments: { uid, author, content, createdAt: new Date() }
      }
    },
    err => {
      if (err) {
        ctx.body = {
          code: -1,
          message: '回复失败'
        }
      } else {
        ctx.body = {
          code: 0,
          message: '回复成功'
        }
      }
    }
  )
})

module.exports = router
