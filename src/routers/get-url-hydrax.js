const express = require('express')
const router = express.Router()
const controller = require('../controllers/hydrax.controller')

router.get('/url-hydrax/:id', controller.getUrl)

module.exports = router
