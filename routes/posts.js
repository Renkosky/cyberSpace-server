const router = require("koa-router")();
const Post = require('../db/models/post')

router.prefix("/api");

router.post('/newPost',async ctx =>{
    const { uid, author,title,content} = ctx.request.body;
    let newpost = await Post.create({
        uid, 
        author, 
        title, 
        content
    })
  if (newpost) {
      ctx.body = {
        code:0,
        message:'发布成功'
      }
    }else{
      ctx.body = {
        code: -1,
        message: "发布失败"
      };
    }
})

router.get("/getAllPosts", async ctx => {
  const posts = await Post.find({});
  if (posts) {
    ctx.body = {
      code:0,
      posts
    };
  }else{
    ctx.body={
      code: -1
    }
   
  }
  
});

module.exports = router