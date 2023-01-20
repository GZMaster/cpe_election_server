const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    // Set a minimum length for the password
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "A user must have a password confirmation"],
    // Validate that the password confirmation matches the password
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
});

adminSchema.pre("save", async function (next) {
  // If the password hasn't been modified, there's no need to hash it again
  if (!this.isModified("password")) return next();

  // Hash the password using bcrypt
  this.password = await bcrypt.hash(this.password, 12);

  // Clear the passwordConfirm field
  this.passwordConfirm = undefined;

  // Call the next middleware function
  next();
});

adminSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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
const Admin = mongoose.model("Admin", adminSchema);

// Export the model for use in other parts of the application
module.exports = Admin;
