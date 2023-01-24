const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const accrediationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
    unique: true,
  },
  level: {
    type: Number,
    required: [true, "An accrediation must have a level"],
  },
  matno: {
    type: String,
    required: [true, "An accrediation must have a matric number"],
    unique: true,
    validator: {
      validator: function (el) {
        return el.match(/^ENG[0-9]{7}$/);
      },
      message: "Please provide a valid matric number",
    },
  },
  email: {
    type: String,
    // unique: true,
    lowercase: true,
    // Validate that the email is a valid format
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  otp: {
    type: String,
    required: [true, "An accrediation must have an OTP"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    // Set a minimum length for the password
    minlength: 8,
  },
  // The password confirmation field
  passwordConfirm: {
    type: String,
    // Validate that the password confirmation matches the password
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  hasVoted: {
    type: Boolean,
    default: false,
  },
  votedCandidates: {
    type: Array,
    ref: "Candidate",
    default: "",
  },
});

accrediationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Hash the password using bcrypt
  this.password = await bcrypt.hash(this.password, 12);

  // Clear the passwordConfirm field
  this.passwordConfirm = undefined;

  // Call the next middleware function
  next();
});

accrediationSchema.methods.passwordDecryption = async function (password) {
  return await bcrypt.decodeBase64(password);
};

accrediationSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

accrediationSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Create a Mongoose model from the schema
const voter = mongoose.model("voter", accrediationSchema);

// Export the model for use in other parts of the application
module.exports = voter;
