;define("viewmodel.plugincheck", 
	["jquery", "knockout", "viewmodel.base", "service", "envcheck"], 
	function($, ko, BaseViewModel, service, env){

	var ViewModel = function(){
		this.ie = ko.observable(env.ie());
		this.ieVer = ko.observable(env.ieVer());
		this.html5 = ko.observable(env.html5());
		this.flash = ko.observable(env.flash());
		this.flashVer = ko.observable(env.flashVer());
		this.webcubeOld = ko.observable(env.webcubeOld());
	}
	, cp = ViewModel.prototype = new BaseViewModel()
	;

	cp.constructor = ViewModel;
	cp.init = function(opt){
		var mOpt = {
			section: "#panel_pluginCheck",
			redirect: "/comicviewer/"
		}
		, bPass = true;
		;
		mOpt = $.extend(mOpt, opt);
		BaseViewModel.prototype.init.call(this, mOpt);

		if (!this.ie()){
			this.showNotice(".not-ie");
			bPass = false;
		}
		else if (!this.html5() && !this.flash()){
			this.showNotice(".low-ver-flash");
			bPass = false;
		}
		else if (!this.webcubeOld() && !env.os64() && (this.ieVer() < 9)){
			this.showNotice(".not-webcube");
			bPass = false;
		}

		if (bPass){
			this.redirectTo(mOpt.redirect);
			$(".loading").show();
		}

		return this;
	};
	cp.showNotice = function(selector){
		$(selector).show();
	};
	cp.redirectTo = function(url){
		setTimeout(function(){
			service("webcube").apply(url);
		}, 200);
		
	};

	return ViewModel;
});