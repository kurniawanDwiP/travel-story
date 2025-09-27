const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  createOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('user', userSchema);
