const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const voter = require("../models/accrediationModel");
const { generateOTP } = require("../utils/otpGenerator");
const generatePassword = require("../utils/generatePassword");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.verifyEmail = catchAsync(async (req, res, next) => {
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

exports.createAccrediation = catchAsync(async (req, res, next) => {
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

exports.getAccrediation = catchAsync(async (req, res, next) => {
  const user = await voter.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("No voter found with that MatNo", 404));
  }

  if (user.isVerified === false) {
    return next(new AppError("Voter not verified", 400));
  }

  if (
    !user ||
    !(await user.correctPassworsd(req.body.password, user.password))
  ) {
    return next(new AppError("Incorrect password", 401));
  }

  const decoded = await promisify(jwt.verify)(
    user.password,
    process.env.JWT_SECRET
  );

  res.status(200).json({
    status: "success",
    data: {
      decoded,
    },
  });
});
