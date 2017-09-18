;define("route", 
	["jquery", "knockout", "sammy", "service", "viewmodel", "util", "config"], 
	function($, ko, Sammy, service, viewmodel, util, config, undefined){
	
	// 뉴키 코믹 뷰어 라우트
	var aRouteComicViewer = [
		{
			url: "#/"
		}
		,{
			verb: "post",
			url: "#/goto",
			controller: "comicviewer"
		}
	]

	// 웹런쳐 라우트 (기본)
	,	aRouteWebLauncher = [
		{
			url: "#/",
			redirectTo: "#/movie/1/0"
		}
		,{
			url: "#/movie/:category/:adult",
			controller: [
				"movielist", 
				{
					viewModel: "weblauncher",
					method: "rc_mainmenu"
				}
			]
		}
		,{
			verb: "post",
			url: "#/adultVerify",
			controller: "adultverify"
		}
		,{
			url: "#/newkey/:type/:genre",
			controller: [
				{
					viewModel: "weblauncher",
					method: "rc_comicmenu"
				},
				"comicmenu",
				"comiclist"
			]
		}
		,{
			verb: "post",
			url: "#/newkey/search",
			controller: "comiclist"
		}
		,{
			url: "#/tv",
			controller: {
				viewModel: "weblauncher",
				method: "rc_tvmenu"
			}
		}
		,{
			verb: "post",
			url: "#/couponUse",
			controller: "coupon"
		}
	]

	// 라우트 설정 [끝]
	;

	return function(){
		if (config.comicInfo){
			return aRouteComicViewer;
		}

		return aRouteWebLauncher;
	};
});