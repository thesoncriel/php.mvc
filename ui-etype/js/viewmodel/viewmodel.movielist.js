;define("viewmodel.movielist", 
	["jquery", "knockout", "service", "util", "delay", "viewmodel", "viewmodel.base"], 
	function($, ko, service, util, delay, viewmodel, BaseViewModel, undefined){
	
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
		this.noPosterPath = "";
		this.listUrl = "";
		this.detailViewModel = "";
		this.totalcount = 0;
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
			section: "#movie_list",
			noPosterPath: "css/img/no_poster.jpg",
			listUrl: "/exec/movie_list.php",
			detailViewModel: "moviedetail"
		}
		;

		mOpt = $.extend(mOpt, opt);
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);

		this.altPropByAttr( "listUrl" );
		
		this.scrollbar = service("scrollbar")( this.section );
		this.scrollbar.apply();
		this.loading = service("loading")( this.section + " .loading" );

		return this;
	};

	cp.destroy = function(){
		if (this.scrollbar){
			this.scrollbar.destroy();
			this.scrollbar = undefined;
		}
		if (this.loading){
			this.loading.destroy( this.DOMSection );
		}

		// super class destroy method call
		BaseViewModel.prototype.destroy.call(this);
	};

	cp.stop = function(){
		if (this.delayAPI){
			this.delayAPI.stop();
		}
	};

	cp.activeItem = function(arg, active){
		var item
		,	index
		,	selectedItem = this.selectedItem
		;

		if ($.isNumeric(arg)){
			index = parseInt(arg);

			if (this.list && (this.list.length > 0) && index > -1){
				item = this.list()[index];
			}
		}
		else if (arg && ($.isFunction(arg.active))){
			item = arg;
		}
		else {
			return;
		}

		item.active(active);

		if (selectedItem !== item){
			if (active === true){
				this.loadDetail( item );
			}
			if (selectedItem){
				selectedItem.active(false);
			}
		}

		item.active(active);
		this.selectedItem = item;
	};

	cp.loadDetail = function(params){
		var vmMovieDetail = viewmodel( this.detailViewModel );

		if (vmMovieDetail && params){
			vmMovieDetail.load( {contentId: params.content_id} );
		}
	};

	cp.load = function(params, scrollbarRel){
		var self = this;

		self.stop();
		self.loading();
		self.loaded( false );

		if (self.custId){
			params.custId = self.custId;
		}

		service("backend")(self.listUrl, params, true)
		.done(function(res){
			var list
			;

			if (res){
				list = res.data || [];
				self.totalcount = parseInt(res.count || 0);
			}
			else{
				self.totalcount = 0;
			}

			util.addKoFieldsToList(list, {active: false, hover: false, poster: false});

			if (!scrollbarRel){
				self.list( [] );
			}

			self.delayAPI = delay( list, 16, 200 )
			( function(data, index, length, finish){
				var i = -1
				,	iLen = data.length
				;

				while(++i < iLen){
					this.list.push( data[i] );
					//list[i].poster( true );
				}
				//console.log(index, index % 32);
				if (//(index % 32 === 0) || 
					(index === 0) ||
					finish){
					this.scrollbar.refresh( scrollbarRel );
				}

				if (finish){
					this.loading(false);
				}
			}, self );

			if (list && (list.length > 0) && !scrollbarRel){
				self.activeItem( list[0], true );
			}
		})
		.fail(function(){
			alert("서버에서 목록을 가져올 수 없습니다.\n잠시 후에 다시 시도 하십시요.");
			self.list( [] );
		})
		.always(function(){
			self.loaded( true );
		});
	};

	// route callback methods
	cp.routecallback = function(ctx){
		this.load( ctx.params );
	};

	// event methods
	cp.onapply = function(item){

	};

	return ViewModel;
});