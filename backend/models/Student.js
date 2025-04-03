const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  email: String,
  phone: String,
  department: String,
});

module.exports = mongoose.model("Student", StudentSchema);
