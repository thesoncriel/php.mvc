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