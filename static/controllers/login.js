angular.module('chatRoomApp').controller('LoginCtrl',function($scope,$http,$location){
	$scope.login = function() {
		$http({
			url: '/api/login',
			method: 'POST',
			data: {
				email:$scope.email
			}
		}).success(function(user,a,b,c,d){
			email=c.data.email;
			$scope.$emit('login',email);
			$location.path('/');
		}).error(function(data) {
			$location.path('/login');
		});
	};
});