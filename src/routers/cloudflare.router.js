const express = require("express");
const router = express.Router();
const controller = require("../controllers/cloudflare.controller");

router.get("/get-file/:id", controller.getFile);
router.get("/stream-video-m3u8/:id", controller.streamVideoM3u8);

module.exports = router;
