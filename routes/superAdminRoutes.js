const express = require("express");
const superAdminController = require("../controllers/superAdminController");

const router = express.Router();

router.post("/login", superAdminController.login);
router.post("/signup", superAdminController.signup);

router
  .route("/candidate")
  .get(superAdminController.protect, superAdminController.getAllCandidates)
  .post(superAdminController.protect, superAdminController.createCandidate);

router
  .route("/candidate/:id")
  .get(superAdminController.protect, superAdminController.getCandidate)
  .patch(superAdminController.protect, superAdminController.updateCandidate)
  .delete(superAdminController.protect, superAdminController.deleteCandidate);

router
  .route("/voter")
  .get(superAdminController.protect, superAdminController.getAllVoters)
  .post(superAdminController.protect, superAdminController.createVoter);

router
  .route("/voter/:id")
  .get(superAdminController.protect, superAdminController.getVoter)
  .patch(superAdminController.protect, superAdminController.updateVoter)
  .delete(superAdminController.protect, superAdminController.deleteVoter);

router
  .route("/voter/:id/verify")
  .post(superAdminController.protect, superAdminController.verifyVoter);

router
  .route("/voter/:id/unverify")
  .post(superAdminController.protect, superAdminController.unverifyVoter);

router
  .route("/admin")
  .get(superAdminController.protect, superAdminController.getAllAdmins)
  .post(superAdminController.protect, superAdminController.createAdmin);

router
  .route("/admin/:id")
  .get(superAdminController.protect, superAdminController.getAdmin)
  .patch(superAdminController.protect, superAdminController.updateAdmin)
  .delete(superAdminController.protect, superAdminController.deleteAdmin);

module.exports = router;
