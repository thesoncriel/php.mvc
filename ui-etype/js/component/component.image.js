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