;define("viewmodel.comicdetail", 
	["jquery", "knockout", "service", "util", "viewmodel", "viewmodel.moviedetail"], 
	function($, ko, service, util, viewmodel, MovieDetailViewModel, undefined){
	
	// Class Definition
	var ViewModel = function(){
		var self = this;
		// properties
		this.scrollbar = null;
		this.loading = util.noop;
		this.detail = ko.observable();
		this.detailUrl = "";
		this.newConditionDate = util.addDate( new Date(), -15 );
		this.custId = "";
		//this.books = ko.observableArray([]);

		// event methods
		this.play = function(item){
			var mDetail = self.detail()
			,	vmComicMenu = viewmodel("comicmenu")
			,	bookItem = {
				serial: mDetail.serial,
				book_serial: item.book_serial,
				bookno: item.bookno,
				type: "comic",
				grade: parseInt( mDetail.grade )
			};

			if (vmComicMenu){
				bookItem.type = vmComicMenu.type();
			}

			if (bookItem.grade > 0){
				service("adult-verify")()
				.done(function(){
					//alert("만화 오픈");
					service("comicviewer")(bookItem).show();
				});
			}
			else{
				//alert("만화 오픈");
				service("comicviewer")(bookItem).show();
			}
		};
	},
		cp
	;

	// Class extends
	ViewModel.prototype = new MovieDetailViewModel();
	ViewModel.prototype.constructor = ViewModel;

	// Class Prototype
	cp = ViewModel.prototype;

	// methods
	cp.init = function(opt){
		var mOpt = {
			section: "#comic_detail",
			detailUrl: "/exec/comic_detail.php"
		};
		mOpt = $.extend(mOpt, opt);
		// super class init method call
		MovieDetailViewModel.prototype.init.call(this, mOpt);

		this.scrollbar = service("scrollbar")( this.section );
		this.scrollbar.apply();

		return this;
	};

	cp.onRefresh = function(){
		this.scrollbar.refresh();
	};

	cp.isNew = function(regdate){
		// 비교 날짜 대비, 만화 출간 날짜가 크거나 같다면 OK
		return this.newConditionDate <= regdate;
	};

	return ViewModel;
});