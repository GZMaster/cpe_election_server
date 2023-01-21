const express = require("express");
const votingController = require("../controllers/votingController");

const router = express.Router();

router.route("/").get(votingController.getAllCandidates);
router
  .route("/:id")
  .get(votingController.candidate)
  .patch(votingController.submitVote);

module.exports = router;
