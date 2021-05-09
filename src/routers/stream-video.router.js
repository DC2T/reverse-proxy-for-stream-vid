const express = require("express");
const router = express.Router();
const controller = require("../controllers/drive-stream.controller");

router.get("/stream-video", controller.getLinkStream, controller.streamVideo);

module.exports = router;
