var nbaApp = /**
* nbaApp Module
*
* Description
*/
angular.module('nbaApp', ['ui.router', 'ui.bootstrap', 'ngProgressLite']);

nbaApp.directive('youtubeVideo', function(){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: {}, // {} = isolate, true = child, false/undefined = no change
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		// templateUrl: '',
		replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			
		},
		scope: {
			videoCode: '@videoCode'
		},
		templateUrl: 'templates/youtube-embed.html',
		controller: function($scope) {
			$scope.videoUrl = "http://www.youtube.com/embed/" + $scope.videoCode;
		}
	};
});

nbaApp.directive('nbaPlayerYoutubeVideo', function() {
	// http://gdata.youtube.com/feeds/api/videos?q=puppy&alt=json&max-results=30&format=5

	return {
		replace: true,
		restrict: 'E',
		scope: {
			playerName: '@playerName'
		},
		templateUrl: 'templates/youtube-grid.html',
		controller: function($scope, $http) {
			var url = "http://gdata.youtube.com/feeds/api/videos?q=" + $scope.playerName + "&alt=jsonc&max-results=9&v=2";
			// var name = $scope.playerName.toLowerCase().split(' ').join('_');
			

			$http.get(url).success(function(data) {
				var videoIDs = [];
				for (var i = 0; i < data["data"]["items"].length; i++) {
					videoIDs.push(data["data"]["items"][i]["id"]);
				};
				$scope.videoIDs = videoIDs;
				console.log($scope.videoIDs);
			});
		}
	}
})

nbaApp.directive('nbaPlayerHeadImage', function() {

	return {
		restrict: 'E', 
		// require: '^ngNBAPlayer',
		scope: {
			playerName: '@playerName'
		},
		template: '<img ng-src="{{headPictureURL}}" alt="profile picture for {{playerName}}" />',
		link: function($scope) {
			var url = "http://i.cdn.turner.com/nba/nba/.element/img/2.0/sect/statscube/players/large/";
			var name = $scope.playerName.toLowerCase().split(' ').join('_');
			$scope.headPictureURL = url + name + '.png';
		}
	};
});

nbaApp.directive('nbaPlayerNewsImage', function(){
	// Runs during compile
	
	return {
		restrict: 'E',
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: {}, // {} = isolate, true = child, false/undefined = no change
		scope: {
			playerName: '@playerName'
		},
		// controller: function($scope, $element, $attrs, $transclude) {},
		controller: function($scope, $http) {
			var name = $scope.playerName.toLowerCase().split(' ').join('+');
			// var url = "http://searchapp2.nba.com/nba-search/query.jsp?text=" + name + "&type=playerpage&start=1&npp=10&site=nba&hide=true&sort=relevance&output=json";
			var url = "http://searchapp2.nba.com/nba-search/query.jsp";
			$http.jsonp(url, {
				params: {
					"text": name, 
					"type": "playerpage",
					"start": 1,
					"npp": 20,
					"site": "nba",
					"hide": "true",
					"sort": "relevance",
					"output": "jsonp" }
				});

			// Yes, the NBA api doens't respond to callback function name settings...
			// can't complain since it's an internal API.
			// and Yes, Chrome will complain "Resource interpreted as Script but transferred with MIME type text/html",
			// NBA's backend guys need to do some work!
			window.nbaProcessSearchResults = function(data) {
				var results = data["results"][0];
				console.log(results);

				var cleanedresults = [];

				for (var i = 0; i < results.length; i++) {
					var uri = results[i]["metadata"]['media']["600x336"]["uri"];
					if (uri != "") {
						cleanedresults.push(uri);
					}
				};

				var length = cleanedresults.length;

				// making sure number of photos is multiples of five
				if (length >= 5) {
					if (length % 5 != 0) {
						cleanedresults.splice(length - 1 - length % 5, length % 5);
					}
				} else {
					cleanedresults = [];
				}

				console.log(cleanedresults);

				$scope.playerNewsImages = cleanedresults;
			}

		},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		// restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'templates/player-news-images.html',
		// templateUrl: '',
		// replace: true
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
	};
});

nbaApp.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/');

	$stateProvider
	.state('start', {
		url: "/",
		templateUrl: 'partials/start.html'
	})

	.state('playerDetailView', {
		url: "/players/:playerId",
		templateUrl: 'partials/player.detail.html',
		resolve: {
			playerDetails: function($http, $stateParams) {
				var playerId = $stateParams.playerId;
				return $http.get('../backend/players-api.php?action=get_player&id=' + playerId);
			}
		},
		controller: function($scope, $http, playerDetails) {
			$scope.playerDetails = playerDetails.data[0];
		}
	})
});

nbaApp.config(function ($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
  		'self',
  		'http://i.cdn.turner.com/nba/nba**',
  		'http://www.youtube.com/embed/**'
  	]
  	);
});

nbaApp.config(['ngProgressLiteProvider', function(ngProgressLiteProvider) {
	//ngProgressLiteProvider.settings.speed = 1500;
}]);

nbaApp.run(function($rootScope, $timeout, $window, $location, $anchorScroll, ngProgressLite) {
	$rootScope.$on('$stateChangeStart', function() {
		ngProgressLite.start();
		
	})

	$rootScope.$on('$stateChangeSuccess', function() {
		console.log("moving!");
		$location.hash('player-profile');
		$anchorScroll();
		ngProgressLite.done();
	})
});


// function playerDetailControl () {
// 	// pictures: http://searchapp2.nba.com/nba-search/query.jsp?text=tony+allen&type=playerpage&start=1&npp=10&site=nba&hide=true&sort=relevance&output=json
// 	// articles: http://searchapp2.nba.com/nba-search/query.jsp?text=%22tony+allen%22&type=article&start=1&npp=50&site=nba&hide=true&sort=relevance&output=json
// }


function searchControl ($scope, $http, $state, $location,  $anchorScroll) {
	

		// $http.get('../backend/players-api.php?action=get_players').success(function(data) {
			
		// 	$scope.playerNames = data["content"];
		// 	// console.log($scope.playerNames);
		// 	// console.log($scope.fuzzy_matched_players("lebron"));
		// });

	$http.get('../backend/players-api.php', {
		params: {"action": "get_players"}
	}).success(function(data) {
		$scope.playerNames = data["content"];
	});


	$scope.fuzzy_matched_players = function(name) {

		var options = {
			keys: ['firstName', 'lastName']
		}

		var f = new Fuse($scope.playerNames, options);
		var result = f.search(name);

		return result;
	};

	$scope.onSelect = function($item, $model, $label) {
		var params = {
			playerId: $item.id
		}

		$scope.selectedPlayer = "";
		$state.go('playerDetailView', params);
	};

	$scope.focusSearch = function() {
		console.log("focused");
		$scope.searchFocused = true;
		$scope.selectedPlayer = "";
	};

	$scope.leaveSearch = function() {
		console.log("defocused");
		$scope.searchFocused = false;
		$scope.selectedPlayer = "";
	};

}