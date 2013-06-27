var condition = require('condition');

module.exports = function(io) {

	/**
	 * Connect to the DB
	 */
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/comments');

	/**
	 * Variables used throughout
	 */
	var db = mongoose.connection;
	var open = false;
	var commentSchema;
	var Comment;

	var currentComments = [];

	/**
	 * If DB error, console it
	 */
	db.on('error', console.error.bind(console, 'connection error'));

	/**
	 * When the DB connection is open,
	 * create the Comment schema and find 
	 * all comments and add them to the 
	 * currentComments array
	 */
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

	/**
	 * When connected
	 */
	io.sockets.on('connection', function(s) {

		s.emit('clear');
		var has_set = false;

		s.set('comment_index', 0, function() {
			has_set = true;
		});

		/**
	 	 * Send the comments to the client
	 	 */
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

		/**
	 	 * When a new comment is sent,
	 	 * save to DB and add to currentComments
	 	 */
		s.on('comment', function(comment) {
			condition.wait(function() {
				return open;
			}, function() {

				currentComments.push(comment);

				var model = new Comment(comment);
				model.save();
			});
		});

		/**
	 	 * Clear the comments from the DB
	 	 */
		s.on('clear_comments', function() {
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