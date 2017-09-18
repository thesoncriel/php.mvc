;define("viewmodel.comiclist", 
	["jquery", "knockout", "service", "util", "delay", "viewmodel", "viewmodel.movielist"], 
	function($, ko, service, util, delay, viewmodel, MovieListViewModel, undefined){

	// Class Definition
	var ViewModel = function(){
		var self = this;
		// Property
		this.scrollbar = null;
		this.loading = null;
		this.list = ko.observableArray([]);
		this.loaded = ko.observable(false);
		this.delayAPI = null;
		this.selectedItem = null;
		this.listUrl = "";
		this.detailViewModel = "";
		this.itemPrimaryKey = "";
		this.newConditionDate = util.addDate( new Date(), -15 );
		this.totalcount = 0;
		this.page = 0;
		this.custId = "";

		// Event Method
		this.onItemOver = function(item){
			item.hover(true);
		};
		this.onItemOut = function(item){
			item.hover(false);
		};
		this.onItemClick = function(item){
			self.activeItem(item, true);
		};

		this.onMoveNearBottom = function(api, event, scrollbar){
			var iPage = self.page
			,	iCount = 32// 서버의 NewkeyController 에도 정의 되어 있다. 만약 이 값의 수정이 필요하다면 서버쪽도 바꿔줄 것.
			,	vmComicMenu
			,	mParam
			;

			if ((iPage < 1) || (self.loading.shown())){
				return;
			}

			if ( (iPage * iCount) >= self.totalcount ){
				return;
			}

			vmComicMenu = viewmodel("comicmenu");

			if (!vmComicMenu){
				return;
			}

			iPage = ++self.page;
			mParam = {
				type: vmComicMenu.type(),
				genre: vmComicMenu.genre(),
				search: vmComicMenu.search(),
				page: iPage,
				count: iCount
			};

			self.load( mParam, true );
		};
	},
		cp
	;

	// Class extends
	ViewModel.prototype = new MovieListViewModel();
	ViewModel.prototype.constructor = ViewModel;

	// Class Prototype
	cp = ViewModel.prototype;

	// methods
	cp.init = function(opt){
		var mOpt = {
			section: "#comic_list",
			listUrl: "/exec/comic_list.php",
			detailViewModel: "comicdetail",
			itemPrimaryKey: "serial"
		};

		mOpt = $.extend(mOpt, opt);
		// super class init method call
		MovieListViewModel.prototype.init.call(this, mOpt);

		this.scrollbar.nearBottom( this.onMoveNearBottom );

		return this;
	};
	// @override
	cp.loadDetail = function(params){
		var vmMovieDetail = viewmodel( this.detailViewModel )
		,	vmComicMenu = viewmodel( "comicmenu" )
		,	sType = "comic"
		;

		if (vmComicMenu){
			sType = vmComicMenu.type();
		}

		if (vmMovieDetail && params){
			vmMovieDetail.load( {serial: params.serial, type: sType} );
		}
	};

	cp.isNew = function(regdate){
		// 비교 날짜 대비, 만화 출간 날짜가 크거나 같다면 OK
		return this.newConditionDate <= regdate;
	};

	cp.cut = function(text){
		return util.textOverflow( text, 8, ".." );
	};

	// route callback
	// @override
	cp.routecallback = function(ctx){
		this.page = 1;
		this.load( ctx.params );
	};

	return ViewModel;
});