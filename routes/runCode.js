const express = require("express");
const runCodeController = require("../controllers/runCodeController");
const router = express.Router();

router.post('/run', runCodeController);

module.exports = router;