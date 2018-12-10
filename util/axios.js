const axios = require('axios')

const instance = axios.create({
  baseURL: `http://${process.env.HOST || 'localhost'}:${
    process.env.PORT
  }||9093`,
  timeout: 100,
  headers: {}
})
