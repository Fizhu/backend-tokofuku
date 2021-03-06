const categoryModels = require('../models/category.model')
const helpers = require('../helpers/helpers')
const fs = require('fs')

const product = {
  getAllCategory: (req, res) => {
    const order = req.query.order
    categoryModels.getAllCategory(order)
      .then(response => {
        const resultCategory = response
        helpers.redisInstance().setex('getAllCategories', 60 * 60 * 12, JSON.stringify(resultCategory))
        helpers.response(res, resultCategory, res.statusCode, helpers.status.found, null)
      }).catch(err => {
        helpers.response(res, [], err.statusCode, null, null, err)
      })
  },

  insertCategory: (req, res) => {
    const {
      name
    } = req.body
    let image
    if (req.file) image = req.file.path
    if (req.uploadErrorMessage) return helpers.response(res, [], 400, null, null, [req.uploadErrorMessage])
    const newCategory = {
      name
    }
    if (image) newCategory.image = `${process.env.BASE_URL}/${image}`
    categoryModels.insertCategory(newCategory)
      .then(response => {
        helpers.redisInstance().del('getAllCategories')
        categoryModels.getCategoryById(response.insertId)
          .then(responseCategory => {
            helpers.response(res, responseCategory, res.statusCode, helpers.status.insert, null)
          }).catch(err => {
            helpers.response(res, [], err.statusCode, null, null, err)
          })
      }).catch(err => {
        helpers.response(res, [], err.statusCode, null, null, err)
      })
  },
  updateCategory: (req, res) => {
    const {
      name,
      oldImage
    } = req.body

    let image
    if (req.file) image = req.file.path
    if (req.uploadErrorMessage) return helpers.response(res, [], 400, null, null, [req.uploadErrorMessage])

    let finalImage
    if (image) {
      if (oldImage === '' || oldImage === 'null' || oldImage === null || !oldImage) {
        finalImage = `${process.env.BASE_URL}/${image}`
      } else {
        finalImage = `${process.env.BASE_URL}/${image}`
        const pathDelete = oldImage.replace(process.env.BASE_URL, '.')
        fs.unlinkSync(pathDelete, (error) => {
          if (error) throw error
        })
      }
    } else {
      finalImage = oldImage
    }
    const newCategory = {
      name,
      image: finalImage,
      updatedAt: new Date()
    }
    const id = req.params.id
    categoryModels.updateCategory(newCategory, id)
      .then(response => {
        helpers.redisInstance().del('getAllCategories')

        categoryModels.getCategoryById(id)
          .then(responseCategory => {
            const resultCategory = responseCategory
            helpers.response(res, resultCategory, res.statusCode, helpers.status.update, null)
          }).catch(err => {
            helpers.response(res, [], err.statusCode, null, null, err)
          })
      }).catch(err => {
        helpers.response(res, [], err.statusCode, null, null, err)
      })
  },
  deleteCategory: (req, res) => {
    const id = req.params.id
    categoryModels.deleteCategory(id)
      .then(response => {
        const resultCategory = response
        helpers.redisInstance().del('getAllCategories')
        helpers.response(res, resultCategory, res.statusCode, helpers.status.delete, null)
      }).catch(err => {
        helpers.response(res, [], err.statusCode, null, null, err)
      })
  },
  getCategoryById: (req, res) => {
    const id = req.params.id
    categoryModels.getCategoryById(id)
      .then(response => {
        const resultCategory = response
        helpers.response(res, resultCategory, res.statusCode, helpers.status.found, null)
      }).catch(err => {
        helpers.response(res, [], err.statusCode, null, null, err)
      })
  }
}

module.exports = product