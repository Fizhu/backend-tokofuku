const express = require('express')

const routeProduct = require('./product.routes')
const routeCategory = require('./category.routes')
const routeUser = require('./user.routes')
const routeAuth = require('./auth.routes')
const routeReview = require('./review.routes')
const router = express.Router()

router
  .use('/products', routeProduct)
  .use('/categories', routeCategory)
  .use('/users', routeUser)
  .use('/auth', routeAuth)
  .use('/reviews', routeReview)

module.exports = router