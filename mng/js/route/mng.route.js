var approute = (function(angular, undefined){
	"use strict";

	return function(rootPath){
		var sViewRoot = rootPath || "/";

		return [
			// 공통
			{
				name: "logout",
				url: "/logout",
				controller: "Logout",
				template: '<div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 100%"></div></div>'
			}
			,{
				name: "index",
				url: "/",
				redirectTo: "ptv.custlist"
			}

			// Play TV
			,{
				name: "ptv",
				abstract: true,
				url: "/ptv",
				template: "<div ui-view></div>"
			}
			,{
				name: "ptv.custlist",
				parent: "ptv",
				url: "/custlist",
				templateUrl: sViewRoot + "ptv/cust.list.html"
			}
			,{
				name: "ptv.clientlist",
				parent: "ptv",
				url: "/clientlist",
				templateUrl: sViewRoot + "ptv/client.list.html"
			}
			,{
				name: "ptv.clientopt",
				parent: "ptv",
				url: "/clientopt",
				templateUrl: sViewRoot + "ptv/client.opt.html"
			}
			,{
				name: "ptv.billlog",
				parent: "ptv",
				url: "/billlog",
				templateUrl: sViewRoot + "ptv/billlog.html"
			}
			,{
				name: "ptv.content",
				parent: "ptv",
				url: "/content",
				templateUrl: sViewRoot + "ptv/content.list.html"
			}

			// Wow Cine
			,{
				name: "wow",
				abstract: true,
				url: "/wow",
				template: "<div ui-view></div>"
			}
			,{
				name: "wow.custlist",
				parent: "wow",
				url: "/custlist",
				templateUrl: sViewRoot + "wow/cust.list.html"
			}
			,{
				name: "wow.clientopt",
				parent: "wow",
				url: "/clientopt",
				templateUrl: sViewRoot + "wow/client.opt.html"
			}
			,{
				name: "wow.billlog",
				parent: "wow",
				url: "/billlog",
				templateUrl: sViewRoot + "wow/billlog.html"
			}
			,{
				name: "wow.content",
				parent: "wow",
				url: "/content",
				templateUrl: sViewRoot + "wow/content.list.html"
			}
			
			// 공통 서버 캐시
			,{
				name: "cache",
				url: "/cache",
				templateUrl: sViewRoot + "cache.html"
			}
			// 서버별 DB 날짜 확인
			,{
				name: "dbdate",
				url: "/dbdate",
				templateUrl: sViewRoot + "dbdate.html"
			}
		];
	};
})(angular);