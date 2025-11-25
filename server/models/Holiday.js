const mongoose = require("mongoose");

const HolidaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  // You can add more fields here if needed, like who created the holiday
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  // }
});

module.exports = mongoose.model("Holiday", HolidaySchema);
