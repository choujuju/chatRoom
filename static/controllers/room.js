angular.module('chatRoomApp').controller('RoomCtrl',function($scope,$routeParams,socket){
	$scope.messages = [];
	socket.emit('getAllRooms',{
		_roomId: $routeParams._roomId
	});
	socket.on('roomData.'+$routeParams._roomId,function(room) {
		$scope.room = room;
	});
	socket.on('joinRoom',function(join){
		$scope.room.users.push(join.user);
	});
	socket.on('messageAdded',function(message){
		$scope.room.messages.push(message);
	});
	$scope.$on('$routeChangeStart',function(){
		socket.emit('leaveRoomMessage',{
			user:$scope.me,
			room:$scope.room
		});
	});
	socket.on('leaveRoomBroadcast',function(leave){
		var _userId = leave.user._id;
		$scope.room.users = $scope.room.users.filter(function(user){
			return user._id != _userId;
		});
	});
	/*
	socket.on('online',function(user){
		$scope.room.users.push(user);
	});
	socket.on('offline',function(user){
		var _userId = user._id;
		$scope.room.users = $scope.room.users.filter(function(user){
			return user._id != _userId;
		});
	});
	*/
});
