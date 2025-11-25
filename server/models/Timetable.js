const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
    unique: true
  },
  schedule: {
    Monday: [
      {
        time: String,
        subject: String,
        teacher: String,
        room: String
      }
    ],
    Tuesday: [
      {
        time: String,
        subject: String,
        teacher: String,
        room: String
      }
    ],
    Wednesday: [
      {
        time: String,
        subject: String,
        teacher: String,
        room: String
      }
    ],
    Thursday: [
      {
        time: String,
        subject: String,
        teacher: String,
        room: String
      }
    ],
    Friday: [
      {
        time: String,
        subject: String,
        teacher: String,
        room: String
      }
    ],
    Saturday: [
      {
        time: String,
        subject: String,
        teacher: String,
        room: String
      }
    ]
  }
});

module.exports = mongoose.model('Timetable', timetableSchema);
