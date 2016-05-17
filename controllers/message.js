var db = require('../models');

exports.create = function(message, callback) {
	var msg = new db.Message();
	msg.content = message.message;
	msg.creator = message.creator;
	msg._roomId = message._roomId;
	msg.save(callback);
};

exports.read = function(callback) {
	db.Message.find({},null,{
		sort: {
			'createAt': -1
		},
		limit: 20
	},callback);
};