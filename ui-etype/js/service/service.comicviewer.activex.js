;define("service.comicviewer.activex", ["jquery", "util", "service"], 
	function($, util, weblauncher, undefined){
		

		function serializeRequestUrl(serial, bookSerial, type){
			var c_id = serial
			,	b_id = bookSerial
			,	cat = type
			;

			return /*b2b trigger url*/"?c_id=" + c_id + "&b_id=" + b_id + "&cat=" + cat;
		}

		return function(info){
			var serial 	= util.mapValDef(info, "serial")
			,	bookSerial = util.mapValDef(info, "book_serial")
			,	type = util.mapValDef(info, "type")
			,	url = serializeRequestUrl( serial, bookSerial, type )
			;

			return {
				show: function(){
					var bRet = false
					,	msg = ""
					;

					if (serial && bookSerial && type){
						try{
							$(".comicviewer-trigger")[0].src = url;
							bRet = true;
						}
						catch(e){
							msg = "뷰어 트리거가 존재하지 않습니다.";
						}
					}
					else{
						msg = "뷰어 수행에 필요한 값이 부족합니다.\n" + serial + "_" + bookSerial + "_" + type;
					}

					if (msg !== ""){
						alert( msg );
					}

					return bRet;
				}
			};
		};
	});