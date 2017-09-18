;define("viewmodel.moviedetail", 
	["jquery", "knockout", "service", "util", "viewmodel.base"], 
	function($, ko, service, util, BaseViewModel, undefined){
	
	// Class Definition
	var ViewModel = function(){
		var self = this;
		// properties
		//this.scrollbar = null;
		this.loading = util.noop;
		this.detail = ko.observable();
		this.detailUrl = "";
		this.custId = "";

		// event methods
		this.onPosterError = util.setAltImgEvent( "css/img/no_poster.jpg" );

		this.play = function(item){
			if (item.grade >= 18){
				service("adult-verify")()
				.done(function(){
					service("player")(item).play();
				});
			}
			else{
				service("player")(item).play();
			}
		};
	},
		cp
	;

	// Class extends
	ViewModel.prototype = new BaseViewModel();
	ViewModel.prototype.constructor = ViewModel;

	// Class Prototype
	cp = ViewModel.prototype;

	

	// methods
	cp.init = function(opt){
		var mOpt = {
			section: "#movie_detail",
			detailUrl: "/exec/movie_detail.php"
		};

		mOpt = $.extend(mOpt, opt);
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);

		this.altPropByAttr( "detailUrl" );
		
		//this.scrollbar = service("scrollbar")( this.section );
		//this.scrollbar.apply();
		this.loading = service("loading")( this.section + " .loading" );

		return this;
	};

	cp.load = function(params){
		var self = this
		,	mParam = params
		;

		self.loading();

		if (self.custId){
			params.custId = self.custId;
		}

		service("backend")(self.detailUrl, mParam, true)
		.done(function(res){
			self.detail(res.data);
			self.onRefresh();
		})
		.fail(function(){

		})
		.always(function(){
			self.loading(false);
		});
	};

	cp.timeFmt = util.timeFormat;
	cp.onRefresh = util.noop;
	cp.textOverflow = util.textOverflow;

	// route callback methods

	// event methods
	cp.onapply = function(){

	};

	return ViewModel;
});