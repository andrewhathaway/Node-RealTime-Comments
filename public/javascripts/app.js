angular.module('comments', []).controller('comments', function($scope) {
	var socket = io.connect('http://' + location.hostname);

	$scope.comments = [];

	/**
	 * Clear the comments list
	 */
	socket.on('clear', function() {
		$scope.$apply(function() {
			$scope.comments = [];
		});
	});

	/**
	 * When the server sends a comment,
	 * add it to the list of comments
	 */
	socket.on('comment', function(comment) {
		$scope.$apply(function() {
			$scope.comments.push(comment);
		});
	});

	/**
	 * On Add Comment button pressed, send the
	 * comment to the server and clear the form
	 */
	$scope.addComment = function() {
		socket.emit('comment', {
			author: $scope.commentAuthor,
			body: $scope.commentBody
		});
		clearForm();
	};

	/**
	 * On clear comments button pressed,
	 * emit the clear_comments func and clear form
	 */
	$scope.clearComments = function() {
		socket.emit('clear_comments');
		clearForm();
	};

	/**
	 * Clear the form fields
	 */
	function clearForm() {
		$scope.commentAuthor = '';
		$scope.commentBody = '';
	}
});