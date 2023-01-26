const express = require("express");
const votingController = require("../controllers/votingController");
const voterController = require("../controllers/voterController");

const router = express.Router();

router.post("/login", voterController.login);

router
  .route("/")
  .get(voterController.protect, votingController.getAllCandidates)
  .patch(voterController.protect, votingController.submitVote);
router
  .route("/positions")
  .get(voterController.protect, votingController.getPositions);
router
  .route("/votecomplete")
  .patch(voterController.protect, votingController.VotedSuccessfully);
router.route("/voter").get(voterController.protect, votingController.getVoter);

router.route("/image/:id").get(votingController.getImage);

module.exports = router;
