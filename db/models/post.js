const mongoose = require('mongoose')
const Schema = mongoose.Schema
const postSchema = new Schema({
  uid: {
    type: String,
    unique: true
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
  }
})

module.exports = mongoose.model('post', postSchema, 'posts')
