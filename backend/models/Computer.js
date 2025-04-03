const mongoose = require("mongoose");

const ComputerSchema = new mongoose.Schema({
  name: String,
  location: String,
  specifications: String,
  availability: Boolean,
});

module.exports = mongoose.model("Computer", ComputerSchema);
