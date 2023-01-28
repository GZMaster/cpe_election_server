const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const voter = require("../models/accrediationModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.login = catchAsync(async (req, res, next) => {
  const { matno, password } = req.body;

  // 1) Check if email and password exist
  if (!matno || !password) {
    return next(new AppError("Please provide matno and password!", 400));
  }

  // 2) Check if voter exists && password is correct
  const loggedVoter = await voter.findOne({ matno }).select("+password");

  if (
    !loggedVoter ||
    !(await loggedVoter.correctPassword(password, loggedVoter.password))
  ) {
    return next(new AppError("Incorrect matno or password", 401));
  }

  if (loggedVoter.hasVoted === true) {
    return next(new AppError("You have already voted", 405));
  }

  // 3) If everything ok, send token to client
  const token = signToken(loggedVoter._id);

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

  // 3) Check if voter still exists
  const currentUser = await voter.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The voter belonging to this token does no longer exist.",
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
