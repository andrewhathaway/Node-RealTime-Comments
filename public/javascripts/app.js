angular.module('comments', []).controller('comments', function($scope) {
	var socket = io.connect('http://' + location.hostname);

	$scope.comments = [];

	socket.on('clear', function() {
		$scope.$apply(function() {
			$scope.comments = [];
		});
	})

	socket.on('comment', function(comment) {
		$scope.$apply(function() {
			$scope.comments.push(comment);
		});
	});

	$scope.addComment = function() {
		socket.emit('comment', {
			author: $scope.commentAuthor,
			body: $scope.commentBody
		});
		$scope.commentAuthor = '';
		$scope.commentBody = '';
	};

	$scope.clearComments = function() {
		socket.emit('clear_comments');
		
		$scope.commentAuthor = '';
		$scope.commentBody = '';
	};
});