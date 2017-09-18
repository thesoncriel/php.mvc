(function(angular, undefined){
	"use strict";

	var app = angular.module("common.directive", []);

	app.directive('ngHtml', ['$compile', function($compile) {
	    return function(scope, elem, attrs) {
	        if(attrs.ngHtml){
	            elem.html(scope.$eval(attrs.ngHtml));
	            $compile(elem.contents())(scope);
	        }
	        scope.$watch(attrs.ngHtml, function(newValue, oldValue) {
	            if (newValue && newValue !== oldValue) {
	                elem.html(newValue);
	                $compile(elem.contents())(scope);
	            }
	        });
	    };
	}]);
	
	// 출처: http://jsfiddle.net/Tentonaxe/V4axn/
	app.directive('contenteditable', ["$interval", "$timeout", "$rootScope", function($interval, $timeout, $rootScope) {
	    return {
	      restrict: 'A', // only activate on element attribute
	      require: '?ngModel', // get a hold of NgModelController
	      link: function(scope, element, attrs, ngModel) {
	      	var timer;
	      	
	        if(!ngModel) return; // do nothing if no ng-model
	
	        // Specify how UI should be updated
	        ngModel.$render = function() {
	          element.html(ngModel.$viewValue || '');
	        };
	
	        // Listen for change events to enable binding
	        element.on('blur keyup change', function() {
	          scope.$apply(read);
	        });
	        
	        $timeout(read, 500);;
	        //read(); // initialize
	
	        // Write data to the model
	        function read() {
	          var html = element.html();
	          // When we clear the content editable the browser leaves a <br> behind
	          // If strip-br attribute is provided then we strip this out
	          if( attrs.stripBr && html == '<br>' ) {
	            html = '';
	          }
	          ngModel.$setViewValue(html);
	        }
	        
	        $rootScope.$on("contenteditable.refresh", function(){
	        	read();
	        });
	      }
	    };
	}]);

	app.directive("ngUpload", function(){
		return {
			restrict: "A",
			controller: ["$scope", "$rootScope", "$http", "$document", "$location", "$timeout", function($scope, $rootScope, $http, $document, $location, $timeout){
				//console.log("parent", $scope.$parent);
				$scope.$timeout = $timeout;
				$scope.__ngUploadStatus = false;

				$scope.trigEvent = function(sName, jsonData){
					var data;

					if ($scope.__ngUploadStatus === true){
						$scope.$apply(function(){
							try{
								data = angular.fromJson( jsonData );

								$scope.$broadcast( sName, data);
							}
							catch(e){
								$scope.$broadcast( sName + ".fail", data);
								
								console.log(e);
								console.log(jsonData);
							}
						});

						$scope.__ngUploadStatus = false;
					}
				};
			}],
			link: function(scope, elem, attr){
				var sTarget = attr.target || "frame_upload",
					sName = attr.name || "upload",

					sSelector = "#" + sTarget + ", iframe[name='" + sTarget + "']",
					elemFrame,
					jqFrame,
					jqForm = elem,
					jqFile = jqForm.find("input"),
					jqButton = jqForm.find("button"),
					evtFrameLoad,
				endvar;

				jqFrame = jqForm.find("iframe");

				/*
				form 내부에서 iframe을 찾는데,
				없거나(undefined) 가져왔는데 하필 1이 아니거나 이름이 같지 않다면
				전체 문서에서 다시 찾는다...
				*/
				if ((jqFrame.length !== 1) || (jqFrame[0].name !== sTarget)){
					elemFrame = document.querySelectorAll( sSelector );
					jqFrame = angular.element(elemFrame);
				}

				//scope.uploading = false;

				evtFrameLoad = function(event){
					var elemFrame = event.target,
						jsonData = elemFrame.contentDocument.body.innerHTML,
						elem = jqForm[0],
						data,
					endvar;

					if (jsonData.length > 1){
						scope.trigEvent(sName, jsonData);
					}
				};
				

				jqFrame.bind("load", evtFrameLoad);

				jqButton.bind("click", {jqFile: jqFile, scope: scope}, function(event){
					try{
						event.data.jqFile[0].click();
					}
					catch(e){
						console.log(e);
					}
				});

				jqFile.bind("change", {jqFile: jqFile, jqForm: jqForm, scope: scope}, function(event){
					var data = event.data,
						jqFile = data.jqFile,
						jqForm = data.jqForm,
						endvar;

					scope.$apply(function(){
						scope.$broadcast( sName + ".before", {
							form: jqForm[0],
							input: jqFile[0]
						});

						scope.__ngUploadStatus = true;
						jqForm[0].submit();
					});
				});

				scope.$on("$destroy", function(){
					jqFrame.unbind("load", evtFrameLoad);
					evtFrameLoad = undefined;
					elemFrame = undefined;
					jqFrame = undefined;
					jqForm = undefined;
					jqFile = undefined;
					jqButton = undefined;
				});
			}
		};
	});
})(angular);