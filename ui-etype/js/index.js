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


;define("service", ["jquery", "knockout"], function($, ko){
	var m = {}
	;

	return function(name){
		var fullName,
			Service
		;

		if (m.hasOwnProperty(name) === false){
			fullName = "service." + name;
			Service = require(fullName);
			m[ name ] = Service;

			return Service;
		}

		return m[ name ];
	};
});

define("viewmodel", ["jquery", "knockout"], function($, ko){
	var m = {}, fn;

	fn = function(name){
		var fullName,
			ViewModel,
			vm
		;

		if (m.hasOwnProperty(name) === false){
			fullName = "viewmodel." + name;
			ViewModel = require(fullName);
			vm = new ViewModel();

			m[ name ] = vm;

			return vm;
		}

		return m[ name ];
	};

	fn.apply = function(){
		var mVm = m, name;

		for (name in mVm){
			mVm[ name ].apply();
		}
	};

	fn.destroy = function(){
		var mVm = m, name;

		for (name in mVm){
			mVm[ name ].destroy();
		}
	};

	// $( window ).unload( function() {
 //        fn.destroy();
 //    });

	return fn;
});
define("config", function(){
	var win = window
	, mComic = win.__comic__
	, _fsp = ""
	, _cai = ""
	, _cei = ""
	, _newkeyContentsDomain = ""
	;

	if (mComic){
		_fsp = mComic.fsp;
		_cai = mComic.cai;
		_cei = mComic.cei;
		_newkeyContentsDomain = mComic.cd;
	}

	return {
		// 플래시 파일 경로
		flashShimPath: _fsp || "./js/",
		// 코믹뷰어 대체 이미지 경로
		comicAltImg: _cai || "./css/img/page_alt.png",
		// 코믹뷰어 빈 이미지 경로
		comicEmptyImg: _cei || "./css/img/page_empty.png",
		// 코믹뷰어 컨텐츠 도메인
		comicContentsDomain: _newkeyContentsDomain || "http://contents1.newkey.co.kr",
		// 가맹점 정보 (웹런처 전용)
		custInfo: win.__info__,
		// 만화 정보 (코믹뷰어 전용)
		comicInfo: mComic,
		// 코믹뷰어 플러그인 체크
		pluginCheck: !!win.__pluginCheck__,
		// IE8 이하에서 Ajax 크로스 도메인 문제로 인한 대체 호출 경로
		crossDomainAlt: "/exec/http_call.php",
		// allat 관련 정보
		purchaseTrigger: "/exec/view/purchase_trigger.php",
		// 결제창 하단 배너
		purchaseBottomBanner: "/Coupon/Image/ban_01.png",
		// 쿠폰창 상단 배너
		couponTopBanner: "/Coupon/Image/img_01.png"
	};
});
;define("service.adult-verify", 
	["jquery", "util", "config", "viewmodel", "service.modal"],
	function($, util, config, viewmodel, modal, undefined){
		var modalAPI
		,	fnOnModalResult
		,	fnDestroy
		,	fnUnbind
		,	vmAdultVerify
		,	mInfo = config.custInfo
		,	isNeed = (mInfo && parseInt(mInfo.adult_verify))? true : false
		,	isAdult = !isNeed
		,	cookieKey = "adult-verify-isAdult"
		,	iExpireHour = 6
		,	_resolve
		,	_reject
		,	fnExecResolve
		,	fnExecReject
		;

		fnOnModalResult = function(result, event){
			var vm = vmAdultVerify;

			if (result === "cancel"){
				//promise.anyway(result, event);
				fnUnbind();

				return;
			}
		};

		fnUnbind = function(){
			modalAPI.unbindAll();
			//promise.unbind();
		};

		fnDestroy = function(){
			if (modalAPI){
				fnUnbind();
				modalAPI.destroy();
				modalAPI = undefined;
			}
		};

		fnExecResolve = function(){
			if ($.isFunction(_resolve)){
				_resolve.apply(vmAdultVerify, arguments);
			}
		}

		fnExecReject = function(){
			if ($.isFunction(_reject)){
				_reject.apply(vmAdultVerify, arguments);
			}
		}

		return function(opt){
			if (opt === "destroy"){
				fnDestroy();

				return;
			}

			if (isNeed){
				isAdult = util.cookie.get( cookieKey ) === "yes";
			}

			if (isAdult === true){
				//promise.resolve("exists", "");
				//promise.immediate("done")();

				//return promise;
				return util.promise(function(resolve){
					resolve("exists");
				});
			}

			if (!modalAPI){
				if (!opt || !opt.viewModel){
					vmAdultVerify = viewmodel("adultverify").init();
				}
				else{
					vmAdultVerify = viewmodel(opt.viewModel).init();;
				}
				modalAPI = modal( util.mapValDef( opt, "modal", "#modal_adultVerify" ) );
			}

			vmAdultVerify.promise()
			.done(function(result, msg){
				if (result === "new"){
					alert("인증 성공!");
				}
				else if (result === "exists"){
					alert("인증 성공.");
				}
				else{
					alert("인증 성공 : " + result);
				}

				util.cookie.set( cookieKey, "yes", iExpireHour );
				isAdult = true;
				modalAPI.hide();
				fnExecResolve(result, msg);
				
			})
			.fail(function(result, msg){
				alert( msg );

				if (result === "tooYoung"){
					modalAPI.hide();
				}
				fnExecReject(result, msg);
			});

			modalAPI.bind("result", fnOnModalResult)
			.clear()
			.show();

			return util.promise(function(resolve, reject){
				_resolve = resolve;
				_reject = reject;
			});
		};
	});
;define("service.backend", ["jquery", "util", "config", "service.cache"],
	function($, util, config, cache, undefined){
		var mCache = {}
		,	fnGetCacheKey
		,	fnGetOwnProperty
		,	fnPost
		,	fnGet
		,	fnCommon
		,	mVerb = {get: 0, post: 0, xml: 0, text: 0}
		;

		if (util.isIE() < 10 && $.support){
			$.support.cors = true;
		}

		fnGetCacheKey = function(url, params){
			var key, aRet = []
			;

			for(key in params){
				aRet.push( params[key] );
			}

			return aRet.join("_");
		};

		/*
		파라메터 객체가 순수한 값 전용 객체 (PlainObject)가 아닐경우
		그 것이 본래 가진 값 (Own Property)을 따로 추출하여 전달 한다.
		이렇게 안하고 jQuery의 Ajax를 쓰면 뒷쪽 URL 파라메터 값이 쓸데 없는 값들을 포함되어
		무쟈게 길어진다...
		*/
		fnGetOwnProperty = function(params){
			var key
			,	mParam
			;

			if ($.isPlainObject(params)){
				return params;
			}

			mParam = {};

			for(key in params){
				if (params.hasOwnProperty( key )){
					mParam[key] = params[key];
				}
			}

			return mParam;
		};

		fnCommon = function(verb, url, params, cacheUse, cacheTime){
			var error, u = util, mRet
			,	jqPromise, key
			,	mParam
			,	cacheKey
			,	cacheData
			,	promise
			,	type = "json"
			,	mConfig
			;

			if (verb === "text" || verb === "xml"){
				type = verb;
				verb = "get";
			}

			mParam = fnGetOwnProperty( params );

			if (cacheUse === true){
				cacheKey = fnGetCacheKey( url, mParam );
				cacheData = cache.get( cacheKey );

				if (cacheData !== undefined){
					promise = util.promise();
					promise.resolve(cacheData);
					//promise.immediate("done")(cacheData);

					return promise;
				}
			}

			//util.debug.log(url);

			try{
				// IE8 이하에서 Ajax 쓸 땐 Cross Domain 끼리 자료 교환이 불가능하다.
				// 그래서 설정된 도메인 내 다른 URI로 대신 호출해서 자료를 가져 온다.
				if (util.IEVersion <= 9){
					if (!util.sameDomain(url)){
						mParam = {
							url: url + "?" + util.objectToParameter(mParam)
						};
						url = config.crossDomainAlt;
						
						verb = "POST";
					}
				}
				mConfig = {
					type: verb.toUpperCase(),
					url: url,
					crossDomain: true,
					dataType: type,
					success: util.noop,
					data: mParam
				};

				if (cacheUse === true){
					mConfig.success = function(data, textStatus, jqXHR){
						cache.put( cacheKey, data, cacheTime );
					};
				}

				jqPromise = $.ajax(mConfig);

				// if (cacheUse === true){
				// 	jqPromise = $[verb](url, mParam, function(data, textStatus, jqXHR){
				// 		cache.put( cacheKey, data, cacheTime );
				// 	}, type);
				// }
				// else{
				// 	jqPromise = $[verb](url, mParam, util.noop, type);
				// }

				return jqPromise;
			}
			catch(e){
				error = e;
				promise = util.promise();
				promise.reject(error);
				//promise.immediate("fail")(error);

				return promise;
			}
		};

		return function(url, params, cacheUse, cacheTime){
			if (mVerb.hasOwnProperty(url)){
				return fnCommon.apply(this, arguments);
			}
			else{
				return fnCommon.call(this, "get", url, params, cacheUse, cacheTime );
			}
		};
	});
;define("service.cache", [], function(undefined){
	var mCache = {}
	,	mTimeLimit = {}
	,	aKey = []
	,	max = 100
	,	fnCache
	;

	return {
		get: function(key){
			if (this.isTimeout(key)){
				this.remove( key );

				return undefined;
			}

			return mCache[ key ];
		},
		put: function(key, val, time){
			var iTime = (time)? parseInt(time) : 0
			,	date
			,	iTimeNow
			,	sOldKey
			,	iCount = aKey.length
			;

			iCount++;

			if (iCount > max){
				sOldKey = aKey.pop();
				this.remove( sOldKey );
			}

			mCache[ key ] = val;
			aKey.push( key );

			if (iTime > 0){
				date = new Date();
				iTimeNow = date.getTime();
				mTimeLimit[ key ] = iTimeNow + (iTime * 1000);
			}
			else{
				mTimeLimit[ key ] = 0;
			}
		},
		remove: function(key){
			delete mCache[ key ];
			delete mTimeLimit[ key ];
		},
		isTimeout: function(key){
			var date
			,	iTimeNow
			,	iTimeLimit = mTimeLimit[ key ]
			,	iTimeRec
			;

			if (iTimeLimit === 0){
				return false
			}

			date = new Date();
			iTimeNow = date.getTime();

			return iTimeNow >= iTimeLimit;
		}
	};
});
;define("service.comicviewer.activex", ["jquery", "util", "service"], 
	function($, util, weblauncher, undefined){
		

		function serializeRequestUrl(serial, bookSerial, type){
			var c_id = serial
			,	b_id = bookSerial
			,	cat = type
			;

			return "http://b2b.newkey.co.kr/viewer/weblauncher_trigger.php?c_id=" + c_id + "&b_id=" + b_id + "&cat=" + cat;
		}

		return function(info){
			var serial 	= util.mapValDef(info, "serial")
			,	bookSerial = util.mapValDef(info, "book_serial")
			,	type = util.mapValDef(info, "type")
			,	url = serializeRequestUrl( serial, bookSerial, type )
			;

			return {
				show: function(){
					var bRet = false
					,	msg = ""
					;

					if (serial && bookSerial && type){
						try{
							$(".comicviewer-trigger")[0].src = url;
							bRet = true;
						}
						catch(e){
							msg = "뷰어 트리거가 존재하지 않습니다.";
						}
					}
					else{
						msg = "뷰어 수행에 필요한 값이 부족합니다.\n" + serial + "_" + bookSerial + "_" + type;
					}

					if (msg !== ""){
						alert( msg );
					}

					return bRet;
				}
			};
		};
	});
;define("service.comicviewer", ["jquery", "util", "service", "config"], 
	function($, util, service, config, undefined){
		var mCustInfo = config.custInfo
		;

		function serializeRequestUrl(serial, bookno, type, idCust){
			return "comicviewer.php?serial="+serial+"&type="+type+"&bookno="+bookno+"&idcust="+idCust;
		}

		if (mCustInfo && !mCustInfo.new_comicviewer){
			return service("comicviewer.activex");
		}

		return function(info){
			var fnMapValDef = util.mapValDef
			,	serial 	= fnMapValDef(info, "serial")
			//,	bookSerial = fnMapValDef(info, "book_serial")
			,	bookno = fnMapValDef(info, "bookno")
			,	type = fnMapValDef(info, "type")
			,	idCust = fnMapValDef(config.custInfo, "id_cust")
			,	url = serializeRequestUrl( serial, bookno, type, idCust )
			;

			return {
				show: function(){
					var bRet = false
					,	msg = ""
					,	win
					;

					if (serial && bookno && type && idCust){
						win = window.open(url, "comic_viewer","width=1124,height=768,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,left=0,top=0");
						// 창을 앞으로 오게 하기
						win.focus();
						bRet = true;
					}
					else{
						msg = "뷰어 수행에 필요한 값이 부족합니다.\n" + serial + "_" + bookno + "_" + type + "_" + idCust;
					}

					if (msg !== ""){
						alert( msg );
					}

					return bRet;
				}
			}
		};
	});
;define("delay", function(){
	var mSerialCache = {}
	,	delayWork
	,	api
	;

	/*
	@desc
	특정 Array 데이터에 대하여 끊어서 callback을 수행한다.
	@params
	list = 딜레이를 적용하며 수행될 Array.
	max = 한번에 수행되는 개수
	delay = 수행 간격 시간 (ms)
	callback = 수행 함수. 내부에서 return 값을 false 로 주면 중지 한다.
	thisObj = callback 내부에서 this로 접근 할 객체

	※ 아래는 직접 쓰는 일 없음
	index = (Option) 시작되는 위치
	length = (Option) 자료 길이
	*/
	delayWork = function(list, max, delay, callback, thisObj, index, length, workSerial){
		var iLen
		,	i
		,	iFullLen
		,	isLast = false
		,	bCallbackRet
		,	isFirst = false
		,	serial = 0
		,	date
		;

		// 새로 할 때
		if (index === undefined){
			if (Object.prototype.toString.call(list).slice(8, -1) !== "Array"){
				return false;
			}

			iFullLen = list.length;

			// 데이터 길이가 수행 개수랑 같다면
			// 한번만 수행하고 종료.
			if (iFullLen <= max){
				isLast = true;
			}

			iLen = max;
			index = 0;
			isFirst = true;
		}
		// 계속 이어서 할 때
		else if (index > 0){
			if (index >= length){
				return true;
			}

			// 마지막..
			if ((index + max) >= length){
				isLast = true;
				iLen = length - index;
			}
			// 계속...
			else{
				iLen = max;
			}

			iFullLen = length;

			//callback.call(thisObj, list.slice(index, iLen), index, length);
		}
		// -_-???
		else{
			return false;
		}

		bCallbackRet = callback.call(thisObj, list.slice(index, index + iLen), index, iFullLen, isLast);

		if (bCallbackRet === false){
			return true;
		}

		if (isLast){
			return true;
		}

		if (isFirst){
			date = new Date();
			workSerial = date.getTime();
		}

		serial = setTimeout(function(){
			delayWork( list, max, delay, callback, thisObj, index+=max, iFullLen, workSerial );
		}, delay);

		mSerialCache[ workSerial ] = serial;

		return workSerial;
	};

	

	return function(list, max, delay){
		return function(callback, thisObj){
			var serial = delayWork(list, max, delay, callback, thisObj)
			,	api = {
				id: 0,
				stop: function(serial){
					if (serial === undefined){
						serial = this.id;
					}

					clearTimeout( mSerialCache[ serial ] );
				},
				stopAll: function(){
					var m = mSerialCache
					,	key
					;

					for(key in m){
						clearTimeout( m[ key ] );
					}
				},
				pause: function(time){

				}
			};// api [end]

			api.id = serial;

			return api;
		};// return [end]
	};
});
;define("envcheck", ["util"], function(util){
	var bActX = !!window.ActiveXObject
	, fnFlashVer = function(){
		try{
			 try {
		      // avoid fp6 minor version lookup issues
		      // see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
		      var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
		      try { axo.AllowScriptAccess = 'always'; }
		      catch(e) { return 6; }
		    } catch(e) {}
		    return parseInt(
		    	new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1].split(",")[0]
		    	);
		}
		catch(e){
			return -1;
		}
	}
	, fnWebcubeOld = function(){
		try{
			var act = new window.ActiveXObject("WebCube.WebCubeCtrl.1");

			return !!act;
		}
		catch(e){
			return false;
		}
	}
	, sUserAgent = navigator.userAgent.toLowerCase()
	, iFlashVer = fnFlashVer()
	, bWebcubeOld = fnWebcubeOld()
	, bWeb64 = (sUserAgent.indexOf("x64") >= 0) || (sUserAgent.indexOf("wow64") >= 0)
	, bOS64 = (sUserAgent.indexOf("win64") >= 0)
	;

	return {
		// 액티브X 가능 여부
		activex: function(){
			return bActX;
		},
		// inplusx: function(){
		// 	try{
		// 		var act = new window.ActiveXObject("INPLUSX.InplusXCtrl.1");

		// 		return !!act;
		// 	}
		// 	catch(e){
		// 		return false;
		// 	}
		// },
		// 플래시버전
		flashVer: function(){
			return iFlashVer;
		},
		// 플래시 가능 여부
		flash: function(){
			return iFlashVer >= 10;
		},
		// html5 지원 여부
		html5: function(){
			return !!window.Blob;
		},
		// 웹큐브 액티브X 버전 설치 여부
		webcubeOld: function(){
			return bWebcubeOld;
		},
		// IE 여부
		ie: function(){
			return util.isIE();
		},
		// IE 버전
		ieVer: function(){
			return util.IEVersion;
		},
		// OS 64비트 여부
		os64: function(){
			return bOS64;
		},
		// 웹브라우저 64비트 여부
		web64: function(){
			return bWeb64;
		}
	};
});
;define("service.error.msg", function(){
	return {
	//@@@ 이미지 컴포넌트측 오류
        0: "이미지 컴포넌트 초기화에 실패 했습니다.",
        /**
		환경: IE9 이하의 플래시 기반 이미지 컴포넌트
		컴포넌트는 구동 되었으나 URL 로더로 웹파일 스트리밍 수행 시 보안 오류가 발생 된 것이다.
		관련 내용: Flex - Loader - SecurityErrorEvent.SECURITY_ERROR
		*/

        1: "이미지 호출에 실패 하였습니다.",
        /**
        환경: 모든 이미지 컴포넌트
        가져오려는 이미지 URL이 잘못 되었거나
        서버의 문제로 이미지 스트림을 받는데 실패 함.
        */

        2: "이미지 읽기에 실패 하였습니다.",
        /**
		환경: IE9 이하의 플래시 기반 이미지 컴포넌트
		이미지 스트림은 가져 왔으나 그 내용이 비정상적이어서 읽어들일 수 없음.
        */

        3: "이미지 컴포넌트 이벤트 수행에 실패 했습니다.",
        /**
        환경: IE9 이하의 플래시 기반 이미지 컴포넌트
        플래시에서 웹브라우저의 global function 을 수행하는데 까진 성공 했으나
        js 상에서 컴포넌트의 onReady 이벤트 수행에 실패 한 것.
        */

        4: "이미지 후처리 작업에 실패 했습니다.",
        /**
		환경: IE9 이하의 플래시 기반 이미지 컴포넌트
		플래시에서 이미지 로드까지 모두 성공 했으나 global function 이벤트 수행에 실패
		(component.image.flash 내의 sGlobalEventComplete 참조)
		이미지 정보를 통한 비율(ratio) 계산 및 이벤트를 수행 하는데
		그 둘 중 하나를 처리 중 오류가 발생된 것.
        */

	//@@@ 이미지 페이지측 오류
        204: "최대 페이지 값 설정이 잘못 되었습니다.",
        205: "페이지 설정 값이 잘못 되었습니다.\n페이지는 1보다 작을 수 없습니다.",
        206: "페이지 설정 값이 잘못 되었습니다.\n페이지는 최대 페이지 보다 클 수 없습니다.",        
        
		//20: "페이지 넘기기 방향값이 잘못 설정 되었습니다.",
	// @@@ 코믹 뷰어 뷰모델측 오류
		100: "해당 작품의 최대 페이지 개수를 확인할 수 없었습니다.\n임시로 200 페이지까지 볼 수 있도록 설정 합니다.",
		/**
		sourcePath와 page 등에 값을 설정하고 load 하면
		설정된 정보를 바탕으로 만화 컨텐츠 경로를 찾아간다.
		그 경로에서 index.xml 을 받아와 count 요소의 값을 max 값으로 가져 오는데
		이 index.xml 파일을 읽어 오는데 실패 했거나
		읽어 왔으나 그 내용이 이상한 것이다.
		못읽어 왔다고 만화 보기를 중단할 수는 없으니 일단 200개를 max로 잡고 보여주되
		이 상태에서 next 하다가 더이상 만화 페이지가 없다면 그 시점에 max를 잡는다.
		*/

		102: "최대 페이지 개수 자료가 잘못 되었습니다.",
		/**
		index.xml 을 불러오기는 성공 했는데 데이터 파싱에 실패 했을 때
		*/
		107: "페이지 설정 값이 유효하지 않습니다.",

		111: "해당 작품의 업데이트가 완료되지 않았습니다.\n다른 권(회)을 선택하거나 다른 작품을 감상하시길 바랍니다.",
		/**
		index.xml 불러오기에도 실패하고, 
		첫번째 이미지 (예: 001.jpg.nkc) 불러오기에도 실패 했을 때
		*/

		112: "해당 작품이 손실되어 이용이 불가 합니다.",
		/**
		만화 보는 중 연속으로 maxFailCount (기본값: 4) 만큼
		이미지 읽어오는데 실패 했을 경우 발생.
		*/

		

		120: "첫 페이지 입니다.",
		121: "마지막 페이지 입니다.",
		122: "마지막 페이지 입니다.\n다음 내용을 보시겠습니까?",
		/**
		각 권의 끝 페이지에서 한번 더 '다음'을 실행했을 경우 출력.
		*/

		129: "마지막 페이지 입니다.\n해당 작품의 모든 내용을 보셨습니다.",
		/**
		자동 넘기기 기능을 이용해서 모든 페이지와 모든 권을 넘겼을 경우
		*/

		130: "현재 도서 정보와 최종 도서 정보가 잘못 되었습니다.",
		/**
		화면에 설정된 bookno 값이 0이거나 each_books 내용이 비었을 때 발생
		*/
		140: "이용 내역 동기화에 실패 하였습니다.\n작품 감상이 불가 합니다.",
		/**
		빌로그 남기려 했는데 해당 URL이 없거나 수행에 실패 했을 때
		*/

		99999: "알 수 없는 오류 입니다."
	};
});
;define("jquery", function(){
	return jQuery;
});
define("knockout", function(){
	return ko;
});
define("sammy", ["jquery"], function($){
	return Sammy;
});
define("swfobject", function(){
	return swfobject;
});


define("service.loading", ["jquery", "util"],
	function($, util){

		return function(selector, opt){
			var jq = $(selector)
			,	isVisible = jq.is(":visible")
			,	fn
			;

			fn = function(use){
				if (use === false){
					jq.hide();
					isVisible = false;
				}
				else{
					jq.show();
					isVisible = true;
				}
			};

			fn.destroy = function(selector){
				$(selector).remove();
			};
			fn.shown = function(){
				return isVisible;
			};

			return fn;
		};
	});
;define("service.modal", ["jquery", "service", "util"],
	function($, service, util, undefined){
		function createOverlay(jqModal){
			var sId = jqModal[0].id
			, jqOverlay = jqModal.prevAll(".modal-overlay[data-from='" + sId + "']")
			;

			if (jqOverlay.length === 0){
				jqModal.before('<div class="modal-overlay" data-from="' + sId + '"></div>');
				jqOverlay = jqModal.prev();
			}

			jqOverlay.bind("click", onOverlayClick);

			return jqOverlay;
		}

		function bindMouseEventToButtons(jqModal){
			jqModal.find("button.btn").each(function(index){
				var jqBtn = $(this)
				,	sClass = jqBtn.attr("class")
				,	aClass = (sClass)? sClass.split(" ") : []
				,	sLastClass = (aClass.length > 0)? aClass[ aClass.length - 1 ] : ""
				;

				if (sLastClass === ""){
					return;
				}

				jqBtn.data("btnClass", sLastClass);
				jqBtn.mouseenter(onBtnHover)
					.mouseleave(onBtnLeave);
				
			});
		}

		function unbindMouseEventFromButtons(jqModal){
			jqModal.find("button.btn")
			.removeData()
			.unbind("mouseenter", onBtnHover)
			.unbind("mouseleave", onBtnLeave)
			;
		}

		function onOverlayClick(event){
			var jq = $(this)
			;

			event.stopPropagation();

			jq.hide();
			jq.next().fadeOut(200);
		}

		function onBtnHover(event){
			var jq = $(this)
			,	sClass = jq.data("btnClass") + "-hover"
			;

			if (jq.hasClass(sClass) === false){
				jq.addClass(sClass);
			}
		}

		function onBtnLeave(event){
			var jq = $(this)
			,	sClass = jq.data("btnClass") + "-hover"
			;

			jq.removeClass( sClass );
		}

		return function(selector){
			var jqModal = $(selector)
			,	jqOverlay = createOverlay( jqModal )
			,	mCallback = {result: undefined, show: undefined, hide: undefined}
			,	jqResultButtons
			,	api
			;

			function callback(name, arg0, arg1, arg2){
				var fn = mCallback[ name ]
				;

				if (typeof fn === "function"){
					fn.call(api, arg0, arg1, arg2);
				}
			}

			function getResultButtons(){
				if (!jqResultButtons){
					jqResultButtons = jqModal.find("[data-result][type!='submit']");
				}

				return jqResultButtons;
			}

			function onResultButton(event, a, b){
				var jqBtn = $(this)
				,	result = jqBtn.data("result")
				;


				event.preventDefault();

				callback("result", result, event, a );

				if (jqBtn.data("role") === "close"){
					api.hide();
				}

				return false;
			}

			bindMouseEventToButtons( jqModal );
			getResultButtons().on("click", onResultButton);

			api = {
				show: function(){
					jqOverlay.show();
					jqModal.fadeIn(350, function(event){
						setTimeout(function(){
							callback("show", event);
							jqModal.find("input").eq(0).focus();
						}, 150);
					});

					service("placeholder")(jqModal);

					return this;
				},
				hide: function(){
					// 끄려는 오버레이가 자기 것이 아니면 패스 한다.
					// if (jqOverlay.data("from") !== jqModal[0].id){
					// 	callback("hide", {});

					// 	return this;
					// }

					jqOverlay.hide();
					jqModal.fadeOut(200, function(event){
						callback("hide", event);
					});

					return this;
				},
				clear: function(){
					jqModal.find("input[type='text']").val("");

					return this;
				},
				destroy: function(){
					jqOverlay.remove();
					jqOverlay = undefined;

					unbindMouseEventFromButtons(jqModal);
					getResultButtons().unbind("click", onResultButton);
					this.unbindAll();

					jqModal = undefined;
					mCallback = undefined;
					jqResultButtons = undefined;
					api = undefined;
				},
				bind: function(name, callback){
					mCallback[name] = callback;

					return this;
				},
				unbind: function(name, callback){
					mCallback[name] = undefined;

					return this;
				},
				unbindAll: function(){
					var key
					,	mCallbacks = mCallback;

					for(key in mCallbacks){
						mCallbacks[key] = undefined;
					}

					return this;
				}
			};

			return api;
		};
	});
;define("service.placeholder", ["jquery"],
	function($){
		var placeholder = window.Placeholders || false
		,	fnFocusIn
		;

		fnFocusIn = function(){
			$(this)
			.removeClass("placeholdersjs")
			.removeClass("placeholderjs");
		};

		return function(elem){
			var jqElem;

			if (!placeholder || placeholder.nativeSupport){
				return;
			}

			jqElem = $(elem);

			jqElem.find("[placeholder]")
			.each(function(index){
				$(this)
				.unbind("focusin", fnFocusIn)
				.bind("focusin", fnFocusIn);

				placeholder.enable(this);
			});
		};
	});
;define("service.player.desktop", ["jquery", "util", "config", "service.purchase", "service.weblauncher.desktop"], 
	function($, util, config, purchase, weblauncher){

		return function(item){
			var contentId 	= util.mapValDef(item, "content_id")
			, mac = (config.custInfo)? config.custInfo.mac : ""
			;

			return {
				play: function(){
					var iPrice = 0
					;
					if (!contentId){
						alert(
							"재생 할 영상 정보가 부족합니다.\n" +
							"CONTENT_ID=" + contentId
							);

						return;
					}

					try{
						iPrice = parseInt( item.amt_price );
					}
					catch(e){}

					// 맥주소가 비었거나 가격이 비었거나 혹은 0원이라면
					// 곧바로 수행.
					if (!mac || !iPrice){
						weblauncher.play( item );

						return;
					}

					purchase(item)
					.done(function(){
						weblauncher.play( item );
					})
					.fail(function(error){
						if (error.msg){
							alert(error.msg);

							return;
						}

						alert("가격 정보에 오류가 있습니다.\n" + util.disassemble(error));
					})
					;
				},
				showTV: function(){
					weblauncher.showTV();
				}
			};
		};
	});
;define("promise", function(){
	var $p = function(fn){
		var self = this
		;

		this.resolve = function(){
			if (typeof self._cbDone === "function"){
				self._cbDone.apply( this, arguments );
				self.anyway.apply( this, arguments );
			}
			else{
				self._iw = "done";
				self._iwArgs = arguments;
			}
		};
		this.reject = function(){
			if (typeof self._cbFail === "function"){
				self._cbFail.apply( this, arguments );
				self.anyway.apply( this, arguments );
			}
			else{
				self._iw = "fail";
				self._iwArgs = arguments;
			}
		};
		this.anyway = function(){
			if (typeof self._cbAlways === "function"){
				self._cbAlways.apply( this, arguments );
			}
			
			self.unbind();
		};
		/*
		@deprecated
		this.immediate = function(word){
			//this._iw = word;

			return function(){
				if (word === "done"){
					this.resolve.apply( this, arguments );
				}
				else{
					this.reject.apply( this, arguments);
				}
				//self._iwArgs = arguments;
			};
		};
		*/
		this._cbDone = null;
		this._cbFail = null;
		this._cbAlways = null;
		this._iw = "";
		this._iwArgs = undefined;


		if (typeof fn === "function"){
			fn.call(this, this.resolve, this.reject);
		}
	};

	$p.prototype = {
		done: function(callback){
			try{
				if (this._iw === "done"){
					callback.apply(this, this._iwArgs);
				}
				else{
					this._cbDone = callback;
				}
			}
			catch(error){
				this.reject(error);
			}

			return this;
		},
		fail: function(callback){
			if (this._iw === "fail"){
				callback.apply(this, this._iwArgs);
			}
			else{
				this._cbFail = callback;
			}

			return this;
		},
		always: function(callback){
			if (this._iw === "done" || this._iw === "fail"){
				callback.apply(this, this._iwArgs);
			}
			else{
				this._cbAlways = callback;
			}

			return this;
		},
		unbind: function(){
			this._cbDone = undefined;
			this._cbFail = undefined;
			this._cbAlways = undefined;
			this._iw = undefined;
			this._iwArgs = undefined;
		}
	};

	return $p;
});
;define("service.purchase", 
	["util", "config", "viewmodel", "service", "service.modal"],
	function(util, config, viewmodel, service, modal, undefined){

	var vmPurchase
	, fnDestroy
	, fnInitFrame
	;

	fnDestroy = function(){
		if (vmPurchase){
			vmPurchase.destroy();
			vmPurchase = undefined;
		}
	};

	

	return function(item){
		if (item === "destroy"){
			fnDestroy();

			return;
		}

		if (!vmPurchase){
			vmPurchase = viewmodel("purchase").init().apply();
		}

		return util.promise(function(resolve, reject){
			var iPrice = 0
			, custInfo = config.custInfo
			, mac = (custInfo) ? custInfo.mac : ""
			;

			if (!mac){
				reject({msg: "MAC 주소가 비었습니다."});

				return;
			}

			try{
				iPrice = parseInt( item.amt_price );
			}
			catch(e){
				reject(e);

				return;
			}

			// 가격 정보가 유효하다면 Modal을 출력해서 process 를 진행
			if (iPrice > 0){
				service("backend")
				("/exec/purchase_info_check.php", {
					contentId: item.content_id,
					custId: custInfo.id_cust,
					mac: mac
				})
				.done(function(res){
					if (res.info){
						resolve(item);

						return;
					}

					vmPurchase.promise(item)
					.done(function(result){
						if (result && result.msg){
							alert(result.msg);
						}
						resolve(item);
					})
					.fail(function(err){
						reject(err);
					})
					.always(function(){

					});
				})
				.fail(function(){
					reject({msg: "결제 정보를 확인할 수 없었습니다."});
				});
			}
			else{
				reject({msg: "가격 정보가 없거나 0원 입니다."});
			}
		});
	}
});
;define("service.route", ["jquery", "sammy", "service", "viewmodel", "util", "route"], 
	function($, Sammy, service, viewmodel, util, routeInfo, undefined){
		return function(url){
			var route = Sammy(function(){
				var sammySelf = this
				, aList = routeInfo()
				, iLen = 0
				, i = -1
				, item
				, viewModel = viewmodel
				, vm
				, fn, fnExec, fnRegister
				, requestNow = false
				;

				if ($.isArray(aList) === false){
					return;
				}

				iLen = aList.length;

				fnRegister = function(item){
					var sVerb = (item.hasOwnProperty( "verb" )) ? item.verb : "get";
					//var item = mItem;

					if (!item.url){
						throw "[error] route : item.url is undefined or empty.";
					}

					this[ sVerb ](item.url, function(context){
						var redirectTo
						,	i = -1, iLen
						,	controllerInfo = item.controller
						;

						if (requestNow === true){
							return;
						}

						requestNow = true;

						setTimeout(function(){
							requestNow = false;
						}, 100);

						if ( typeof controllerInfo === "string" ){
							//fnExec( viewModel, item, context  );
							//util.debug.log( controllerInfo + "-" + sVerb + "-" + "" );
							viewModel( controllerInfo ).routecallback( context );

							return;
						}
						else{
							redirectTo = item.redirectTo;
						}

						if (redirectTo){
							context.redirect( redirectTo );

							return;
						}

						if (!controllerInfo){
							throw "[error] route : item.controller is undefined or empty.";	
						}

						if ($.isPlainObject(controllerInfo)){
							fnExec( viewModel, controllerInfo, context );

							return;
						}

						iLen = controllerInfo.length;

						while(++i < iLen){
							fnExec( viewModel, controllerInfo[ i ], context );
						}
					});
				};

				fnExec = function(viewModel, info, context){
					var isStringInfo = typeof info === "string"
					,	vmName = (isStringInfo)? info : info.viewModel
					,	callbackName = (isStringInfo)? "routecallback" : info.method
					;

					viewModel( vmName )[ callbackName ]( context );
				};

				while(++i < iLen){
					fnRegister.call(this, aList[ i ]);
				}
			});

			route.run(url);
		};
	});
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
				
				//iHeight = jqListMovies.outerHeight();
				//iBarHeight = calcScrollBarHeight( iLength, iHeight );

				jqListMovies.tinyscrollbar();

				//scrollbar = jqListMovies.data("plugin_tinyscrollbar");

				// jqListMovies.bind("move", function(a,b,c){
				// 	console.log("tinyscrollbar", a,b,c);
				// });
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
;define("util", ["jquery", "knockout", "promise"], function($, ko, Promise){
	var fnCheckIEVersion = function(){
		var rv = -1, ua, re;

        if (navigator.appName == 'Microsoft Internet Explorer'){
            ua = navigator.userAgent;
            re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");

            if (re.exec(ua) !== null){
                rv = parseFloat( RegExp.$1 );
            }
        }
        else if(navigator.appName == "Netscape"){                       
            /// in IE 11 the navigator.appVersion says 'trident'
            /// in Edge the navigator.appVersion does not say trident
            if(navigator.appVersion.indexOf('Trident') === -1) rv = 12;
            else rv = 11;
        }

        if (rv > 11){
        	return -1;
        }

        return rv;
	}
	, ieVersion = fnCheckIEVersion()
	, isIE = ieVersion > 0
	;

	return {
		noop: function(e){
			return false;
		},
		noopstop: function(e){
			e.stopPropagation();

			return false;
		},

		addKoFieldsToList: function(data, keys){
			var iLen, i
			;

			if ($.isArray(data) === false){
				return data;
			}

			iLen = data.length;
			i = -1;

			while(++i < iLen){
				data[i] = this.addKoFields(data[i], keys);
			}
		},

		addKoFields: function(item, keys){
			var iLen, i, k = ko, key, val
			;

			if ($.isPlainObject(keys) === true){
				for(key in keys){
					val = keys[key];
					item[ key ] = k.observable( val );
				}
			}

			return item;
		},

		textOverflow: function(text, len, ellipsis){
			var sText = text
			,	iLen = len || 103
			,	sEnd = ellipsis || "..."
			,	iMax = iLen - sEnd.length
			;

			if (typeof sText === "string"){
				if (sText.length > iLen){
					sText = sText.substring(0, iMax) + sEnd;
				}

				return sText;
			}

			return text;
		},

		mapValDef: function(map, key, def){
			if (!map || !map.hasOwnProperty(key)){
				return def;
			}

			return map[key];
		},

		/*
		item 에 등록된 Property 값들에 대한 유효성을 검증한다.
		@param item = Map
		@param info = Array
			구조: {
				name: String,
				msg: String
				regex: 정규식 조건
			}
		*/
		valid: function(item, info){
			var i, iLen, mInfo, key, val, isValid = true
			;

			if (!item || !$.isArray(info)){
				return {
					valid: false,
					target: "all",
					msg: "입력이 잘못 되었습니다."
				};
			}

			i = -1;
			iLen = info.length;

			while(++i < iLen){
				mInfo = info[i];
				key = mInfo.name;
				val = item[key];

				if (!mInfo.regex){
					if (!val === undefined || val === null || val === ""){
						isValid = false;
					}
				}

				if ( mInfo.regex.test( val ) === false ){
					isValid = false;
				}

				if (isValid === false){
					return {
						name: key,
						value: val,
						msg: mInfo.msg,
						valid: false
					};
				}
			}

			return {
				name: "all",
				msg: "",
				valid: true
			};
		},

		trim: function(str){
			if (typeof str === "string"){
				return str.replace(/^\s+|\s+$/g, "");
			}

			return str;
		},

		cookie : {
			set: function(name, value, expirehours, domain) {
			    var today = new Date();

			    today.setTime(today.getTime() + (expirehours * 3600000 /* 60*60*1000*/ ));
			    document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + today.toGMTString() + ";";

			    if (domain) {
			        document.cookie += "domain=" + domain + ";";
			    }
			},
			get: function(name){
			    var find_sw = false
			    ,	start, end
			    ,	i = 0
			    ,	sTmp = unescape(document.cookie)
			    ;

			    for (i=0; i<= sTmp.length; i++)
			    {
			        start = i;
			        end = start + name.length;

			        if(sTmp.substring(start, end) == name) {
			            find_sw = true;
			            break;
			        }
			    }

			    if (find_sw == true){
			        start = end + 1;
			        end = sTmp.indexOf(";", start);

			        if(end < start){
			            end = sTmp.length;
			        }

			        return sTmp.substring(start, end);
			    }
			    return "";
			},
			remove: function(name){
			    var today = new Date()
			    ,	value
			    ;

			    today.setTime(today.getTime() - 1);
			    value = m.cookie.get(name);

			    if(value != ""){
			    	document.cookie = name + "=" + value + "; path=/; expires=" + today.toGMTString();
			    }
			        
			}
		},

		addDate : function(date, intVal, useFmt){
			var dateData = null
			,	saDate = null
			;
			
			if (date instanceof Date){
				dateData = date;
			}
			else{
				//saDate = date.split("-");
				dateData = new Date( date );
				//dateData.setFullYear( saDate[0] );
				//dateData.setMonth( parseInt(saDate[1]) - 1 );
				//dateData.setDate( saDate[2] );
			}
	    	dateData.setDate( dateData.getDate() + intVal );

	    	if (useFmt === false){
	    		return dateData;
	    	}

	    	return this.dateFormat(dateData);
		},

		dateFormat : function(date, delimiter) {
	        var sDelimiter = delimiter || "-"
	        ,	iMonth
	        ,	iDate
	        ;
	        
	        if (date instanceof Date){
				iMonth = date.getMonth() + 1;
				iDate = date.getDate();
				
				return date.getFullYear() + sDelimiter + ((iMonth < 10)? "0" + iMonth : iMonth) + sDelimiter + ((iDate < 10)? "0" + iDate : iDate);
			}
			else{
				return date.substring(0, 4) + sDelimiter + date.substring(4, 6) + sDelimiter + date.substring(6, 8);
			}
	    },

	    setAltImgEvent : function(imgPath){
	    	return function(item, event){
	    		var elem = event.currentTarget;

	    		//console.log("setAltImgEvent", elem.src);

				if (elem.src.indexOf(imgPath) < 0){
					elem.src = imgPath;
				}
	    	};
	    },

		debug: {
			log: function(txt){
				var sTxt
				;

				$("#panel_debug").show();

				sTxt = $("#txtDebug").val() + "\r\n" + txt;

				$("#txtDebug").val(sTxt);
			}
		},

		promise: function(fn){
			return new Promise(fn);
		},

		IEVersion: ieVersion,
	    isIE: function(){
	        return isIE;
	    },
	    pad: function(num, size){
	        var s = "000000000" + num;

	        return s.substr(s.length - (size || 0));
	    },
	    disassemble: function(obj, preppend){
	    	var aMsg, key, val
			sPre = preppend || ""
	    	;

	    	aMsg = []
			for(key in obj){
				aMsg.push(sPre);
				aMsg.push(key)
				aMsg.push("=")

				val = obj[key];

				if (typeof val === "object"){
					aMsg.push( this.disassemble(val, sPre + " -") );
				}
				else{
					aMsg.push( val );
				}
				
				aMsg.push("\n");
			}
			return aMsg.join("");
	    },

	    sameDomain: function(url){
	    	var regex;

	    	if (url.substr(0, 1) !== "/" || url.substr(0, 4) === "http"){
	    		regex = new RegExp(location.hostname);
	    		//(function(){var s = "http://www.newkey.co.kr", d = "www.newkey.co.kr", reg = new RegExp(d); console.log( reg.test(s) );})();
				return regex.test(url);
	    	}

	    	return true;
	    },

	    objectToParameter: function(params){
	    	var aRet = [], key, i=0;

	    	for(key in params){
	    		if (i > 0){
	    			aRet.push( "&" );
	    		}
				aRet.push( key );
				aRet.push( "=" );
				aRet.push( encodeURIComponent( params[key] ) );
				i++;
	    	}

	    	return aRet.join("");
	    },

	    timeFormat: function(time, wordHour, wordMin){
			var iTime = parseInt( time )
			,	iHour = Math.floor(iTime / 3600)
			,	iMin = Math.floor( (iTime % 3600) / 60 )
			,	sWordHour = wordHour || "시"
			,	sWordMin = wordMin || "분"
			;

			return iHour + sWordHour + " " + iMin + sWordMin;
		},

		copyByOwnProp: function(data){
			var key, val, mRet = {}
			;

			for(key in data){
				if (data.hasOwnProperty(key)){
					mRet[key] = data[key];
				}
			}

			return mRet;
		}
	};
});
;define("service.webcube", 
	["jquery", "envcheck", "util"],
	function($, env, util){

	var sId = "webcube"
	, sVer = "4,0,0,9" // 파일은 최신버전인데 구동할 땐 이걸로 하지 않으면 제대로 수행이 안되었음
	//, sVer = "4,1,7,6"
	, sPath = "/comicviewer/webcube4176/"
	, sUrl = ""
	, wc = null
	, hasSetup = false
	, fnGetWebcube = function(){
		if (!wc){
			return document.getElementById(sId);
		}
		
		return wc;
	}
	, fnExeWebcubeOld = function(url){
		var sFileName = fnGetFileName()
		, sTags = '<object classid="CLSID:29BC57E0-018D-46D2-B233-338B779C169C" '+
            'width="0" height="0" id="'+sId+'" codebase="'+sPath+sFileName+'#version='+sVer+'" '+
            'VIEWASTEXT onerror="OnActiveXError()" onreadystatechange="OnWebcubeReady()"></object>' +
            '<div class="loading"><div class="img"></div><br/>만화 뷰어를 불러오는 중입니다...</div>'

        , jqHead = $("head")
        ;

        //alert(sFileName + "," + sVer);
		
		window.OnActiveXError = fnOnActiveXError;
		window.OnWebcubeReady = fnSetActiveXState;//util.noop;
		window.CtrlInitComplete = fnCtrlInitComplete;
		window.CtrlStatus = fnCtrlStatus;

		jqHead.append('<script language="javascript" for="'+sId+'" event="CtrlInitComplete()">CtrlInitComplete();</script>');
		jqHead.append('<script language="javascript" for="'+sId+'" event="CtrlStatus(nCode,nResult)">CtrlStatus(0,0);</script>');

		window.isInstallActiveX = -1;

		//window.isInstallActiveX = 1;
		window.isInitOCX = false;

		sUrl = url;

		//document.write(sTags);

		$("body").html(sTags);

		//document.write(sTags);
	}
	, fnGetFileName = function(){
		var bOs64 = env.os64()
		, bWeb64 = env.web64()
		;

		//alert("os64=" + bOs64 + ",web64=" + bWeb64);

		if (!bOs64 && !bWeb64){
			return "WebCube.cab";
		}
		if (bOs64 && !bWeb64){
			return "WebCubewow.cab";
		}

		return "WebCube64.cab";
	}
	, fnOnActiveXError = function(){
		window.isInstallActiveX = 0;
		alert("ActiveX Error");
	}
	, fnSetActiveXState = function(){
		var webcube = fnGetWebcube()
		;

		//webcube.CtrlInitComplete = fnCtrlInitComplete;
		//webcube.CtrlStatus = fnCtrlStatus;


		if (webcube && (window.isInstallActiveX != 0) && webcube.readyState == 4){
			wc = webcube;
			window.isInstallActiveX = 1;

			//alert("fnSetActiveXState OK");

			//fnCtrlInitComplete();
		}



		//setTimeout(fnSetActiveXState, 500);
	}
	/**************************************
	이벤트명 : CtrlInitComplete()

	내   용 :
	- OCX 초기화가 끝나면 OCX가 CtrlInitComplete이벤트 발생 (OCX가 발생시키는 이벤트)

	- isInstallActiveX 변수 값을 1로 세팅 
	    : CtrlInitComplete 이벤트는 ActiveX가 Install되고 나서 나오는 이벤트이므로 다시 한번 1로 세팅해 줌.

	- OCX 초기화 전역변수 true로 세팅

	***************************************/
	, fnCtrlInitComplete = function(webcube){
		var webcube = fnGetWebcube()
		, aProtectArgs = [
			 "G"    // CheckSum ("G"값 고정)
			,"1"    // VmWare, Terminal 기능 차단(0) / 허용(1)
			,"1"    // Print 기능 차단(0) / 허용(1)
			,"1"    // SaveAs 기능 차단(0) / 허용(1)
			,"1"    // Mouse 기능 차단(0) / 허용(1)
			,"1"    // ScreenCapture 기능 차단(0) / 허용(1)
			,"1"    // SourceView 기능 차단(0) / 허용(1)
			,"1"    // Word Editor 기능 차단(0) / 허용(1)
			,"1"    // Mail로 보내기 기능 차단(0) / 허용(1)
			,"1"    // ClipBorad(Ctrl+C)기능 차단(0) / 허용 (1)
			,"1"	// ClipBorad(Ctrl+V) 기능 차단(0) / 허용 (1)
		];

		if (!webcube){
			setTimeout(fnCtrlInitComplete, 500);
			return;
		}

		//console.log("fnCtrlInitComplete");
		window.OnWebcubeReady = fnSetActiveXState;

		window.isInstallActiveX = 1;
		window.isInitOCX = true;
		//window.ProtectString = aProtectArgs.join("");

		//alert("before Protect");
		webcube.CmdMethod(1000, "0", 0, "0", 0, 0, "0");
		webcube.SetProtect(aProtectArgs.join(""));

		//alert("Protect");

		
		webcube.SetPolicy("#basic#,*:T-PAMSVWLcv+");
		//webcube.SetPolicy("#basic#,*t_viewer.php:T-PAMSVWLcv+");
		
		hasSetup = true;
		

		//fnCtrlStatus(0,0);
	}
	/**************************************

	이벤트명 : CtrlStatus()

	내   용 :
	- SetProtect 메소드가 호출된 후 발생하며, OCX의 현재 상태를 코드로 리턴해주는 이벤트

	- 리턴 코드가 오류인 경우 setMessage() 함수 호출

	- 리턴 코드가 정상인 경우 parent.mainFrm 프레임에 원하는 페이지 호출

	- 리턴 코드는 nCode : 0 , nResult : 0 인 경우 정상. 그외 코드는 오류임

	***************************************/
	, fnCtrlStatus = function(nCode, nResult){
		// if (nCode == 0 && nResult != 0){
		// 	alert("웹큐브 수행에 실패 하였습니다.");

		// 	return;
		// }

		if (!hasSetup || !fnGetWebcube()){
			setTimeout(fnCtrlStatus, 500);
			return;
		}

		//alert("newkey!!!");

		document.location = sUrl;
	}
/*****************************************************************************
웹큐브 신버전 부분
*****************************************************************************/
	, fnExeWebcube = function(url){
		window.__curl__ = url;

		//alert("url=" + window.__curl__);

		$("head").append(
			'<script type="text/javascript" src="./WebCube/WebCubeAgent_UserSet.js"></script>'
		);

		$("body").append(
			//'<script language="javascript" for="Obj" event="CtrlStatus( nCode, nResult)" src="./WebCube/ActiveX1.js"></script>' +
			//'<script language="javascript" for="Obj" event="CtrlInitComplete()" src="./WebCube/ActiveX2.js"></script>' +
			'<script type="text/javascript" src="./WebCube/WebCubeAgent_Msg.js"></script>' +
			'<script type="text/javascript" src="./WebCube/WebCubeAgent_Setup.js"></script>' +
			'<script type="text/javascript" src="./WebCube/WebCubeAgent_I.js"></script>' +
			//'<script type="text/javascript" src="./WebCube/ActiveX3.js"></script>'
			''
		);

		fnStartPolicy();
	}
	, fnStartPolicy = function(){
		if (window.StartPolicy){
			fnApplyBg();
			window.StartPolicy();

			return;
		}

		setTimeout(fnStartPolicy, 250);
	}
	, fnApplyBg = function(){
		//var jqBg = $("<div></div>");

		$("#panel_pluginCheck").hide();

		$("body").css("background", "#fff");

		// jqBg.css({
		// 	width: "100%",
		// 	height: "100%",
		// 	position: "absolute",
		// 	background: "#fff",
		// 	top: 0,
		// 	left: 0
		// 	//,"z-index": 0
		// });

		// $("body").append(jqBg);
	}
	
	;

	return {
		apply: function(url){
			var bOld = env.webcubeOld() || (util.IEVersion < 9);

			// 웹큐브 회피 (테스트용)
			//location.href = url;return;

			// 구버전 웹큐브가 설치 되어 있다면 그 것을 이용 한다.
			if (bOld){
				fnExeWebcubeOld(url);

				return;
			}

			fnExeWebcube(url);

			//

		}
	};
});
;define("service.weblauncher.desktop", ["jquery", "util", "config"],
	function($, util, config){

var mInfo = config.custInfo;
var DEMO_PLAY_SEC = 300000;
var CLIENT_TYPE = (mInfo && mInfo.client_type)? mInfo.client_type : "E";

function sendCommand(cmd){
	window.status = cmd;
	window.status = "";
}

// InitSetting.js [시작]
function Resize(Mode)
{
	var value_status	= "";
	if(Mode.indexOf("Mini") != -1)
		value_status = "MINIRZV*580*288";
	else if(Mode.indexOf("Main") != -1)
		value_status = "MAINRZV*1044*788;"
	else if(Mode.indexOf("CON") != -1)
		value_status = Mode;

	sendCommand(value_status);
}

function BKColor()
{
	sendCommand("BKRGB*5*31*58");	
}

function MainExit()
{
	sendCommand("RESULT=MAIN_EXIT");
}
function CaptionMove(Mode)
{
	var value_status	= "";
	if(Mode == "CAP_MAIN")
		value_status = "RESULT="+Mode +"|MOVE=" + "70";
	else if(Mode == "CAP_SETTING")
		value_status = "RESULT="+Mode +"|MOVE=" + "60" ;
	else
		value_status = "RESULT="+Mode +"|MOVE=" + "60"+ "|WIDTH=" + "60";

	sendCommand(value_status);
}
// InitSetting.js [종료]


// movie.js 참고 [시작]
function serializePlayString(info){
	var fnMapValDef	= util.mapValDef
	,	sRet = "RESULT=CONTENTS" +
		"|ID_CONTENTS=" + fnMapValDef(info, "content_id") +
		"|ADULT=" 		+ fnMapValDef(info, "isAdult", "N") +
		"|NM_MOVIE=" 	+ fnMapValDef(info, "title", "") +
		"|IS_DEMO=" 	+ fnMapValDef(info, "isDemo", "0") +
		"|DEMO_PLAY_SEC=" + DEMO_PLAY_SEC +
		"|LOGO_ADULT=" 	+ fnMapValDef(info, "logo_adult", "0") +
		"|IS_3D=" 		+ fnMapValDef(info, "is3D", "0") +
		""
	;

	return sRet;
}
// movie.js 참고 [종료]

// menu.js 참고 [시작]
function showTV(){
	if (CLIENT_TYPE === "D"){
		sendCommand("RESULT=TV");
	}
	else{
		sendCommand("RESULT=TV_KBS");
	}
}
// menu.js 참고 [종료]

// initialize [시작]
// 별다른 조건이 필요 없다면 즉시 수행하는 것들
CaptionMove( "CAP_MAIN" );
mInfo = undefined;
// initialize [종료]

		return {
			close: function(){
				MainExit();
			},
			captionMove: function(){
				CaptionMove( "CAP_MAIN" );
			},
			play: function(info){
				var sPlayString = serializePlayString(info);

				sendCommand(sPlayString);
			},
			showTV: function(){
				showTV();
			}
		};
	});
;define("component.base", ["jquery"],
    function($){
	var BaseComponent = function(){
		
	},	cp
	;
	
	cp = BaseComponent.prototype;
	
	cp.init = function(elem){
        this._events = {};
        this._eventsOwner = {};

		return this;
	};

    cp.destruct = function(){
        var key
        ;
        if (this._events === undefined){
            return;
        }

        for(key in this._events){
            this._events[key] = undefined;
            this._eventsOwner[key] = undefined;
        }

        this._events = undefined;
        this._eventsOwner = undefined;
    };

    // TODO: 만들어볼랬는데, 보류..
    // BaseComponent.property = function(){
    //     var i = 0
    //     , iLen = arguments.length
    //     , self = arguments[0]
    //     , name
    //     , _name
    //     ;
        
    //     while(++i < iLen){
    //         name = arguments[i];
    //         _name = "_" + name;
            
    //         self[ name ] = new Function('if (arguments[0] === undefined){return this._' + name + ';} this._' + name + '=arguments[0];');
    //         self[ _name ] = 
    //     }
    // };
	
	BaseComponent.regEvent = function(){
        var i = 0
        , iLen = arguments.length
        , self = arguments[0]
        , name
        , nameLower
        ;
        
        while(++i < iLen){
            name = arguments[i];
            nameLower = name.toLowerCase();
            
            self[ nameLower ] = new Function(
'this._events.' + name + '=arguments[0];\
if (arguments[1] !== undefined)\
{this._eventsOwner.'+name+'=arguments[1];}\
else\
{this._eventsOwner.'+name+'=this;}\
return this;');
            self[ name ] = new Function(
'if (typeof this._events.' + name + ' === "function")\
{this._events.' + name + '.apply(this._eventsOwner.'+name+',arguments);}');
        }
    };

    return BaseComponent;
});
;define("component.image.flash", ["jquery", "component.image", "swfobject", "config", "util"], 
    function($, ImageComponent, swfobject, config, util){
    var FlashImageComponent = function(elem){
            this._index = imgIndex;
            this._src = "";
            this._altSrc = "";
            this._emptySrc = "";
            this._width = "";
            this._height = "";
            this._flashImg = null;
            this._jqParent = null;
            this._jqAsideBottom = null;
            this._jqAsideTop = null;
            this.imgInfo = undefined;
            this.isReady = false;
            this.isLoaded = true;
            this.resizeInterval = -1;
            this._resizeFirst = true;

            this.init(elem);

            imgIndex++;
        }
    ,   cp
    ,   imgIndex = 0
    ;
    
    FlashImageComponent.prototype = new ImageComponent();
    
    cp = FlashImageComponent.prototype;
    
    cp.constructor = FlashImageComponent;
    cp.init = function(elem){
    	ImageComponent.prototype.init.call(this, elem);
    	
        var iCompIndex = this._index
        , sPrefix = "FlashImageComponent"
        , compId = sPrefix + iCompIndex
        
        
        , self = this
        , jqElem = $(elem)
        , isAutoSize = jqElem.data("auto-size") === true
        , jqParent = (isAutoSize)? jqElem.parent() : undefined
        , sGlobalEventLoaded = "__onImageComponentLoaded"
        , sGlobalEventFail = "__onImageComponentFail"
        , sGlobalEventComplete = "__onImageComplete"
        , initWidth = 0
        , buildTimeoutId = 0
        ;

        this._jqParent = jqParent;
        this._jqAsideBottom = $( jqElem.data("aside-bottom") );
        this._jqAsideTop = $( jqElem.data("aside-top") );
        
        window[sGlobalEventLoaded + iCompIndex] = function(){
            var img = document.getElementById(sPrefix + iCompIndex)
            , me = self
            ;
            
            try{
                me._flashImg = img;
                me.isReady = true;
                me._jqParent = $(img).parent();
                me.applyAltAndEmpty();
                me.onReady(me);
            }
            catch(e){
                me._throwError(3, e, me);
            }
        };
        
        window[sGlobalEventFail + iCompIndex] = function(errorCode){
            self._throwError(errorCode, {src: self.getSrc()}, self);
            self.isLoaded = true;
        };
        
        window[sGlobalEventComplete + iCompIndex] = function(_info){
            var info = _info;

            try{
                info.ratio = info.width / info.height;
                
                self.imgInfo = info;
                self.isLoaded = true;
                self.onLoaded(self, info);
            }
            catch(e){
                self.isLoaded = true;
                self._throwError(4, e, self);
            }
        };
        
        if (isAutoSize){
            $(window).on("resize", function(e){
                if (self.resizeInterval > -1){
                    clearTimeout(self.resizeInterval);
                }

                self.resizeInterval = setTimeout(function(){
                    self.resize();
                }, 50);
            });
        }

        this.destruct = function(){
            ImageComponent.prototype.destruct.call(this);
            
            this._flashImg = undefined;
            this._jqParent = undefined;
            this._jqAsideBottom = undefined;
            this._jqAsideTop = undefined;
            window[sGlobalEventLoaded + iCompIndex] = undefined;
            window[sGlobalEventFail + iCompIndex] = undefined;
            window[sGlobalEventComplete + iCompIndex] = undefined;
        };

        this.build = function(){
            var flashvars = {
                index: this._index
                ,debug: "false"
            }
            , initWidth = jqElem.innerWidth() / 2
            , sFlashPath = config.flashShimPath || "js/"
            , params = {
                menu: "false",
                scale: "noScale",
                allowFullscreen: "false",
                allowScriptAccess: "always",
                bgcolor: "",
                wmode: "Opaque"
                //wmode: "direct" // can cause issues with FP settings & webcam
            }
            , attributes = {
                id: compId
            }
            ;

            if (initWidth <= 0){
                initWidth = 1;
            }
            
            swfobject.embedSWF(
                sFlashPath + "FlashImageComponent.swf", 
                jqElem.attr("id"), initWidth, 1, "10.0.0", 
                sFlashPath + "expressInstall.swf", 
                flashvars, params, attributes);

            jqElem = undefined;
        };
        
        return this;
    };
    /**
    data-aside-bottom, 혹은 top 속성값의 선택자와 대응되는 요소의 높이를 가져 온다.
    없었다면 0을 반환.
    */
    cp.getAsideHeight = function(dir){
        var jqElem = this["_jqAside" + dir]
        , iHeight = 0
        //, iever
        ;

        if (jqElem.length === 0){
            return 0;
        }

        return jqElem.innerHeight();

        //iHeight = jqElem.innerHeight();

        //return iHeight;
    };
    cp.resize = function(noDuplicate){
        var h = 0
        ,   jqParent = this._jqParent
        ,   self = this
        ;

        if (this.isDisplay() === false){
            return;
        }
        
        if (!this.isReady || !jqParent || !self.imgInfo){
            return;
        }

        h = $(document).innerHeight() - this.getAsideHeight("Bottom") - this.getAsideHeight("Top");

        //console.log("h", h, $(document).innerHeight(), this.getAsideHeight("Bottom"), this.getAsideHeight("Top"));

        if (h > 1080){
            h = 1080;
        }

        
        self.setHeight( h );
        self.setWidth( h * self.imgInfo.ratio );

        if (noDuplicate){ 
            return;
        }

        setTimeout(function(){
            var docH = $(document).innerHeight()
            , imgH = self.getHeight() + self.getAsideHeight("Bottom") + self.getAsideHeight("Top")
            , selfH = self.getHeight()
            ;

            //console.log("docH=", docH, "imgH=", imgH, "selfH=", selfH);

            if (docH < imgH){
                self.resize();
            }
            else{
                self.resize(true);
            }

            
        }, 50);
    };
    
    cp.getSrc = function(){
        return this._src;
    };
    cp.setSrc = function(src){
        if (!this.isReady || 
            !this.isLoaded){
            return;
        }
        if (this._src === src){
            this.onLoaded(this, this.imgInfo);

            return;
        }
        this._src = src;
        this.isLoaded = false;
        this._flashImg.setSrc( src );
    };

    cp.getAltSrc = function(){
        return this._altSrc;
    };
    cp.setAltSrc = function(src){
        if (this._altSrc === src){
            return;
        }
        this._altSrc = src;

        if (!this.isReady){
            return;
        }
        this._flashImg.setAltSrc( src );
    };

    cp.getEmptySrc = function(){
        return this._emptySrc;
    };
    cp.setEmptySrc = function(src){
        if (this._emptySrc === src){
            return;
        }
        this._emptySrc = src;

        if (!this.isReady){
            return;
        }
        this._flashImg.setEmptySrc( src );
    };
    cp.empty = function(){
        if (!this.isReady || 
            !this.isLoaded ||
            !this._emptySrc){
            return;
        }

        this._src = "";
        this._flashImg.empty();
    };

    cp.applyAltAndEmpty = function(){
        var img = this._flashImg
        , altSrc = this._altSrc
        , emptySrc = this._emptySrc
        ;

        if (altSrc){
            img.setAltSrc(altSrc);
        }
        if (emptySrc){
            img.setEmptySrc(emptySrc);
        }
    };
    
    cp.getWidth = function(){
        return this._width;
    };
    cp.setWidth = function(width){
        this._width = width;
        this._flashImg.style.width = width + "px";
    };
    cp.getHeight = function(){
        return this._height;
    };
    cp.setHeight = function(height){
        this._height = height;
        this._flashImg.style.height = height + "px";
    };
    cp.show = function(){
        $(this._flashImg).css("width", "1px");
        this.resize();
    };
    cp.hide = function(){
        $(this._flashImg).css("width", "0px");
    };
    cp.isDisplay = function(){
        var sDisplay = $(this._flashImg).css("width");

        return (sDisplay === "" || (sDisplay !== "0" && sDisplay !== "0px"));
    };
    // @override
    cp.onLoaded = function(img, info){
        ImageComponent.prototype.onLoaded.apply(this, arguments);
        this.resize();
    };
    
    return FlashImageComponent;
});
;define("component.image.html5", ["jquery", "component.image", "util"], 
	function($, ImageComponent, util){
	var Html5ImageComponent = function(elem){
			var self = this
			, fnLoad
			, fnError
			;

			fnLoad = function(){
				var responseArray = new Uint8Array(this._xhr.response, 5);
				var blob = new Blob([responseArray], {type: "image/jpeg"});

				this._jqImg[0].src = URL.createObjectURL(blob);
				this.isLoaded = true;
				this.onLoaded(this);
			}.bind(this);
			fnError = function(e){
				this.isLoaded = true;
				this._throwError(1, e, this);

				if (this._altSrc){
					this._jqImg[0].src = this._altSrc;
				}
			}.bind(this);

			this._xhr = new XMLHttpRequest();

			this._xhr.addEventListener("load", fnLoad);
			this._xhr.addEventListener("error", fnError);
	
			this.isReady = true;
            this.isLoaded = true;
			this._jqElem = null;
			this._jqImg = null;
			this._src = "";
            this._altSrc = "";
            this._emptySrc = "";
            this._fnError = fnError;

			this.destruct = function(){
				ImageComponent.prototype.destruct.call(this);
				
				try{
					this._jqImg.remove();
					this._jqImg = undefined;
				}
				catch(e){}

				try{
					this._jqElem.empty();
					this._jqElem = undefined;
				}
				catch(e){}

				try{
					this._xhr.abort();
					this._xhr.removeEventListener("load", fnLoad);
					this._xhr.removeEventListener("error", fnError);
					this._xhr = undefined;
				}
				catch(e){}
			};
			this.build = function(){};

			this.init(elem);
		}
	,	cp
	;

	Html5ImageComponent.prototype = new ImageComponent();

	cp = Html5ImageComponent.prototype;

	cp.constructor = Html5ImageComponent;
	cp.init = function(elem){
		ImageComponent.prototype.init.call(this, elem);

		var jqElem = $(elem)
		,	jqImg = $('<img src="" alt="comic" />')
		,	jqParent = jqElem.parent()
		;

		jqImg.replaceAll(jqElem);
		jqElem = jqImg;
		jqElem.empty().append( jqImg );

		this._jqElem = jqElem;
		this._jqImg = jqImg;

		return this;
	};

	
	// @override
	cp.onready = function(handler, owner){
		ImageComponent.prototype.onready.call(this, handler, owner);

		if (this.isReady === true){
			this.onReady(this);
		}
	};

	cp.loadImage = function(url){
		this.isLoaded = false;
		this._xhr.open("GET", url, true);
		this._xhr.responseType = "arraybuffer";
		this._xhr.send();
	};
	cp.getSrc = function(){
		return this._src;
	};
	cp.setSrc = function(src){
		if (this.isLoaded === false){
            return;
        }
        if (this._src === src){
        	this.onLoaded(this);
        	return;
        }
		this._src = src;
		this.loadImage(src);
	};

	cp.getAltSrc = function(){
        return this._altSrc;
    };
    cp.setAltSrc = function(src){
        this._altSrc = src;
    };

    cp.getEmptySrc = function(){
        return this._emptySrc;
    };
    cp.setEmptySrc = function(src){
        this._emptySrc = src;
    };
    cp.empty = function(){
    	if (this._emptySrc){
			this._jqImg[0].src = this._emptySrc;
    	}

		this._src = "";
    	this.isLoaded = true;
    	this.onLoaded(this);
    };

	cp.getWidth = function(){
		return this._jqImg.outerWidth();
	};
	cp.setWidth = function(width){
		//this._width = width;
	};
	cp.getHeight = function(){
		return this._jqImg.outerHeight();
	};
	cp.setHeight = function(height){
		//this._height = height;
	};
	cp.show = function(){
        this._jqElem[0].style.display = "inline-block";
        //this._jqElem.show();
    };
    cp.hide = function(){
        this._jqElem[0].style.display = "none";
        //this._jqElem.hide();
    };
    cp.isDisplay = function(){
    	var sDisplay = this._jqElem[0].style.display;

        return (sDisplay === "" || sDisplay !== "none");
    };

	return Html5ImageComponent;
});
;define("component.image", ["jquery", "component.base", "service.error.msg"], 
    function($, BaseComponent, errorMsg){
	var ImageComponent = function(){
			
		}
	, cp
	;
	
	ImageComponent.prototype = new BaseComponent();
	cp = ImageComponent.prototype;
	
	cp.constructor = ImageComponent;
	
	cp.init = function(elem){
		BaseComponent.prototype.init.call(this, elem);
		
		return this;
	};
	
	cp._throwError = function(errorCode, errorObject, owner){
		var msg = ($.isNumeric(errorCode))? errorMsg[errorCode] : errorCode
        , mError = {
            code: errorCode,
            message: msg
        }
        ;

        if (window.console && errorObject){
        	console.log(mError, errorObject);
        }

        this.onFail(mError, owner);
	};

	BaseComponent.regEvent(cp, 
		/**
		컴포넌트 사용 상태가 '준비'됨.
		이 이벤트가 발동 되어야 비로소 이미지 컴포넌트를 사용할 수 있다.
		그 이전에 다른 기능을 수행하면 제대로된 기능을 보장받기 어렵거나
		오류가 발생될 수 있다.
		*/
		"onReady", 

		/**
		컴포넌트에서 이미지 불러오기를 정상적으로 수행 함.
		로딩 화면 등을 없앨 때 이 것을 응용하면 됨.
		*/
		"onLoaded", 

		/**
		각종 오류 시 발생.
		오류의 내용은 callback 함수의 첫번째 파라메터를 이용한다.
		service.error.msg 내용 참조.
		*/
		"onFail");
	
	return ImageComponent;
});
;define("component.imagepage", ["jquery", "util", "component.base", "component.image", "factory.component.image"], 
	function($, util, BaseComponent, ImageComponent, ImageComponentFactory){

	var ImagePageComponent = function(idPrefix){
		this._images = [];
		this._page = 1;
		this._max = 1;
		this._rdir = READING_DIRECTION_L2R;
		this._showCount = 0;
		this._ext = ".jpg.nkc";
		this.isReady = false;
		this.isLoaded = true;
		//this._pagination = new PaginationComponent();
		
		this.init();
		this.createImages(idPrefix, 2);
	}
	, cp
	// left2right=zorder2, right2left=zorder1
	, READING_DIRECTION_L2R = 0
	, READING_DIRECTION_R2L = 1
	;

	cp = ImagePageComponent.prototype = new ImageComponent();

	cp.constructor = ImagePageComponent;

	cp.init = function(elem){
		ImageComponent.prototype.init.call(this, elem);

		return this;
	};

	cp.createImages = function(idPrefix, count){
		var i = -1, iLen = count || 1
		, imgComp
		;

		while(++i < iLen){
			imgComp = ImageComponentFactory( "#" + idPrefix + i );
			imgComp.onready(this.onReadyImages, this);
			imgComp.onloaded(this.onLoadedImages, this);
			imgComp.onfail(this.onFailImages, this);
			this._images.push( imgComp );
		}

		this._showCount = iLen;
	};

	cp.destruct = function(){
		var i = -1, iLen = this._images.length
		;

		ImageComponent.prototype.destruct.call(this);

		while(++i < iLen){
			this._images[i].destruct();
			this._images[i] = undefined;
		}

		this._images = undefined;
	};

	cp.build = function(){
		this.batchSetMethod("build");
	};

	cp.makePaging = function(){
		var iPage = this.page()
		, i = -1
		, iLen = this.showCount()
		, aPaging = []
		;

		while(++i < iLen){
			aPaging.push(iPage);
			iPage++;
		}

		return aPaging;
	};

	cp.width = function(){
		return this.sumImageProp("getWidth");
	};
	cp.height = function(){
		return this.sumImageProp("getHeight", true);
	};

	cp.load = function(){
		var i = -1
		, iLen
		, aImg
		, sPath = this.sourcePath()
		, aPaging
		, fnPad = util.pad
		, iPage = 0
		, iMax = 0
		;

		if (!sPath || !this.isReady || !this.isLoaded){
			return;
		}

		this.isLoaded = false;
		this.onLoading();

		iLen = this.showCount();
		aImg = this._images;
		aPaging = this.makePaging();
		iMax = this.max();

		if (this._rdir === READING_DIRECTION_R2L){
			aPaging = aPaging.reverse();
		}

		while(++i < iLen){
			iPage = aPaging[i];

			if (iPage <= iMax){
				aImg[i].setSrc( sPath + fnPad( iPage, 3 ) + this._ext );
			}
			else {
				/**
				※참고
				empty는 image component에 setEmptySrc 로 값을 설정하지 않으면
				onloaded 이벤트가 발생되지 않는다.
				*/
				aImg[i].empty();
			}
		}
	};

	cp.sourcePath = function(path){
		var i
		, iLen
		;

		if (path === undefined){
			return this._sourcePath;
		}

		i = -1;
		iLen = this._images.length;

		this._sourcePath = path;
		this.page(1);

		return this;
	};

	cp.batchSetMethod = function(name, value){
		var aImg = this._images
		, i = -1
		, iLen = aImg.length
		;

		while(++i < iLen){
			aImg[i][name](value);
		}
	};

	cp.altSrc = function(path){
		this.batchSetMethod("setAltSrc", path);

		return this;
	};
	cp.emptySrc = function(path){
		this.batchSetMethod("setEmptySrc", path);

		return this;
	};

	cp.page = function(page){
		var iPage = 0;

		if (page === undefined){
			return this._page;
		}

		if (this.isLoaded === false){
			return this;
		}

		iPage = this.checkPage(page);

		if (iPage < 1){
			return this;
		}

		this._page = iPage;

		this.onPageChange(iPage);

		return this;
	};

	cp.goTo = function(page){
		this.page(parseInt(page)).load();
	};
	/*
	특정 페이지 번호를 실제 쓰일 수 있는 유효한 값으로 바꾼다.
	원래 다중 이미지에 대한 첫번째 페이지 값을 되돌려 주려고 했는데
	수학이 필요하고 시간이 오래걸려서
	그냥 최대 2페이지라 가정하고 만듬.
	*/
	cp.checkPage = function(page){
		var iBeforeVal = this._page
		, iCurrVal = parseInt(page || 1)
		, iChanged = 0
		, iCount = this.showCount()
		, iMax = this.max()
		;

		if (iCurrVal < 1){
			iCurrVal = 1;
			this._throwError(205);
		}
		else if (iCurrVal > this.max()){
			iCurrVal = this.max();
			this._throwError(206);
		}

		if (iCount === 1){
			return iCurrVal;
		}

		if (iCurrVal % 2 === 0){
			return iCurrVal - 1;
		}

		return iCurrVal;
	};

	cp.max = function(max){
		if (max === undefined){
			return this._max;
		}
		try{
			this._max = parseInt(max || this._max);
		}
		catch(e){
			this._throwError(204, e);
		}
		
		return this;
	};

	cp.readDir = function(_rdir){
		var rdir = 0
		, i_rdir = 0
		;

		if (_rdir === undefined){
			return this._rdir;
		}

		i_rdir = parseInt(_rdir);

		if (i_rdir === READING_DIRECTION_L2R || 
			i_rdir === READING_DIRECTION_R2L){
			rdir = i_rdir;
		}
		else{
			// 잘못된 값이 왔더라도 기본 왼쪽->오른쪽 값을 설정.
			rdir = READING_DIRECTION_L2R;
		}

		if (this._rdir !== rdir){
			this._rdir = rdir;
		}

		return this;
	};
	
	cp.showCount = function(count){
		var i = 0
		, aImg
		, iLen
		, iBeforeCount
		, iPage
		, iCount
		;

		if (count === undefined){
			return this._showCount;
		}

		iCount = parseInt(count);

		if (iCount < 1){
			iCount = 1;
		}
		else if (iCount > 2){
			iCount = 2;
		}

		aImg = this._images;
		iLen = aImg.length;
		iBeforeCount = this._showCount;
		iPage = this.page();

		while(i < iCount){
			aImg[i].show();
			i++;
		}
		while(i < iLen){
			aImg[i].hide();
			aImg[i].empty();
			i++;
		}

		this._showCount = iCount;

		this.goTo(iPage);
	};

	cp.prev = function(){
		var iPage = this.page()
		, iPrev
		;

		iPrev = iPage - this.showCount();

		if (iPrev < 1){
			iPrev = 1;
			this.onFirst(1);

			return;
		}

		this.page(iPrev).load();
	};
	cp.next = function(){
		var iPage = this.page()
		, iNext
		, iShowCount = this.showCount()
		, iMax = this.max()
		;

		iNext = iPage + iShowCount;

		if (iNext > iMax){
			if (iShowCount > 1){
				iNext = iMax - ((iMax + 1) % iShowCount);
			}
			else{
				iNext = iMax;
			}
			this.onLast(iMax);

			return;
		}

		this.page(iNext).load();
	};

	cp.sumImageProp = function(prop, single){
		var i = -1
		, aImg = this._images
		, iLen = this.showCount()
		, iVal = 0
		;

		if (single){
			return aImg[0][prop]()
		}

		while(++i < iLen){
			iVal = iVal + aImg[i][prop]();
		}

		return iVal;
	};

	cp.checkImagesProp = function(prop){
		var i = -1
		, aImg = this._images
		, iLen = aImg.length
		, bStatus = true
		;

		while(++i < iLen){
			bStatus = bStatus && aImg[i][prop];
		}

		return bStatus;
	};
	//@override
	cp.onready = function(){
		ImageComponent.prototype.onready.apply(this, arguments);

		this.onReadyImages();

		return this;
	};
	cp.onReadyImages = function(){
		var bReady = this.checkImagesProp("isReady")
		;

		this.isReady = bReady;

		if (bReady){
			this.load();
			this.onReady(this);
		}
	};
	cp.onLoadedImages = function(){
		var bLoaded = this.checkImagesProp("isLoaded")
		;

		if ((this.isLoaded !== bLoaded) && bLoaded){
			this.isLoaded = bLoaded;
			//console.log("onLoadedImages", ++window.__cnt, (new Date()).getSeconds());
			this.onLoaded(this);
		}
	};
	cp.onFailImages = function(e, img){
		var iCode
		, mFailCodes = {1:1,2:1,40:1}
		;

		this.isLoaded = true;

		if (e){
			iCode = e.code;

			if (mFailCodes[iCode]){
				if (iCode === 2){
					img.empty();
				}
				this.onImageLoadFail({
					path: this.sourcePath(),
					page: this.page(),
					max: this.max(),
					show: this.showCount()
				});
			}
			else{
				this.onFail(e);
			}
		}
	};

	BaseComponent.regEvent(cp, 
		/**
		페이지 값이 변경되었을 때 수행 된다.
		가령 잘못된 페이지 값이 설정되고 이를 바로잡은 값이 필요하다면
		사용 한다.
		*/
		"onPageChange", 
		//이전으로 갔을 때 더이상 이전 페이지가 없을 때 발생.
		"onFirst", 
		// 다음을 수행했을 때 더이상 다음 페이지가 없을 때 발생.
		"onLast",
		// 특정 페이지에 대한 이미지를 불러오는데 실패
		"onImageLoadFail", 
		// 특정 페이지를 불러올 때 수행.
		"onLoading");

	ImagePageComponent.parseZOder = function(zorder){
		var iZOrder = parseInt(zorder)
		;

		if (iZOrder === 1){
			return READING_DIRECTION_R2L;
		}

		return READING_DIRECTION_L2R;
	};

	return ImagePageComponent;
});
;define("factory.component.image", ["jquery", "util", "component.image.html5", "component.image.flash"], 
	function($, util, Html5ImageComponent, FlashImageComponent){
	var hasBlob = !!window.Blob 
	;

	return function(elem){
		//if (util.isIE() && util.IEVersion < 10){
		if (!hasBlob){
			return new FlashImageComponent(elem);
		}
		
		return new Html5ImageComponent(elem);
	};
});
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
;define("viewmodel.adultverify", 
	["jquery", "knockout", "service", "util", "viewmodel.base"], 
	function($, ko, service, util, BaseViewModel, undefined){
	
	// Class Definition
	var ViewModel = function(){
		// properties
		this.loading = util.noop;

		

		// Adult Verify Promise
		this._resolve = null;
		this._reject = null;

		// event methods
		// this.onSubmit = function(event){
		// 	alert("submit");

		// 	return false;
		// };
		// this.onPosterError = function(item, event){
		// 	//event.stopPropagation();
		// 	event.currentTarget.src = "css/img/no_poster.jpg";
		// };
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
			section: "#form_adultVerify"
		};
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);

		this.loading = service("loading")( this.section + "+.loading" );

		return this;
	};

	cp.destroy = function(){
		if (this.loading){
			this.loading.destroy( this.DOMSection );
		}

		this.unbindCallbackOnVerify();

		// super class destroy method call
		BaseViewModel.prototype.destroy.call(this);
	};

	cp.validate = function(item){
		var mRet = util.valid(item, [
			{
				name: "name",
				msg: "이름은 한글로 최소 두글자 이상 입력 하십시오.",
				regex: /^[가-힣]{2,}$/
			}
			,{
				name: "birth",
				msg: "생년월일은 숫자 8자리로 입력 하십시오.",
				regex: /^\d{8}$/
			}
			,{
				name: "telnum",
				msg: "핸드폰 번호는 010, 011, 016, 017, 018, 019 로 시작하며 최소 9자리, 최대 11자리의 숫자로만 작성 하십시오.",
				regex: /^01[0-9]\d{6,8}$/
			}
		])
		;

		return mRet;
	};

	cp.promise = function(){
		var self = this;
		// if (this._promise === undefined){
		// 	this._promise = util.promise();
		// }
		
		return util.promise(function(resolve, reject){
			self._resolve = resolve;
			self._reject = reject;
		});
	};

	cp.execResolve = function(){
		if ($.isFunction(this._resolve)){
			this._resolve.apply(this, arguments);
		}
	};
	cp.execReject = function(){
		if ($.isFunction(this._reject)){
			this._reject.apply(this, arguments);
		}
	}

	// route callback methods
	cp.routecallback = function(ctx){
		var self = this
		,	mParam = ctx.params
		,	mValid = this.validate(mParam)
		;

		//console.log(ctx);
		if (mValid.valid === false){
			alert(mValid.msg);

			this.jqSection.find("input[name='" + mValid.name + "']").focus();

			return false;
		}

		//util.debug.log("post - 성인인증");


		self.loading();

		service("backend")("post", "/exec/adult_verify.php", ctx.params)
		.done(function(res){
			if (!res || !res.result){
				self.execReject(res, "원격 인증 서버로부터 잘못된 응답이 전송 되었습니다.\n응답 데이터 형식이 맞지 않거나 응답 내용이 비어 있습니다.");

				return;
			}

			if (res.result.valid){
				self.execResolve(res.data, res.result.msg);
			}
			else{
				self.execReject(res.data, res.result.msg);
			}
		})
		.fail(function(res){
			self.execReject(res, "원격 인증 서버가 정상적으로 동작하지 않거나 존재하지 않습니다.\n인터넷 연결 상태나 인증서버 상태를 확인 하시길 바랍니다.");
		})
		.always(function(){
			self.loading(false);
		});
	};

	// event methods
	cp.onapply = function(){

	};

	return ViewModel;
});
;define("viewmodel.base", 
	["jquery", "knockout", "service", "util"], 
	function($, ko, service, util, undefined){
	
	// Class Definition
	var ViewModel = function(){
		this.binded = false;
		},
		// Class Prototype
		cp = ViewModel.prototype
	;

	// properties
	cp.jqSection = null;
	cp.DOMSection = null;
	cp.section = "";

	// methods
	cp.init = function(opt){
		var mOpt,
			elemSection,
			jqSection,
			key
		;

		if (this.jqSection){
			return this;
		}

		if (!opt){
			mOpt = {
				section: "#viewmodel_section"
			};
		}
		else{
			mOpt = opt;
		}

		jqSection = $( mOpt.section );

		this.jqSection = jqSection;
		this.DOMSection = jqSection[0];

		for (key in mOpt){
			this[ key ] = mOpt[ key ];
		}

		jqSection.unload( this.destroy );

		return this;
	};

	cp.destroy = function(){
		ko.cleanNode( this.DOMSection );

		if (this.jqSection){
			this.jqSection.remove();
			this.jqSection = undefined;
		}
		if (this.DOMSection){
			this.DOMSection = undefined;
		}
		if (this.section){
			this.section = undefined;
		}
	};

	cp.apply = function(){
		if (this.binded || !this.DOMSection){
			return;
		}

		ko.applyBindings( this, this.DOMSection );

		this.binded = true;

		return this;
	};

	cp.applyActionPrevent = function(use){
		if (use === true){
			$("body")
			.on("contextmenu", util.noop)
			.on("selectstart", util.noop)
			.on("dragstart", util.noopstop)
			;
		}
	};

	cp.altPropByAttr = function(dataAttr){
		var sDataAttr = this.jqSection.data( dataAttr.toLowerCase() );

		if (sDataAttr){
			this[ dataAttr ] = sDataAttr;
		}
	};

	cp._findMsg = function(msg){
		if ($.isNumeric(msg)){
			return service("error.msg")[msg];
		}
		
		return msg;
	}

	cp.alertMsg = function(msg, errorObj){
		if (msg instanceof Object || msg instanceof Error){
			// 예상치 못한 알 수 없는 오류.
			// 객체인 msg 값을 서버로 보내도록 한다.
			return this.msgbox(99999, false, msg);
		}
		
		return this.msgbox(msg, false, errorObj);
	};
	cp.confirmMsg = function(msg, errorObj){
		return this.msgbox(msg, true, errorObj);
	};
	cp.msgbox = function(msg, useConfirm, errorObj){
		var sMsg = this._findMsg(msg);

		if (errorObj){
			this.sendError(msg, errorObj);
		}
		return util.promise(function(resolve, reject){
			if (useConfirm){
				if (confirm(sMsg)){
					resolve(1);
				}
				else{
					reject(0);
				}
			}
			else{
				alert(sMsg);
				resolve(0);
			}
		});
	};
	// 원격 서버에 오류 내용을 전달하여 A/S 대비.
	cp.sendError = function(errorCode, errorObj){
		//alert(errorCode + "\n" + util.disassemble(errorObj));
	};

	// route callback methods

	// event methods
	cp.onapply = util.noop;

	return ViewModel;
});
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
;define("viewmodel.comicviewer", 
	["jquery", "knockout", "service", "util", "viewmodel", "viewmodel.base", "component.imagepage"], 
	function($, ko, service, util, viewmodel, BaseViewModel, ImagePageComponent, undefined){

	//Class Definition
	var ViewModel = function(){
		var self = this;
		// Property
		this._sourcePath = "";
		this._info;
		this._maxCountAvailable = false;
		this._failCount = 0;
		this._maxFailCount = 2;
		// Auto Read Timeout Serial - 자동 넘기기 timeout 번호
		this._arts = 0;
		
		// Auto Send Bill Timeout - 자동 빌로그 넘기기 timeout 번호
		this._asbt = 0;
		// 자동 빌로그 넘기는 시간 (초)
		this._asbintv = 0;
		
		// Time To Change To Absent - 부재중인지 확인하는 timeout 번호
		this._ttctat = 0;
		// 부재중으로 바뀌는 시간(초)
		this._ttcta = 0;
		// 부재중 여부
		this._absent = false;

		this._bookSerial = "";

		this.title = ko.observable("");
		this.author = ko.observable("");
		this.each_books = ko.observableArray([]);
		this.bookno = ko.observable(1);
		this.type = ko.observable("");
		this.page = ko.observable(1);
		this.max = ko.observable(1);
		this.autoRead = ko.observable(0);
		this.autoBook = ko.observable(false);
		this.viewMode = ko.observable(0);
		this.readDir = ko.observable(0);
		this.disable = ko.observable(false);

		this.imgPage = null;
		this.loading = null;

		// this.imgPage.sourcePath("http://contents1.newkey.co.kr/comic/lucky/gohangsuk/gohangsuk_8/13/")
		// .max(124).page(4).load();

		// 북번호가 바뀌면 윈도 타이틀 내용도 바꾼다.
		this.bookno.subscribe(function(newVal){
			this.applyWindowTitle();
		}, this);

		// 몇가지 UI에 대하여 사용 금지를 하게끔 한다.
		this.preventAction = ko.pureComputed(function(){
			return this.disable() || (this.autoRead() > 0);
		}, this);
		
		this.bookOptText = function(item){
			return item.bookno + ((parseInt(item.state) === 1)? "권" : "회");
		};

		// ViewModel Event Method [시작]
		// 다른 권 보기
		this.onBookSelect = function(vm, e, item){
			self.stopAutoNext();
			self.load();
		};
		
		this.onGotoPageFocus = function(vm, event){
			self.refreshAbsent();
			event.currentTarget.select();
		};
		this.onGotoClick = function(){
			$("#form_comicViewerCtrl").submit();

			return false;
		};
		// 자동 넘기기
		this.onAutoReadChange = function(){
			var iAutoRead = parseInt(self.autoRead() || 0);

			self.stopAutoNext();

			if (!iAutoRead){
				self.applyAutoRead(false);
			}
			else{
				self.applyAutoRead(true);
			}
		};
		// 보기 모드
		this.onViewModeChange = function(){
			var viewMode = self.viewMode();

			self.refreshAbsent();
			self.applyAutoRead(0);
			self.imgPage.showCount( viewMode );
			//self.setPageCoverCount( viewMode );
		};
		// 넘기기 방향
		this.onReadDirChange = function(){
			self.refreshAbsent();
			self.imgPage.readDir( self.readDir() ).load();
		};
		// 이전
		this.onPrevClick = function(){
			var me = self;

			if (me.preventAction()){
				return;
			}
			if (me.readDir() == 0){
				me.imgPage.prev();
			}
			else{
				me.imgPage.next();
			}
			/*
			만약 일본만화 (왼쪽<--오른쪽) 보는데 
			오른쪽이 다음 버튼이 되길 원한다면
			아래 주석을 지우고 윗 내용을 지우거나 주석 처리 한다.
			*/
			//me.imgPage.prev();

			me.refreshAbsent();
			
		};
		// 다음
		this.onNextClick = function(){
			var me = self;

			if (me.preventAction()){
				return;
			}
			if (me.readDir() == 0){
				me.imgPage.next();
			}
			else{
				me.imgPage.prev();
			}
			/*
			만약 일본만화 (왼쪽<--오른쪽) 보는데 
			오른쪽이 다음 버튼이 되길 원한다면
			아래 주석을 지우고 윗 내용을 지우거나 주석 처리 한다.
			*/
			//me.imgPage.next();

			me.refreshAbsent();
		};
		this.onKeyup = function(e){
			var tagName;

			e.preventDefault();

			if (e && e.target){
				tagName = e.target.tagName;
				tagName = tagName.toLowerCase();

				if (tagName === "input"){
					return;
				}
			}

			self.refreshAbsent();

			if (e.keyCode === 37){
				self.onPrevClick();

				return false;
			}
			else if (e.keyCode === 39){
				self.onNextClick();

				return false;
			}
		};
		// 부재중이 되었을 때 수행됨
		this.onAbsent = function(self){
			// 최근 내용을 마지막으로 한번 전달 하고 자동 빌로그 쌓기는 중지 한다.
			self.sendBill(false);
		};
		// ViewModel Event Method [종료]

	}
	, cp
	;

	cp = ViewModel.prototype = new BaseViewModel();
	cp.constructor = ViewModel;

	cp.init = function(opt){
		var mOpt = {
			section: "#comicviewer",
			pageSection: "bookImg"
		}
		, imgPage
		;

		mOpt = $.extend(mOpt, opt);

		BaseViewModel.prototype.init.call(this, mOpt);

		this._contentsDomain = mOpt.contentsDomain;

		if (mOpt.info.serial){
			this._info = mOpt.info;
			this.initProp(this._info);
			this.initComponent(mOpt);
			this.initEvent(mOpt);
		}
		else{
			this.disable(true);
		}

		this.applyActionPrevent( mOpt.actionPrevent );

		return this;
	};

	cp.initProp = function(info){
		var iReadDir = ImagePageComponent.parseZOder(info.zorder);

		this.type(info.type);
		this.title(info.title);
		this.author(info.am_name);
		this.bookno(parseInt(info.bookno || 1));
		this.each_books(info.each_books);
		this.readDir(iReadDir);
		this._maxFailCount = info.maxFailCount || 4;
		this._asbintv = info.send_bill_interval || 60; // 기본값 60초
		this._ttcta = info.time_to_absent || 20; // 기본값 20초
	};

	cp.initComponent = function(mOpt){
		var imgPage = new ImagePageComponent(mOpt.pageSection);

		this.imgPage = imgPage;
		this.loading = service("loading")(mOpt.section + " .loading");
		this.loading(true);

		imgPage
		.altSrc(mOpt.altImg)
		.emptySrc(mOpt.emptyImg)
		.onready(this.onReady, this)
		.onloaded(this.onLoaded, this)
		.onpagechange(this.onPageChange, this)
		.onfirst(this.onFirst, this)
		.onlast(this.onLast, this)
		.onimageloadfail(this.onImageLoadFail, this)
		.onfail(this.onImageFail, this)
		.onloading(this.onLoading, this)
		.build()
		;
	};

	cp.initEvent = function(mOpt){
		$("body").keyup(this.onKeyup);
	};

	cp.applyWindowTitle = function(){
		if (!this._info){
			return;
		}
		document.title = this.title() + " [" + this.bookno() + "] - " + this.author();
	};

	// 이미지 컴포넌트 이벤트 [시작]
	cp.onReady = function(){
		this.sourcePath(this._contentsDomain + this._info.contents_server_path);
		this.load();
	};
	cp.onLoaded = function(){
		var iPage = parseInt(this.page())
		;

		this._failCount = 0;
		this.loading(false);

		if (this.autoRead() > 0){
			this.autoNext();
		}
		// 첫페이지를 본다면 처음 본다는 내용을 서버에 같이 전달
		if (iPage <= 1){
			this.sendBill(true);
		}
		// 마지막 페이지를 보게 된다면 다 봤다는 내용을 서버에 전달
		else if ((iPage + 1) >= this.max()){
			this.sendBill(false);
		}
	};
	cp.onPageChange = function(fixedPage){
		this.page(fixedPage);
	};
	cp.onFirst = function(){
		this.alertMsg(120);
		this.onLoaded();
	};
	cp.onLast = function(){
		var self = this;

		try{
			// 마지막권일 경우 자동/수동 관계 없이 메시지 출력
			if (this.isLastBook()){
				this.applyAutoRead(0);
				this.alertMsg(129);
			}
			// 마지막권은 아니고 자동이면 그냥 다음권 수행
			else if (this.autoBook() && (this.autoRead() > 0)){
				this.autoNextBook();
			}
			// 마지막권이 아니고 수동일 경우 물어보고 진행
			else{
				this.stopAutoNext();
				this.confirmMsg(122)
				// 예
				.done(function(){
					self.autoNextBook();
				})
				// 아니오
				.fail(function(){
					self.autoRead(0);
				});

				return;
			}
		}
		// 마지막권인지 확인 중 내용이 수상하다면 catch 하여 메시지 출력
		catch(e){
			this.alertMsg(e.errorCode, e);
		}

		this.onLoaded();
	};
	cp.onImageLoadFail = function(error){
		var self = this;

		this._failCount++;
		this.loading(false);
		// 최대 개수를 못읽어서 유효하지 않다면
		if (this._maxCountAvailable === false){
			// 그런데 페이지도 갓 시작했다.
			if (this.page() <= 2){
				if (this._failCount > 1){
					setTimeout(function(){
						self.alertMsg(111, true);
					}, 200);
					this.disable(true);
					this.autoRead(0);
					this.autoBook(false);
					this.stopAutoSendBill();
				}
			}

			return;
		}
		
		if (this._failCount >= this._maxFailCount){
			setTimeout(function(){
				this.alertMsg(112, true);
			}, 200);
			this.disable(true);
			this.autoRead(0);
			this.autoBook(false);
			this.stopAutoSendBill();
		}
		else{
			this.onLoaded();
		}
	};
	cp.onImageFail = function(error){
		// 너무 자주 뜨면 사용자가 짜증(...)을 낼 수 있으므로 오류를 서버로 보냄.
		this.sendError(error.code, error);
	};
	cp.onLoading = function(){
		this.loading(true);
	};
	// 이미지 컴포넌트 이벤트 [종료]

	cp.load = function(){
		var self = this;

		this.disable(false);

		this.imgPage.sourcePath( this.getSourcePathWithBookNo() );
		this.loadCount()
		.done(function(max){
			self._absent = false;
			self._maxCountAvailable = true;
			self.setMaxAndImageload(max);
			self.refreshAbsent();
		})
		.fail(function(errorCode){
			self._maxCountAvailable = false;
			self.alertMsg(errorCode);
			self.setMaxAndImageload(200);
		});

		
	};

	cp.loadCount = function(){
		var self = this
		, mInfo = this._info
		, type = mInfo.type
		, serial = mInfo.serial
		, bookno = this.bookno()
		;

		return util.promise(function(resolve, reject){
			var key = type + "_" + serial + "_" + bookno
			, sCount = util.cookie.get(key)
			, promise = util.promise()
			, path
			;

			if (!sCount){
				path = self.getSourcePathWithBookNo() + "index.xml";

				service("backend")
				("xml", path)
				.done(function(xml){
					var iCount = self.parseMaxCountByXml(xml);

					if (iCount === NaN || !$.isNumeric(iCount)){
						reject(102);

						return;
					}

					// 가져온 카운트값은 30일간 쿠키로 보관
					util.cookie.set(key, iCount, (24 * 30));

					resolve( iCount );
				})
				.fail(function(e){
					reject(100);
				});
			}
			else{
				resolve( parseInt(sCount) );
			}
		});
	};

	

	cp.sourcePath = function(path){
		if (path === undefined){
			return this._sourcePath;
		}

		if (path && (path.substr(path.length - 1, 1) === "/")){
			path = path.substr(0, path.length - 1);
		}

		this._sourcePath = path;

		// 간혹 뒷부분에 / 가 빠져 있는 경우가 있다.
		// if (path && (path.charAt(path.length - 1) === "/")){
		// 	this._sourcePath = path;
		// }
		// else{
		// 	this._sourcePath = path + "/";
		// }
	};
	cp.getSourcePathWithBookNo = function(){
		return this.sourcePath() + "/" + this.bookno() + "/";
	};

	cp.parseMaxCountByXml = function(xml){
		var jqXml = $(xml)
		, jqCount = jqXml.find("count")
		, sCount = jqCount.text()
		, iCount = parseInt( sCount )
		;

		return iCount;
	};

	cp.setMaxAndImageload = function(max){
		this.max(max);
		this.imgPage.max(max).load();
	};

	/**
	자동 넘기기 적용.
	@param
	use = [true|false|number]
		true면 자동 넘기기 적용.
		false면 자동 넘기기를 중단.
		숫자로 넣으면 그 값을 autoRead Property에 설정하며 0이면 중단, 1이상이면 적용.
	*/
	cp.applyAutoRead = function(use){
		var bRefreshAbsentAwaken = true
		;
		if (use === true){
			this.autoNext();
			
		}
		else{
			if ($.isNumeric(use)){
				this.autoRead(parseInt(use));
			}

			if (!use){
				this.stopAutoNext();
				bRefreshAbsentAwaken = false;
			}
			else{
				this.autoNext();
			}
		}

		if (bRefreshAbsentAwaken){
			// 자동 넘기기 할 때는 부재중 시간을 체크하지 않는다.
			this.refreshAbsent(true);
		}
		else{
			// 사용 안하게 된다면 다시 부재중 시간을 체크 한다.
			this.refreshAbsent();
		}
	};

	/**
	자동 넘기기 값을 확인하고 
	유효하면 그 값을 이용하여 자동 넘기기 1번을 수행 한다.
	*/
	cp.autoNext = function(){
		var self = this
		, iSec = parseInt(this.autoRead());
		;

		if (!iSec){
			
			return;
		}
		else{
			
		}

		this.stopAutoNext();
		// Auto Read Timeout Serial
		this._arts = setTimeout(function(){
			self.imgPage.next()
		}, iSec * 1000);
	};
	cp.autoNextBook = function(){
		this.stopAutoNext();
		this.bookno(this.getNextBook());
		//this.load();
	};
	cp.stopAutoNext = function(){
		if (this._arts){
			clearTimeout(this._arts);
			this._arts = 0;
		}
	};
	cp.isLastBook = function(){
		var iBookno = parseInt(this.bookno())
		, aEachBooks = this.each_books()
		, iBookLen
		, iLastBookno
		;

		if (aEachBooks){
			iBookLen = aEachBooks.length;
			iLastBookno = parseInt( aEachBooks[ iBookLen - 1 ].bookno );
		}
		else{
			iBookLen = 0;
			iLastBookno = 0;
		}

		if (!iBookno && !iLastBookno){
			throw {errorCode: 130, bookno: iBookno, lastBookno: iLastBookno, bookLen: iBookLen};
		}

		return iBookno >= iLastBookno;
	};
	cp.getNextBook = function(){
		var iBookno = parseInt(this.bookno())
		, aEachBooks = this.each_books()
		, i = -1
		, iLen = (aEachBooks)? aEachBooks.length : 0
		, iItemBookno = 0
		, bDetected = false;
		;

		while(++i < iLen){
			iItemBookno = parseInt(aEachBooks[i].bookno);

			if (bDetected){
				return iItemBookno;
			}

			if (iItemBookno === iBookno){
				bDetected = true;
			}
		}

		return 0;
	};

	/**
	사용자의 이용 현황을 서버로 전달한다.
	관련 내용은 서버에서 bill log 로 기록 한다.
	*/
	cp.sendBill = function(isFirst){
		var self = this
		, iTimeoutCode = 0
		, iFirst = 0
		;

		if (isFirst === true){
			this._bookSerial = this.getBookSerial();
			iFirst = 1;
		}

		this.stopAutoSendBill();

		service("backend")
		("/exec/comic_bill.php",{
			serial: this._info.serial,
			book_serial: this._bookSerial,
			type: this.type(),
			first: iFirst,
			absent: this._absent ? 1 : 0
		})
		.done(function(res){
			if (isFirst === false){
				return;
			}
			self.autoSendBill();
		})
		.fail(function(){
			self.disable(true);
			self.alertMsg(140, true);
		});
	};
	cp.autoSendBill = function(){
		var self = this;

		this.stopAutoSendBill();

		this._asbt = setTimeout(function(){
			self.sendBill();
		}, this._asbintv * 1000);
	};
	cp.stopAutoSendBill = function(){
		if (this._asbt){
			clearTimeout(this._asbt);
		}
	};
	
	cp.getBookSerial = function(){
		var bookno = this.bookno()
		, aEachBooks = this.each_books()
		, i = -1
		, iLen = aEachBooks.length
		, mBook
		;

		while(++i < iLen){
			mBook = aEachBooks[i];

			if (mBook.bookno == bookno){
				return mBook.book_serial;
			}
		}

		return -1;
	};

	cp.refreshAbsent = function(alwaysAwaken){
		var self = this;

		if (this._ttctat){
			clearTimeout(this._ttctat);
		}

		// 기존에 부재중이었다면 빌로그를 처음부터 다시 쌓는다.
		if (this._absent){
			this._absent = false;
			this.sendBill(true);
		}

		// true일 경우 부재중 확인을 수행하지 않는다.
		if (alwaysAwaken){
			return;
		}

		this._ttctat = setTimeout(function(){
			self._absent = true;
			self.onAbsent(self);
		}, this._ttcta * 1000);
	};

	// route callback methods
	// 페이지 이동
	cp.routecallback = function(ctx){
		var sPage
		, iPage
		;
		try{
			sPage = ctx.params.page;

			if (sPage && $.isNumeric(sPage)){
				this.imgPage.goTo( parseInt( sPage ) );
			}
			else{
				throw "page is not number";
			}
		}
		catch(e){
			this.alertMsg(7);
			this.page( this.imgPage.page() );
		}
	};

	return ViewModel;
});
;define("viewmodel.coupon", 
	["jquery", "knockout", "service", "util", "config", "viewmodel", "viewmodel.base"],
	function($, ko, service, util, config, viewmodel, BaseViewModel){

	var ViewModel = function(){
		var self = this;

		this.detail = ko.observable();
		this.purchaseUrl = ko.observable("");
		this.bannerUrl = ko.observable( config.couponTopBanner );
		this.num0 = ko.observable("");
		this.num1 = ko.observable("");
		this.num2 = ko.observable("");
		this.num3 = ko.observable("");

		this.detail.subscribe(function(val){
			var custInfo = config.custInfo
			, custId = ""
			, custSvcId = ""
			, serviceType = ""
			, name = ""
			, mac = ""
			, mParam = $.extend({}, this._reqInfo)
			;

			mParam.contentId = val.content_id;

			this.purchaseUrl(
				"/exec/view/purchase_trigger.php?" + util.objectToParameter(mParam)
			);
		}, this, "change");

		this._reqInfo = undefined;
		this._resolve = null;
		this._couponHist = {};

		this.modalAPI = undefined;

		// event
		this.cancel = function(){
			self.modalAPI.hide();

			return false;
		};
		this.onChange = function(vm, event){
			var val = event.target.value
			, jqInputList
			, iKeyCode = event.keyCode || event.which
			;

			//console.log(event.keyCode, event.which, event.shiftKey);

			if ((iKeyCode === 9 && event.shiftKey) || 
				(iKeyCode === 9) ||
				(iKeyCode === 16) || 
				(iKeyCode === 39) ||
				(iKeyCode === 37)){
			}
			else if (val && val.length === 4){
				jqInputList = $(event.target).nextAll("input");

				if (jqInputList.length > 0){
					jqInputList[0].focus();
				}
			}
		};

		this.submit = function(e){
			self.jqSection.find("form").submit();

			return false;
		};
	}
	, cp
	;
	
	// Class extends
	cp = ViewModel.prototype = new BaseViewModel();
	cp.constructor = ViewModel;

	// methods
	cp.init = function(opt){
		var self = this
		, mOpt = {
			section: "#modal_coupon"
		}
		;

		mOpt = $.extend(mOpt, opt);
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);
		this.loading = service("loading")( this.section + " .loading" );
		this.modalAPI = service("modal")( this.section );

		this.initCustInfo();

		return this;
	};

	cp.initCustInfo = function(){
		var custInfo = config.custInfo
		, custId = ""
		, custSvcId = ""
		, serviceType = ""
		, name = ""
		, mac = ""
		, mInfo
		;

		if (custInfo){
			custId = custInfo.id_cust;
			custSvcId = custInfo.id_cust_svc;
			serviceType = custInfo.service_type;
			mac = custInfo.mac;
			name = custInfo.name;
		}

		mInfo = {
			mac: mac,
			custId: custId,
			custSvcId: custSvcId,
			contentId: "",
			serviceType: serviceType,
			name: name
		};

		this._reqInfo = mInfo;
	};

	cp.promise = function(item){
		var self = this;

		if (!item){
			return util.promise(function(res, rej){
				rej({msg: "요청 컨텐츠 정보가 없습니다."});
			});
		}

		this.getModal()
		.clear()
		.show();

		this.detail( item );

		return util.promise(function(resolve, reject){
			self._resolve = resolve;
		});
	};

	cp.getModal = function(){
		return this.modalAPI;
	};

	// @Override
	cp.destroy = function(){
		BaseViewModel.prototype.destroy.call(this);

		if (this.modalAPI){
			this.modalAPI.destroy();
			this.modalAPI = undefined;
		}
	};

	cp.execResolve = function(info){
		if ($.isFunction( this._resolve )){
			this.getModal().hide();
			this._resolve(info);
		}
	};
	cp.execReject = function(err){
		alert(err.msg);
	};

	cp.validate = function(item){
		var aValid = []
		, i = 0
		;

		for(;i < 4; i++){
			aValid.push({
				name: "coupon" + i,
				msg: "쿠폰 코드는 16자리 입니다.",
				regex: /^\d{4}$/
			});
		}

		return util.valid(item, aValid);
	};

	cp.mergeCouponCode = function(params){
		var aCode = []
		, i = 0
		;

		while(i < 4){
			aCode.push( params["coupon" + i] );
			i++;
		}

		return aCode.join("");
	};

	cp.checkCouponHist = function(sCode){
		var sResult
		;

		sResult = this._couponHist[sCode];

		if (sResult){
			return true;
		}

		return false;
	};
	

	cp.routecallback = function(ctx){
		var self = this
		, mParam = $.extend( {}, this._reqInfo, util.copyByOwnProp(ctx.params))
		, mValid = this.validate(mParam)
		, nowLoading = false
		, sCouponCode = this.mergeCouponCode(mParam)
		;

		if (mValid.valid === false){
			alert(mValid.msg);

			this.jqSection.find("input[name='" + mValid.name + "']").focus();

			return false;
		}

		if (this.checkCouponHist(sCouponCode)){
			alert("이미 등록 시도 했던 쿠폰 입니다.");
			return false;
		}

		this.loading();

		service("backend")("post", "/exec/purchase_coupon.php", mParam, true)
		.done(function(res){
			var info = res.info
			, result = res.result
			;

			if (info){
				if (info.confirm){
					if (confirm(res.result.msg)){
						ctx.params.confirmed = "Y";

						self.routecallback(ctx);

						return;
					}
				}
				else if (info){
					/*
					0000=성공
					0001=사용된 쿠폰
					0002=만기된 쿠폰
					0003=사용 정지 쿠폰
					0004=금액부족
					0009=미발급 쿠폰, 혹은 유효하지 않은 쿠폰
					9999=알 수 없는 오류
					*/
					self._couponHist[ sCouponCode ] = info;

					//alert(res.result.msg);

					if (info === "0000"){
						self.execResolve({
							code: info,
							msg: "결제에 성공 하였습니다."
						});
					}
					else{
						self.execReject({
							code: info,
							msg: result.msg
						});
					}
				}
			}
			else if (result && !result.valid){
				self.execReject(result);
			}

			self.loading(false);
		})
		.fail(function(res){
			self.execReject(res);
			self.loading(false);
		})
		.always(function(){
			
		});
	};

	cp.timeFmt = util.timeFormat;
	cp.textOverflow = util.textOverflow;

	return ViewModel;
});
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
;define("viewmodel.purchase", 
	["jquery", "knockout", "service", "util", "config", "viewmodel", "viewmodel.base"],
	function($, ko, service, util, config, viewmodel, BaseViewModel){

	var ViewModel = function(){
		var self = this;

		this.detail = ko.observable();
		this.purchaseUrl = ko.observable("");
		this.bannerUrl = ko.observable( config.purchaseBottomBanner );

		this.detail.subscribe(function(val){
			var custInfo = config.custInfo
			, custId = ""
			, custSvcId = ""
			, serviceType = ""
			, name = ""
			, mac = ""
			, mParam
			;

			if (custInfo){
				custId = custInfo.id_cust;
				custSvcId = custInfo.id_cust_svc;
				serviceType = custInfo.service_type;
				mac = custInfo.mac;
				name = custInfo.name;
			}

			mParam = {
				mac: mac,
				custId: custId,
				custSvcId: custSvcId,
				contentId: val.content_id,
				serviceType: serviceType,
				name: name
			};

			this.purchaseUrl(
				"/exec/view/purchase_trigger.php?" + util.objectToParameter(mParam)
			);
		}, this, "change");

		this._resolve = null;
		this._jqFrame = null;

		this.modalAPI = null;
		this.vmCoupon = null;

		// event
		this.cancel = function(){
			self.modalAPI.hide();

			return false;
		};
		this.coupon = function(){
			if (!self.vmCoupon){
				self.vmCoupon = viewmodel("coupon").init().apply();
			}

			//console.log("detail", self.detail() );
			self.vmCoupon.promise( self.detail() )
			.done(function(info){
				self.execResolve( info );
			})
			.fail(function(err){
				self.execReject(err);
			})
			;
		};
	}
	, cp
	;
	
	// Class extends
	cp = ViewModel.prototype = new BaseViewModel();
	cp.constructor = ViewModel;

	// methods
	cp.init = function(opt){
		var mOpt = {
			section: "#modal_purchase"
		}
		;

		mOpt = $.extend(mOpt, opt);
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);
		this.loading = service("loading")( this.section + "+.loading" );
		this.modalAPI = service("modal")( this.section );

		this.initFrame();

		return this;
	};

	cp.initFrame = function(){
		var self = this
		, jqFrame = this._jqFrame
		, regex = new RegExp("purchase_approval")
		;

		if (!jqFrame){
			jqFrame = $("iframe[name='frame_purchase']")

			if (jqFrame.length === 0){
				alert("구매 프레임이 설정되어 있지 않습니다.");

				return;
			}

			this._jqFrame = jqFrame;
		}

		

		// _jqFrame[0].onload = function(){
		// 	if (regex.test(_jqFrame[0].src)){
		// 		alert(_jqFrame[0].innerHTML);
		// 	}
		// };

		jqFrame.on("load", function(){
			var win = jqFrame[0].contentWindow
			, doc = win.document
			, txt = doc.body.innerHTML
			, mData
			, msg
			;

			try{
				if (!regex.test( win.location.href )){
					return;
				}
				mData = $.parseJSON(txt);

				if (!mData){
					throw {};
				}

				if (mData){
					if(mData.info === "0000" || mData.info === "0001"){
						self.execResolve({
							code: mData.info,
							msg: "결제에 성공 하였습니다."
						});
					}
					else if (mData.result.msg){
						alert(mData.result.msg);
					}
					else{
						throw {};
					}
				}
			}
			catch(e){
				alert("결제 진행 결과가 잘못 되었습니다.\n" + util.disassemble(e));

				return;
			}
		});	
	};

	cp.promise = function(item){
		var self = this;

		if (!item){
			return util.promise(function(res, rej){
				rej({msg: "요청 컨텐츠 정보가 없습니다."});
			});
		}

		this.getModal().show();
		this.detail(item);

		return util.promise(function(resolve, reject){
			self._resolve = resolve;
		});
	};

	cp.execResolve = function(info){
		if ($.isFunction(this._resolve)){
			this.getModal().hide();
			this._resolve(info);
		}
	};
	cp.execReject = function(err){
		alert(err.msg);
	};

	cp.getModal = function(){
		return this.modalAPI;
	};

	// @Override
	cp.destroy = function(){
		BaseViewModel.prototype.destroy.call(this);

		if (this.modalAPI){
			this.modalAPI.destroy();
			this.modalAPI = undefined;
		}
	};



	
	

	cp.routecallback = function(ctx){
		// var self = this;

		// self.loading();

		// service("backend")("post", "/exec/")
	};

	cp.timeFmt = util.timeFormat;
	cp.textOverflow = util.textOverflow;

	return ViewModel;
});
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
;define("main", ["jquery", "knockout", "config", "service.route", "viewmodel", "util"], 
	function($, ko, config, route, viewmodel, util, undefined){
		function runWebLauncher(mInfo){
			var iIdProd = 0
			,	args = {custId: mInfo.id_cust};
			;

			viewmodel("movielist").init(args).apply();
			viewmodel("moviedetail").init(args).apply();
			viewmodel("comiclist").init(args).apply();
			viewmodel("comicdetail").init(args).apply();
			viewmodel("comicmenu").init().apply();
			viewmodel("weblauncher").init({actionPrevent: true}).apply();

			if (mInfo && mInfo.svc_status == 20){
				iIdProd = parseInt(mInfo.id_prod, 2);

				if (iIdProd & 4){
					route("#/movie/1/0");
				}
				else{
					route("#/tv");
				}

				return;
			}

			$("#panel_err").show();
		}
		function runComicViewer(mComicInfo){
			var args = {
				altImg: config.comicAltImg,
				emptyImg: config.comicEmptyImg,
				contentsDomain: config.comicContentsDomain,
				actionPrevent: true,
				info: mComicInfo
			};

			viewmodel("comicviewer").init(args).apply();

			route("#/");

			if (!mComicInfo.serial){
				$("#panel_err").show();
				$(".flash-download").hide();
			}
		}
		function runPluginCheck(){
			viewmodel("plugincheck").init().apply();
		}

		$(function(){
			var mCustInfo = config.custInfo
			,	mComicInfo = config.comicInfo
			,	bPlugincheck = config.pluginCheck
			;

			if (mCustInfo){
				runWebLauncher(mCustInfo);
			}
			else if (mComicInfo){
				runComicViewer(mComicInfo);
			}
			else if (bPlugincheck){
				runPluginCheck();
			}
		});
	});

require(["main"]);