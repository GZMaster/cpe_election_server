const mongoose = require("mongoose");
const validator = require("validator");

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
  imagePath: {
    type: String,
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
    default: Date.now(),
    select: false,
  },
});

candidateSchema.pre("save", function (next) {
  this.imagePath = `public/images/${this.name}.jpg`;
  next();
});

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
