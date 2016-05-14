var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatRoom');
exports.User = mongoose.model('User',require('./user'));