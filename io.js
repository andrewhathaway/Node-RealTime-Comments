var condition = require('./condition');

module.exports = function(io) {

	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/comments');

	var db = mongoose.connection;
	var open = false;
	var commentSchema;
	var Comment;

	var currentComments = [];

	db.on('error', console.error.bind(console, 'connection error'));

	db.once('open', function() {

		open = true;

		commentSchema = mongoose.Schema({
			author : String,
			body : String
		});

		Comment = mongoose.model('Comment', commentSchema);

		Comment.find({}, function(err, comments) {
			if(!err) {
				comments.forEach(function(comment) {
					currentComments.push({
						author: comment.author,
						body: comment.body
					});
				});
			} else {
				throw err;
			}
		});
	});

	io.sockets.on('connection', function(s) {

		s.emit('clear');

		var has_set = false;

		s.set('comment_index', 0, function() {
			has_set = true;
		});

		condition.when(function(done) {

			if (!has_set) {
				return done(false);
			}

			s.get('comment_index', function(err, comment_index) {
				if (err) throw err;
				done(comment_index !== currentComments.length);
			});

		}, function() {

		s.get('comment_index', function(err, comment_index) {
			if (err) throw err;
			var comments_to_send = currentComments.slice(comment_index, currentComments.length);

			comments_to_send.forEach(function(comment) {
				s.emit('comment', comment);
			});

			s.set('comment_index', comment_index + comments_to_send.length);
		});

		});
		s.on('comment', function(comment) {
			condition.wait(function() {
				return open;
			}, function() {

				currentComments.push(comment);

				var model = new Comment(comment);
				model.save();
			});
		});

		s.on('clear_comments', function() {
			console.log('ran');
			condition.wait(function() {
				return open;
			}, function() {
				Comment.collection.drop();
				currentComments = [];
				s.emit('clear');
			});
		});
	});

};