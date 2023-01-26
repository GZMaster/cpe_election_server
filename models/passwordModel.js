const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema({
  matno: {
    type: String,
    required: [true, "Please tell us your name!"],
    unique: true,
  },
  password: {
    type: String,
  },
  otp: {
    type: String,
  },
});

const passwords = mongoose.model("password", passwordSchema);

module.exports = passwords;
