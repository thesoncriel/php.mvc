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