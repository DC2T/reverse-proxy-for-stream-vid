const express = require('express')
const router = express.Router()
const controller = require('../controllers/motphjm-stream.controller')

router.get('/stream-m3u8-mp/:chuck', controller.stream)

module.exports = router
