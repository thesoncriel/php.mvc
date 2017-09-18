(function(angular, $, undefined){
	"use strict";

	var module = angular.module("schedule.directive", []);

	module.directive("verticalTimeline", function(){
		return {
			restrict: "A",
			scope: {
				min: "=?",
				max: "=?"
			},
			template: function(elem, attr){
				return '<div class="vertical-timeline">' +
					'<span class="vertical-timeline-item clearfix" ng-repeat="hour in hours" ng-style="{top: calcPos(hour) + \'%\'}">' +
						'<span class="vertical-timeline-num">{{hour}}</span>' +
						'<div class="vertical-timeline-graduate pull-right"></div>' +
					'</span>' +
					'</div>';
			},
			controller: ["$scope", function($scope){
				var i = 0,
					iLen = 0,
					arr = [];

				$scope.min = $scope.min || 0;
				$scope.max = $scope.max || 24;

				i = $scope.min - 1;

				while(++i <= 24){
					arr.push( i );
				}

				$scope.hours = arr;

				$scope.calcPos = function(hour){
					var max = $scope.max,
						min = $scope.min,
						hour = parseInt( hour ),
						diff = max - min
						;

					if (diff > 0){
						max = diff;
						hour -= min;
					}

					return (hour / max) * 100;
				};
			}],
			link: function(scope, element, attr){
				
			}
		};
	});

})(angular, jQuery);