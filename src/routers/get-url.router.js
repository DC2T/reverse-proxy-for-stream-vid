const express = require('express')
const router = express.Router()
const controller = require('../controllers/hydrax.controller')

router.get('/url-stream', controller.getUrl)

module.exports = router
