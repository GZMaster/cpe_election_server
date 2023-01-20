const express = require("express");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.post("/login", adminController.login);
router.post("/signup", adminController.signup);

module.exports = router;
