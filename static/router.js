angular.module('chatRoomApp').config(function($routeProvider,$locationProvider){
	$locationProvider.html5Mode(true);
	$routeProvider.when('/rooms',{
		templateUrl: '/pages/rooms.html',
		controller: 'RoomsCtrl'
	}).when('/rooms/:_roomId',{
		templateUrl: '/pages/room.html',
		controller: 'RoomCtrl'
	}).when('/login',{
		templateUrl: '/pages/login.html',
		controller: 'LoginCtrl'
	}).otherwise({
		redirectTo: '/login'
	});
});