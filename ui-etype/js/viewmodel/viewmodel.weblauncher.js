;define("viewmodel.weblauncher", 
	["jquery", "knockout", "service", "util", "viewmodel.base"], 
	function($, ko, service, util, BaseViewModel, undefined){
	
	// Class Definition
	var ViewModel = function(){
		var self = this;

		this.category = ko.observable(0);
		this.adult = ko.observable(0);
		this.comics = ko.observable(false);
		this.tv = ko.observable(false);

		// event method
		this.onTv = function(){
			setTimeout(function(){
				service("player")().showTV();
			},100);

			return true;
		};
		this.onClose = function(){
			service("weblauncher").close();
		};
	}
	,	cp
	;

	// Class extends
	ViewModel.prototype = new BaseViewModel();
	ViewModel.prototype.constructor = ViewModel;

	// Class Prototype
	cp = ViewModel.prototype;

	// properties

	// methods
	cp.init = function(opt){
		var mOpt = {
			section: "#weblauncher_header",
			actionPrevent: false
		};

		mOpt = $.extend(mOpt, opt);
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);

		this.applyActionPrevent( mOpt.actionPrevent );

		return this;
	};

	cp.showSection = function(section){
		var jqMovie = $(".section-movie")
		,	jqComic = $(".section-comic")
		,	jqTv	= $(".section-tv")
		;

		if (section === "comic"){
			jqMovie.hide();
			jqTv.hide();
			jqComic.show();
		}
		else if (section === "tv"){
			jqMovie.hide();
			jqTv.show();
			jqComic.hide();
		}
		else{
			jqMovie.show();
			jqTv.hide();
			jqComic.hide();
		}
	};

	// route callback methods

	cp.rc_mainmenu = function(context){
		var mParam = context.params;

		this.category(mParam.category);
		this.adult(mParam.adult);
		this.comics(false);
		this.tv(false);
		this.showSection("movie");
	};

	cp.rc_comicmenu = function(context){
		var mParam = context.params;

		this.category(-1);
		this.comics(true);
		this.tv(false);
		this.showSection("comic");
	};

	cp.rc_tvmenu = function(context){
		this.category(-1);
		this.comics(false);
		this.tv(true);
		this.showSection("tv");
	};

	return ViewModel;
});