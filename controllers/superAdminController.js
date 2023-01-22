const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const superAdmin = require("../models/superAdminModel");
const candidate = require("../models/candidateModel");
const voter = require("../models/accrediationModel");
const admin = require("../models/adminModel");
const { generateOTP } = require("../utils/otpGenerator");
const generatePassword = require("../utils/generatePassword");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newSuperAdmin = await superAdmin.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newSuperAdmin._id);

  res.status(201).json({
    status: "success",
    token,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // 2) Check if superAdmin exists && password is correct
  const newSuperAdmin = await superAdmin.findOne({ email }).select("+password");

  if (
    !newSuperAdmin ||
    !(await newSuperAdmin.correctPassword(password, newSuperAdmin.password))
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  const token = signToken(newSuperAdmin._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const freshSuperAdmin = await superAdmin.findById(decoded.id);

  if (!freshSuperAdmin) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (freshSuperAdmin.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.superAdmin = freshSuperAdmin;
  next();
});

// Candidate Routes
exports.createCandidate = catchAsync(async (req, res, next) => {
  const newCandidate = await candidate.create({
    name: req.body.name,
    email: req.body.email,
    level: req.body.level,
    picture: req.body.picture,
    position: req.body.position,
  });

  res.status(201).json({
    status: "success",
    data: {
      candidate: newCandidate,
    },
  });
});

exports.getAllCandidates = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(candidate.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const candidates = await features.query;

  res.status(200).json({
    status: "success",
    results: candidates.length,
    data: {
      candidates,
    },
  });
});

exports.getCandidate = catchAsync(async (req, res, next) => {
  const candidateInfo = await candidate.findById(req.params.id);

  if (!candidateInfo) {
    return next(new AppError("No candidate found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      candidate: candidateInfo,
    },
  });
});

exports.updateCandidate = catchAsync(async (req, res, next) => {
  const updatedCandidate = await candidate.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCandidate) {
    return next(new AppError("No candidate found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      candidate: updatedCandidate,
    },
  });
});

exports.deleteCandidate = catchAsync(async (req, res, next) => {
  const candidateInfo = await candidate.findByIdAndDelete(req.params.id);

  if (!candidateInfo) {
    return next(new AppError("No candidate found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Voter Routes
exports.createVoter = catchAsync(async (req, res, next) => {
  const createPassword = generatePassword(process.env.PASSWORD_LENGTH);
  const { matno } = req.body;
  const otp = generateOTP();

  await voter.create({
    ...req.body,
    otp,
    password: createPassword,
    passwordConfirm: createPassword,
  });

  res.status(201).json({
    status: "success",
    data: {
      password: createPassword,
      otp: otp,
      matno: matno,
    },
  });
});

exports.getAllVoters = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(voter.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const voters = await features.query;

  res.status(200).json({
    status: "success",
    results: voters.length,
    data: {
      voters,
    },
  });
});

exports.getVoter = catchAsync(async (req, res, next) => {
  const voterInfo = await voter.findById(req.params.id);

  if (!voterInfo) {
    return next(new AppError("No voter found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      voter: voterInfo,
    },
  });
});

exports.updateVoter = catchAsync(async (req, res, next) => {
  const updatedVoter = await voter.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedVoter) {
    return next(new AppError("No voter found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      voter: updatedVoter,
    },
  });
});

exports.deleteVoter = catchAsync(async (req, res, next) => {
  const voterInfo = await voter.findByIdAndDelete(req.params.id);

  if (!voterInfo) {
    return next(new AppError("No voter found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.verifyVoter = catchAsync(async (req, res, next) => {
  const { matno, otp } = req.body;
  const user = await voter.findOne({
    matno,
    otp,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (user.otp !== otp) {
    return next(new AppError("Invalid OTP", 400));
  }
  user.isVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.unverifyVoter = catchAsync(async (req, res, next) => {
  const { matno } = req.body;
  const user = await voter.findOne({
    matno,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  user.isVerified = false;
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Admin Routes
exports.createAdmin = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  await admin.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  res.status(201).json({
    status: "success",
    data: {
      password: password,
      email: email,
    },
  });
});

exports.getAllAdmins = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(admin.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const admins = await features.query;

  res.status(200).json({
    status: "success",
    results: admins.length,
    data: {
      admins,
    },
  });
});

exports.getAdmin = catchAsync(async (req, res, next) => {
  const adminInfo = await admin.findById(req.params.id);

  if (!adminInfo) {
    return next(new AppError("No admin found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      admin: adminInfo,
    },
  });
});

exports.updateAdmin = catchAsync(async (req, res, next) => {
  const updatedAdmin = await admin.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedAdmin) {
    return next(new AppError("No admin found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      admin: updatedAdmin,
    },
  });
});

exports.deleteAdmin = catchAsync(async (req, res, next) => {
  const adminInfo = await admin.findByIdAndDelete(req.params.id);

  if (!adminInfo) {
    return next(new AppError("No admin found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
