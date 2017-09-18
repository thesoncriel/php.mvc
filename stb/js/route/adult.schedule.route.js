var approute = (function(angular, undefined){
	"use strict";

	return function(rootPath){
		var sViewRoot = rootPath || "/";

		return [
			{
				name: "index",
				url: "/",
				redirectTo: "adult.schedule"
			},
			{
				name: "adult",
				abstract: true,
				url: "/adult",
				templateUrl: sViewRoot + "adult/schedule.html"
			},
			{
				name: "adult.schedule",
				parent: "adult",
				url: "/schedule/:channel",
				views: {
					"schedule": {
						templateUrl: sViewRoot + "adult/schedule.edit.html"
					},
					"content": {
						templateUrl: sViewRoot + "adult/content.list.html"	
					}
				}
			},
			{
				name: "adv",
				url: "/adv",
				templateUrl: sViewRoot + "adv/adv.list.html"
			}
		];
	};
})(angular);