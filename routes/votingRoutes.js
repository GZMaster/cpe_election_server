const express = require("express");
const votingController = require("../controllers/votingController");
const voterController = require("../controllers/voterController");

const router = express.Router();

router.post("/login", voterController.login);

router
  .route("/")
  .get(voterController.protect, votingController.getAllCandidates);
router
  .route("/:id")
  .get(voterController.protect, votingController.candidate)
  .patch(voterController.protect, votingController.submitVote);

module.exports = router;
