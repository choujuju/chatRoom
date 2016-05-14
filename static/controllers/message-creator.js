angular.module('chatRoomApp').controller('MessageCreatorCtrl',function($scope,socket){	
	$scope.newMessage = '';
	$scope.createMessage = function() {
		if($scope.newMessage == ''){
			return;
		}
		socket.emit('createMessage',{
			message: $scope.newMessage,
			creator: $scope.me
		});
		$scope.newMessage = '';
	};
});
