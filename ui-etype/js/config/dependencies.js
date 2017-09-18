;"use strict";

requirejs.config({
	deps: [
		"config",
		
		"jquery",
		"sammy",
		"knockout",
		"util",
		"route",
		"promise",

		"service.error.msg",
		"service.route",
		"service.backend",
		"service.loading",
		"service.scrollbar.desktop",
		"service.player.desktop",
		"service.comicviewer.activex",
		"service.modal",
		"service.placeholder",

		"service.adult-verify",
		"service.purchase",
		"service.weblauncher.desktop",
		//"service.scrollbar",
		
		
		"viewmodel.base",
		"viewmodel.adultverify",
		"viewmodel.purchase",
		"viewmodel.coupon",
		"viewmodel.weblauncher",
		"viewmodel.movielist",
		"viewmodel.moviedetail",
		"viewmodel.comicmenu",
		"viewmodel.comiclist",
		"viewmodel.comicdetail",

		// newkey comic viewer
		"swfobject",
		"component.base",
		"component.image",
		"component.image.flash",
		"component.image.html5",
		"component.imagepage",
		"factory.component.image",

		"service.comicviewer",
		"service.webcube",
		
		"viewmodel.comicviewer",
		"viewmodel.plugincheck"
	],
	map: {
		"*": {
			"service.scrollbar": "service.scrollbar.desktop",
			"service.player": "service.player.desktop",
			"service.weblauncher": "service.weblauncher.desktop"
			//"service.comicviewer": "service.comicviewer.activex"
		}
	}
});

