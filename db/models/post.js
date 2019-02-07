const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentsSchema = new Schema({
  uid: {
    type: String,
  },
  author: {
    type: String,
  },
  title: {
    type: String,
  },
  // content: {
  //   type: String,
  //   default: ""
  // },
  createdAt:{
    type: Date, default: new Date()
  }
});
const postSchema = new Schema({
  uid: {
    type: String,
    required:true
  },
  author: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  comments:{
    type:Array,
    default: []
  },
  createdAt: {
    type: Date, default: new Date()
  }
})


module.exports = mongoose.model('post', postSchema, 'posts')
