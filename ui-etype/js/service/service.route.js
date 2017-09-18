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