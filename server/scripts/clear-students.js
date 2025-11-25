const mongoose = require('mongoose');
const Student = require('../models/Student');

const dbURI = 'mongodb://localhost:27017/crud-demo';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected for clearing students');
    return Student.deleteMany({});
  })
  .then(() => {
    console.log('All students deleted');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error clearing students:', err);
    mongoose.connection.close();
  });