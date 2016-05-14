angular.module('chatRoomApp').config(function($routeProvider,$locationProvider){
	$locationProvider.html5Mode(true);
	$routeProvider.when('/',{
		templateUrl: '/pages/room.html',
		controllers: 'RoomCtrl'
	}).when('/login',{
		templateUrl: '/pages/login.html',
		controllers: 'LoginCtrl'
	}).otherwise({
		redirectTo: '/login'
	});
});