angular.module('chatRoomApp').controller('RoomCtrl',function($scope,socket){
	$scope.messages = [];
	socket.emit('getRoom');

	socket.on('roomData',function(room) {
		$scope.room = room;
	});

	socket.on('messageAdded',function(message){
		$scope.room.messages.push(message);
	});
	socket.on('online',function(user){
		$scope.room.users.push(user);
	});
	socket.on('offline',function(user){
		var _userId = user._id;
		$scope.room.users = $scope.room.users.filter(function(user){
			return user._id != _userId;
		});
	});
});
