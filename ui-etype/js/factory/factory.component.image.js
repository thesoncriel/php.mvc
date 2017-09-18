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