let mongoose = require('mongoose');
let {Schema} = mongoose; // let Schema = mongoose.Schema;

let mailSchema = new Schema({
  ip: String,
  lastLogin: String,
  mailsSent: Number
});

mongoose.model('mails', mailSchema);