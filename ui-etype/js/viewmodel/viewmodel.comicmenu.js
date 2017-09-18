;define("viewmodel.comicmenu", 
	["jquery", "knockout", "service", "util", "viewmodel", "viewmodel.base"], 
	function($, ko, service, util, viewmodel, BaseViewModel, undefined){
	
	// Class Definition
	var ViewModel = function(){
		var self = this;

		this.type = ko.observable("comic");
		this.genre = ko.observable(0);
		this.search = ko.observable("");

		// event method
		this.onSearchClick = function(){
			var jqBtn
			;

			try{
				jqBtn = self.jqSection.find("form").submit();
				//jqBtn.
			}
			catch(e){}

			
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
			section: "#comic_menu"
		};

		mOpt = $.extend(mOpt, opt);
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);

		return this;
	};

	// route callback methods

	cp.routecallback = function(context){
		var mParam = context.params;

		//console.log(mParam);

		this.type( mParam.type );
		this.genre( mParam.genre );
		this.search( "" );
	};

	return ViewModel;
});