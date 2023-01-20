const voter = require("../models/accrediationModel");
const catchAsync = require("../utils/catchAsync");
const generatePassword = require("../utils/generatePassword");
const AppError = require("../utils/appError");
const { generateOTP } = require("../utils/otpGenerator");

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
