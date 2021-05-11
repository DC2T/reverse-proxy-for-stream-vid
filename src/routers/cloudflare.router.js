const express = require("express");
const router = express.Router();
const controller = require("../controllers/cloudflare.controller");

router.get("/get-file/:id", controller.getFile);

module.exports = router;
