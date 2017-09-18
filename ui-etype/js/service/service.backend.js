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