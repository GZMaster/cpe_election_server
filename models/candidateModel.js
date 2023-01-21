const mongoose = require("mongoose");
const validator = require("validator");
// const bcrypt = require("bcryptjs");

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
    unique: true,
  },
  level: {
    type: Number,
    required: [true, "A candidate must have a level"],
  },
  matno: {
    type: String,
    required: [true, "A candidate must have a matric number"],
    unique: true,
    validator: {
      validator: function (el) {
        return el.match(/^ENG[0-9]{7}$/);
      },
    },
  },
  picture: {
    type: String,
    required: [true, "A candidate must have a picture"],
  },
  position: {
    type: String,
    required: [true, "A candidate must have a position"],
  },
  votes: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    // unique: true,
    lowercase: true,
    // Validate that the email is a valid format
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  yearofelection: {
    type: Date,
    required: [true, "A candidate must have a year of election"],
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
