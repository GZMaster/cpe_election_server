const voter = require("../models/accrediationModel");
const Candidate = require("../models/candidateModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const incrementVotes = catchAsync(async (candidateId) => {
  await Candidate.updateOne({ _id: candidateId }, { $inc: { votes: 1 } });
});

exports.getAllCandidates = catchAsync(async (req, res, next) => {
  const candidates = await Candidate.find();

  res.status(200).json({
    status: "success",
    data: {
      candidates,
    },
  });
});

exports.candidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id);

  if (!candidate) {
    return next(new AppError("No candidate found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      candidate,
    },
  });
});

exports.submitVote = catchAsync(async (req, res, next) => {
  const { matno } = req.body;
  const user = await voter.findOne({ matno, isVerified: true });

  const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!candidate) {
    return next(new AppError("No candidate found with that ID", 404));
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.hasVoted === true) {
    return next(new AppError("You have already voted", 400));
  }

  incrementVotes(req.params.id);

  user.hasVoted = true;
  await user.save();

  res.status(201).json({
    status: "success",
    data: {
      message: "Vote submitted successfully",
    },
  });
});
