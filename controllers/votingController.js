const path = require("path");
const voter = require("../models/accrediationModel");
const Candidate = require("../models/candidateModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const incrementVotes = catchAsync(async (candidateId) => {
  await Candidate.updateOne({ _id: candidateId }, { $inc: { votes: 1 } });
});

exports.getAllCandidates = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Candidate.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const candidates = await features.query;

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
  const user = await voter.findById(req.user.id);
  const { vote } = req.body;

  if (!vote) {
    return next(new AppError("No vote found in the request body", 400));
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.hasVoted === true) {
    return next(new AppError("You have already voted", 400));
  }

  if (user.votedCandidates.includes(vote)) {
    return next(new AppError("You have already voted for this candidate", 400));
  }

  const candidate = await Candidate.findById(vote);
  if (!candidate) {
    return next(new AppError(`No candidate found with ID ${vote}`, 404));
  }
  await incrementVotes(vote);

  user.votedCandidates.push(vote);

  await user.save();

  res.status(201).json({
    status: "success",
    data: {
      message: "Vote submitted successfully",
    },
  });
});

exports.getPositions = catchAsync(async (req, res, next) => {
  const positions = await Candidate.find().distinct("position");

  res.status(200).json({
    status: "success",
    data: {
      positions,
    },
  });
});

exports.VotedSuccessfully = catchAsync(async (req, res, next) => {
  const user = await voter.findById(req.user.id);

  user.hasVoted = true;
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      message: "You have successfully voted Completely",
    },
  });
});

exports.getImage = catchAsync(async (req, res) => {
  // Find the candidate by ID
  const candidate = await Candidate.findById(req.params.id);
  // If the candidate or the image path is not found, return a 404 error
  if (!candidate || !candidate.imagePath) {
    return res.status(404).send("Image not found");
  }
  // Send the image to the client using the res.sendFile() method
  // The first parameter is the path to the image file on the server
  // The second parameter is an optional options object
  res.sendFile(candidate.imagePath, { root: path.join(__dirname, "../") });
  res.type("jpeg");

  res.set("Cache-Control", "public, max-age=31557600");
});

exports.getVoter = catchAsync(async (req, res, next) => {
  const user = await voter.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  console.log(user);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
