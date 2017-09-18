(function(angular, undefined){
	"use strict";
	
	var module = angular.module("ngAsyncform", []);
	
	// 비동기 캐시 기능
	module.service("asyncformCache", ["$cacheFactory", function($cacheFactory){
		var cache = $cacheFactory("__asyncform.cache");
		
		return {
			has: function(key){
				return cache.get(key) !== undefined;
			},
			remove: function(key){
				cache.remove(key);
			},
			put: function(key, value, timeSec){
				cache.put(key);
				
				if (timeSec !== undefined){
					setTimeout(function(){
						cache.remove(key);
					}, timeSec * 1000);
				}
			},
			get: function(key){
				return cache.get(key);
			},
			destroy: function(){
				cache.destroy();
			}
		};
	}]);

	// 
	module.service("asyncformStore", ["$q", "$cacheFactory", function($q, $cacheFactory){
		var cache = $cacheFactory("__asyncform.store")
		;
		
		this.load = function(name, callback){
			var form = cache.get(name)
			,	qDefer = $q.defer();

			if (angular.isFunction(callback)){
				qDefer.promise.then(callback);
			}

			if (form){
				setTimeout(function(){
					qDefer.resolve(form);
				}, 100);
			}
			else{
				cache.put("q_" + name, qDefer);
			}

			return qDefer.promise;
		};
		this.get = function(name){
			return cache.get(name);
		};
		this.put = function(name, form){
			var key = "q_" + name
			,	qDefer = cache.get(key)
			;

			cache.put(name, form);

			if (qDefer){
				qDefer.resolve(form);
				cache.remove(key);
			}
		};
		this.remove = function(name){
			cache.remove(name);
		};
		this.removeAll = function(){
			cache.removeAll();
		};
		this.destroy = function(){
			cache.destroy();
		};
	}]);

	module.service("asyncform", ["$q", "asyncformStore", function($q, store){
		var fnRet
		;

		fnRet = function(formName){
			var fnMsgboxCallback
			,	fnBeforeCallback
			,	fnDoneCallback
			,	fnFailCallback
			,	fnAlwaysCallback
			;

			function executeCallback(callback, args, executor){
				try{
					callback.apply(executor, args);
				}
				catch(e){}
			};

			function executeSubmit(form){
				form
				.before(function(){
					return executeCallback(fnBeforeCallback, [], form);
				})
				.done(function(data){
					executeCallback(fnDoneCallback, [data], form);
				})
				.fail(function(data){
					executeCallback(fnFailCallback, [data], form);
				})
				.always(function(){
					executeCallback(fnAlwaysCallback, [], form);
				})
				.msgbox(function(type, msg){
					return executeCallback(fnMsgboxCallback, [type, msg], form);
				})
				.submit();
			};

			return {
				submit: function(){
					// 이미 로드 되어 있다면 곧바로 수행
					var form = store.get(formName);

					if (form){
						executeSubmit(form);

						return;
					}
					// 없다면 로드 될 때까지 대기 한 후 수행
					store.load(formName)
					.then(function(form){
						executeSubmit(form);
					});

					return this;
				},

				msgbox: function(callback){
					fnMsgboxCallback = callback;

					return this;
				},
				before: function(callback){
					fnBeforeCallback = callback;

					return this;
				},
				done: function(callback){
					fnDoneCallback = callback;

					return this;
				},
				fail: function(callback){
					fnFailCallback = callback;

					return this;
				},
				always: function(callback){
					fnAlwaysCallback = callback;

					return this;
				}
			};
		};

		return fnRet;
	}]);

	module.factory("asyncformFactory", ["$http", "$q", function($http, $q){
		var Form = function(method, url,){
			var qDefer = $q.defer()
			,	fnPreEvent
			,	fnDoneEvent
			,	fnFailEvent
			,	fnAlways
			;

			this.resolve = function(data){

			};
			this.reject = function(data){

			};
			this.promise = {
				before: function(handler) {
					fnPreEvent = handler;

					return this;
				},
				done: function(handler){
					fnDoneEvent = handler;

					return this;
				},
				fail: function(handler){
					fnFailEvent = handler;

					return this;
				},
				always: function(handler){
					fnAlways = handler;

					return this;
				},
				submit: function(){
					$http({
						method: method.toUpperCase(),
						url: action,
						data: param,
						responseType: "json"
					})
					.then(qDefer.resolve)
					["catch"](qDefer.reject)
					;

					return this;
				}
			};// end promise
		};

		return {
			$get: function(){
				return new Form();
			};
		};
	}]);
	
	
	// 비동기 양식
	module.directive("ngAsyncform", function(){
		return {
			// 생성제한 조건: Attribute
			restrict: "AE",
			// 격리된 범위 (Isolate Scope) 설정
			scope: {
				loading: "=loading",
				param: "@param"
			},
			// form 이 꼭 필요 하다.
			//require: ["^ngForm"],
			controller: ["$scope", "$http", "$location", "$timeout", "asyncformCache", "asyncformStore", function($scope, $http, $location, $timeout, cache, store){
				var qDefer = $q.defer()
				,	fnPreEvent
				,	fnDoneEvent
				,	fnFailEvent
				,	fnAlways
				,	fnMsgbox
				,	call
				,	succ
				,	automsg
				;

				$scope.cache = cache;
				$scope.store = store;
				$scope.method = "GET";
				$scope.action = "";
				$scope.automsg = false;

				succ = function(res){
					var data = res.data
					,	result = res.result
					;

					if (result.msg && $scope.automsg){
						automsg( msg );
					}
				};

				call = function(){
					var promise
					,	method = $scope.method
					,	action = $scope.action
					,	param = $scope.param
					;

					if (!method || !action){
						return;
					}

					$http({
						method: method,
						url: action,
						data: param,
						responseType: "json"
					})
					.then(succ)
					.catch(fnFailEvent)
					.finally(fnAlways)
					;
				};

				automsg = function(msg, _type){
					var type = _type || "alert";

					return $q(function(resolve, reject){
						// msgbox 이벤트가 비어 있다면 곧바로 submit 수행.
						if (fnMsgbox === undefined){

							if ((type === "confirm") && confirm(msg)){
								resolve();
							}
							else if (type === "alert"){
								alert(msg);

								resolve();
							}

							return;
						}
						// submit 수행 권한을 msgbox 이벤트로 넘긴다.
						try{
							fnMsgbox.bind($scope, type, msg, resolve, reject);
						}
						// msgbox 이벤트 수행 중 문제가 생겼다면 아무것도 하지 않는다.
						catch(e){}
					});
				};


				$scope.promise = {
					before: function(handler) {
						fnPreEvent = handler;

						return this;
					},
					done: function(handler){
						fnDoneEvent = handler;

						return this;
					},
					fail: function(handler){
						fnFailEvent = handler;

						return this;
					},
					always: function(handler){
						fnAlways = handler;

						return this;
					},
					submit: function(){
						try{
							if(fnPreEvent.apply(this) === false){
								return;
							}
						}
						catch(e){}

						$scope.loading = true;

						if(msgConfirm){
							automsg(msgConfirm, "confirm")
							.then(call);

							return;
						}

						call();
					}
				};// end promise
			}],
			link: function(scope, element, attr, ctrl){
				var msgQueue = {
					queue: {},
					push: function(msg){
						console.log(msg);
						if (!this.queue[msg]){
							setTimeout(function(){
								alert(msg);
								delete msgQueue.queue[msg];
							}, 100);

							this.queue[msg] = true;
						}
					}
				};
				var util = scope.util;
				var name = element.attr("name");
				
				var fnDoAjaxSubmit = function(scope, elem, attr){// console.log("ffff", elem);
					var elem = elem,
						sMethod = elem.method.toUpperCase(),
						sAction = elem.action,
						name = elem.name,
						sConfirmMsg = attr.confirm,
						bConfirm = false,
						bManual = attr.hasOwnProperty("manual"),
						bUseCache = attr.hasOwnProperty( "cache" ),
						iCacheTime = (bUseCache)? parseInt( attr.cache || 10 ) * 60 * 1000 : 0,
						$location = scope.$location,
						ngForm,
						mParam,
						sUrlWithParam;
					
					if (attr.param){
						//console.log( JSON.stringify( scope[ attr.param ] ) )
						mParam = scope[ attr.param ];
						
						if (!mParam){
							throw "ngAsyncform: scope must have to property '" + attr.param + "' !";
						}
					}
					else{
						mParam = util.serializeMap( angular.element(elem) );
					}
					
					sMethod = (sMethod)? sMethod : "GET";
					
					//console.log("e", e);
					//console.log("param", mParam);
					//console.log("directive param", scope.param);
					//console.log("attr", attr);
					
					if (angular.isString( name )){
						ngForm = scope[ name ];
						
						if (ngForm.$invalid){
							if (navigator.userAgent.indexOf("MSIE") > -1){
								// IE는 angular 의 valid 기능을 씹어 먹는다 -_-
								// 명불허전 IE... Shit..
							}
							else{
								scope.$broadcast( name + ".invalid", {
									form: elem,
									action: elem.action,
									param: mParam,
									ngForm: ngForm
								});
								return;
							}
						}
					}
					else{
						throw "ngAsyncform: form element must have to name attribute!";
					}
					
					try{
						
						/*
						var xhr = new XMLHttpRequest();
						
						xhr.onreadystatechange = function(){
							if (xhr.readyState == 4 && xhr.status == 200) {
								try{
									scope.$broadcast( name, {
										form: elem,
										action: elem.action,
										param: mParam,
										ngForm: ngForm,
										response: {data: JSON.parse(xhr.responseText)}
									});
								}
								catch(e){
									scope.$broadcast( name + ".fail", {
										form: elem,
										action: elem.action,
										param: mParam,
										ngForm: ngForm,
										response: e + "\r\n" + xhr.responseText
									});
								}
							}
							else if(xhr.readyState == 404){
								scope.$broadcast( name + ".fail", {
									form: elem,
									action: elem.action,
									param: mParam,
									ngForm: ngForm,
									response: xhr.responseText
								});
							}
						};
						
						xhr.open("GET", elem.action, true);
						xhr.send();
						*/
						
						try{
							delete mParam.prevent;
						}
						catch(e){}
						
						scope.$broadcast( name + ".before", {
							form: elem,
							action: elem.action,
							param: mParam,
							ngForm: ngForm
						});
						
						if (mParam.prevent === true){
							return;
						}
						
						if (angular.isString( sConfirmMsg )){
							bConfirm = confirm( sConfirmMsg );
							
							if (bConfirm === false){
								return;
							}
						}

						/*
						$.get(elem.action, mParam, function(data){
							var response = {
								data: $.parseJSON(data)
							};
							
							var mResult;
							console.log("data", data);
							try{
								if (bManual === false){
									mResult = response.data.result;
									
									if (mResult === undefined){
										throw "ngAsyncform: manual attribute is undefined (=auto). but cannot found 'result' from response's data. please check xhr response data.";
									}
									
									if (mResult.msg){
										if (scope.cache.has( mResult.redirect ) === false){
											alert( mResult.msg );
											scope.cache.put( mResult.redirect, "-", 1000 );
										}
									}
									if (mResult.redirect){
										if (mResult.redirect === "@back"){
											history.back();
										}
										else{
											$location.path( mResult.redirect );
										}
										
										return;
									}
								}
							}
							catch(e){
								if (console){
									console.log( e );
								}
							}
							
							scope.$broadcast( name, {
								form: elem,
								action: elem.action,
								param: mParam,
								ngForm: ngForm,
								response: response
							});
						});*/
						//$.getJSON
						//console.log(elem.action + "------------" + JSON.stringify(mParam));
						sUrlWithParam = elem.action + util.serializeParams(mParam);
						
						if (bUseCache && scope.cache.has(sUrlWithParam)){
							scope.$broadcast( name, {
								form: elem,
								action: elem.action,
								param: mParam,
								ngForm: ngForm,
								response: scope.cache.get(sUrlWithParam)
							});
							
							return;
						}
						
						scope.lqPut();
						scope.$http({
							method: elem.method.toUpperCase(),
							url: elem.action,
							params: mParam
						})
						.then(function(response){
							console.log("response", response.data);

							var mResult, sMsg = "", sRedirect, msgDisplayed = false;
							
							try{
								scope.lqGet();
								if (bManual === false){
									mResult = response.data.result;
									sRedirect = mResult.redirect;
									
									if (mResult === undefined){
										throw "ngAsyncform: manual attribute is undefined (=auto). but cannot found 'result' from response's data. please check xhr response data.";
									}
									
									if (mResult.msg){
										if (scope.cache.has( mResult.redirect ) === false){
											sMsg = mResult.msg;
											scope.cache.put( mResult.redirect, "-", 1000 );
										}
									}
									if (sRedirect !== ""){
										if (sMsg){
											msgQueue.push(sMsg);
											sMsg = "";
											msgDisplayed = true;
										}

										if (sRedirect === "@back"){
											history.back();
										}
										else if ((sRedirect.indexOf("/") === 0) || sRedirect.indexOf("http") === 0){
											location.href = sRedirect;
										}
										else{
											$location.path( sRedirect );
										}
										
										return;
									}

									if (sMsg){
										msgQueue.push(sMsg);
									}
								}
							}
							catch(e){
								if (console){
									console.log( e );
								}
							}
							
							if (bUseCache){
								scope.cache.put(sUrlWithParam, response, iCacheTime);
							}


							
							scope.$broadcast( name, {
								form: elem,
								action: elem.action,
								param: mParam,
								ngForm: ngForm,
								response: response
							});
						}, function(response, a, b){
							if (response.code === 12){
								var xhr = new XMLHttpRequest();
								console.log("retry");
								xhr.onreadystatechange = function(){
									//console.log("xhr.result===" + );
									//console.log("xhr.readyState=" + xhr.readyState);
									//console.log("xhr.status=" + xhr.status);
									if ((xhr.readyState == 4) && xhr.status == 200) {
										scope.lqGet();
										scope.$timeout(function(){
											//console.log("success?" + xhr.responseText);
											try{
												scope.$broadcast( name, {
													form: elem,
													action: elem.action,
													param: mParam,
													ngForm: ngForm,
													response: {data: JSON.parse(xhr.responseText)}
												});
											}
											catch(e){
												//console.log("e*******" + e);
												scope.$broadcast( name + ".fail", {
													form: elem,
													action: elem.action,
													param: mParam,
													ngForm: ngForm,
													response: e + "\r\n" + xhr.responseText
												});
											}
										}, 100);
										
									}
									else if(xhr.readyState == 404){
										scope.lqGet();
										scope.$broadcast( name + ".fail", {
											form: elem,
											action: elem.action,
											param: mParam,
											ngForm: ngForm,
											response: xhr.responseText
										});
									}
								};
								
								xhr.open("GET", elem.action + util.serializeParams( mParam ), true);
								xhr.send();
								
								return;
							}
							scope.lqGet();
							scope.$broadcast( name + ".fail", {
								form: elem,
								action: elem.action,
								param: mParam,
								ngForm: ngForm,
								response: response
							});
						});
				
					}
					catch(e){
						console.log(e);
					}
				};// fnDoAjaxSubmit [end]
				
				var fnOnSubmit = function(e){
					fnDoAjaxSubmit(scope, e.target, attr);
					e.preventDefault();
				}; // fnOnSubmit [end]
				
				var fnAttrObserve = function(value, scope, element, attr){
					var isAuto = value === "auto",
						element = element;//angular.element( document.getElementsByName( name ) );
					
					element.bind("submit", fnOnSubmit );
					
					if (isAuto){
						fnDoAjaxSubmit( scope, element[0], attr );
					}
					
					scope.$broadcast( name + ".ready", {
						form: {
							element: element,
							submit: function(){
								fnDoAjaxSubmit( scope, element[0], attr );
							}
						}
					});
				}; // fnAttrObserve [end]
				
				if (!name){
					throw "ngAsyncform: form element must have to name attribute!";
				}
				
				fnAttrObserve( attr.ngAsyncform, scope, element, attr );
				
				//console.log("element", element);
			}
		};// return object [end]
	});
	
})(angular);