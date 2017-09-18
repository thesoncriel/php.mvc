(function(angular){
	"use strict";
	
	var module = angular.module("ngAsyncform", []);
	
	// 비동기 캐시 기능
	module.service("asyncform.cache", function(){
		var mData = {};
		
		return {
			has: function(key){
				return mData.hasOwnProperty( key );
			},
			remove: function(key){
				delete mData[ key ];
			},
			put: function(key, value, time){
				mData[ key ] = value;
				
				if (time !== undefined){
					setTimeout(function(){
						delete mData[ key ];
					}, time);
				}
			},
			get: function(key){
				return mData[ key ];
			}
		};
	});
	
	// 비동기 양식 데이터 직렬화 기능
	module.service("asyncform.serialize", function(){
		return {
			serializeMap : function( jqElem, arrToOneStr, delimiter ){
		    	var mData = {};
		    	var isArrToOneStr = angular.isArray(arrToOneStr);
		    	var sDelimiter = delimiter || ",";
		    	var mCacheChecked = {};
		    	var jqInputList;
		    	
		    	var fnSerializeMap = function(elem, index){
					var jqInput = angular.element(elem),
		    			sType = jqInput.attr("type"),
		    			sName = "",
		    			sTmp = "",
		    			sValue = "";
		    				
		    		//console.log("jqInput", jqInput);
		    		if (jqInput.attr("disabled") !== undefined) return;
		    		if (sType === "button" || sType === "submit" || sType === "image") return;
		    		
		    		sName = jqInput.attr("name");
		    		sValue = jqInput[0].value;
		    		
		    		if (mData.hasOwnProperty( sName ) === false){
		    			if ((sType === "checkbox") || (sType === "radio")){
		    				if (jqInput[0].checked === true){
		    					mData[ sName ] = sValue;
		    				}
		    				else{
		    					mCacheChecked[ sName ] = "";
		    				}
		    			}
		    			else{
		    				mData[ sName ] = sValue;
		    			}
		    		}
		    		else {
		    			if (sType === "checkbox"){
		    				if (mCacheChecked.hasOwnProperty( sName ) === true){
			    				mData[ sName ] = "";
			    				delete mCacheChecked[ sName ];
			    			}
			    			if (jqInput[0].checked === false){
		    					sValue = "";
		    				}
		    			}
		    			else if (sType === "radio"){
		    				if ((jqInput[0].checked === true) && (mData[ sName ] === "")){
		    					mData[ sName ] = sValue;
		    				}
		    				
		    				return;
		    			}
		    			
		    			if (isArrToOneStr === true){
		    				if (arrToOneStr.indexOf( sName ) >= 0){
		    					mData[ sName ] = mData[ sName ] + sDelimiter + sValue;
		    				}
		    			}
		    			else{
		    				if (angular.isArray(mData[ sName ]) === false){
			    				sTmp = mData[ sName ];
			    				mData[ sName ] = [];
			    				mData[ sName ][0] = sTmp;
			    			}
			    			mData[ sName ][ mData[ sName ].length ] = sValue;
		    			}
		    		}
				};
				
		    	angular.forEach( jqElem.find("input"), fnSerializeMap );
		    	angular.forEach( jqElem.find("select"), fnSerializeMap );
		    	angular.forEach( jqElem.find("textarea"), fnSerializeMap );
		    	
		    	return mData;
			},
			serializeParams: function(params){
				var str = "";
				for (var key in params) {
				    if (str != "") {
				        str += "&";
				    }
				    str += key + "=" + encodeURIComponent(params[key]);
				}
				
				return "?" + str;
			}
		};
	});
	
	// 비동기 양식
	module.directive("ngAsyncform", function(){
		return {
			restrict: "A",
			controller: ["$scope", "$rootScope", "$http", "$document", "$location", "$timeout", "asyncform.cache", "asyncform.serialize", function($scope, $rootScope, $http, $document, $location, $timeout, cache, util){
				//console.log("parent", $scope.$parent);
				$scope.$http = $http;
				$scope.util = util;
				$scope.$document = $document;
				$scope.$location = $location;
				$scope.$timeout = $timeout;
				$scope.cache = cache;

				
				
				if ($rootScope.loadingQueue === undefined){
					$rootScope.loadingQueue = {
						vals: [],
						put: function(val){
							this.vals.push(val);
							$rootScope.loading = true;
							$rootScope.loadingEnd = false;
						},
						get: function(){
							var ret;
							
							if (this.isEmpty()){
								return;
							}
							
							ret = this.vals.pop();
							
							if (this.isEmpty()){
								$rootScope.loading = false;
								$rootScope.loadingEnd = true;
							}
							
							return ret;
						},
						isEmpty: function(){
							return this.vals.length === 0;
						}
					};

					$rootScope.loading = false;
				}
				
				$scope.lqPut = function(){
					$rootScope.loadingQueue.put("-");
				};
				$scope.lqGet = function(){
					$rootScope.loadingQueue.get();
				};
			}],
			link: function(scope, element, attr){
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