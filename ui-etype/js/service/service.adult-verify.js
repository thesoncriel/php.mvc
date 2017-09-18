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