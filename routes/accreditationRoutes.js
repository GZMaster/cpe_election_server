const express = require("express");
const accreditationController = require("../controllers/accrediationController");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.post("/login", adminController.login);
router.post("/signup", adminController.signup);

router
  .route("/")
  .post(adminController.protect, accreditationController.createAccrediation);
router
  .route("/verify")
  .post(adminController.protect, accreditationController.verifyEmail);
router
  .route("/getvoter")
  .post(adminController.protect, accreditationController.getAccrediation);

module.exports = router;
