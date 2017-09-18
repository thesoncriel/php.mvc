define("service.scrollbar.desktop", 
	["jquery", "knockout"], 
	function($, ko, undefined){
	/*
	윈도우용 웹런처에서 쓰이는 스크롤바
	*/

	var mTarget = {}, fn;

	fn = function(selector){
		var opt = {
			direction: "vertical",
			bounce: 10
			}
		,	fnMoveEvent
		,	api
		;

		fnMoveEvent = function(event){
			var scrollbar
			,	contentPosition
			,	nearBottomPosition
			;

			if (api.delaying === true){
				return;
			}



			scrollbar = api.getScrollbar();
			contentPosition = scrollbar.contentPosition;
			nearBottomPosition = scrollbar.contentSize - scrollbar.trackSize - 50;

			if (contentPosition >= nearBottomPosition){
				api.delaying = true;

				setTimeout(function(){
					api.delaying = false;
				}, 1000);

				api.callback( api, event, scrollbar );
			}
		};

		api = {
			selector: selector,
			callback: $.noop,
			delaying: false,
			apply: function(){
				var jqListMovies
				,	mTgt = mTarget
				,	scrollbar
				;

				if (mTgt.hasOwnProperty(this.selector) === false){
					jqListMovies = $(this.selector);
					mTgt[ selector ] = jqListMovies;
				}
				else{
					jqListMovies = mTgt[ selector ];
				}

				jqListMovies.tinyscrollbar();
			},

			refresh: function(relative){
				var sRel = (relative)? "relative" : ""
				;

				this.getScrollbar().update( sRel );
			},

			destroy: function(){
				var jqObj, sRel
				;

				jqObj = mTarget[ this.selector ];

				if (!jqObj){
					return;
				}

				jqObj.unbind("move");
				this.callback = undefined;

				delete mTarget[ selector ];
			},

			getJq: function(){
				var jq = mTarget[ this.selector ]
				;

				if (jq){
					return jq;
				}

				throw "cannot found scrollbar jquery object : " + this.selector;
			},

			getScrollbar: function(){
				var jqListMovies = this.getJq()
				,	scrollbar = jqListMovies.data("plugin_tinyscrollbar")
				;

				if (scrollbar){
					return scrollbar;
				}

				throw "cannot found scrollbar data : " + this.selector;
			},

			nearBottom: function(callback){
				if (callback !== undefined && (typeof callback === "function")){
					this.callback = callback;
					this.getJq()
					.unbind("move", fnMoveEvent)
					.bind("move", fnMoveEvent);
				}
			}
		};// api [end]

		return api;
	};

	fn.destroyAll = function(){
		var key,
			mJq = mTarget
		;

		for (key in mJq){
			mJq[ key ].destroy();

			delete mJq[ key ];
		}

		mJq = undefined;
		mTarget = undefined;
	};

	return fn;
});