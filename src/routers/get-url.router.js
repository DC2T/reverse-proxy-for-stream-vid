const express = require("express");
const router = express.Router();
const controller = require("../controllers/get-url.controller");

router.get("/url-stream", controller.getUrl);

module.exports = router;
