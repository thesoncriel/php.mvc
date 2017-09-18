;define("service.comicviewer", ["jquery", "util", "service", "config"], 
	function($, util, service, config, undefined){
		var mCustInfo = config.custInfo
		;

		function serializeRequestUrl(serial, bookno, type, idCust){
			return "comicviewer.php?serial="+serial+"&type="+type+"&bookno="+bookno+"&idcust="+idCust;
		}

		if (mCustInfo && !mCustInfo.new_comicviewer){
			return service("comicviewer.activex");
		}

		return function(info){
			var fnMapValDef = util.mapValDef
			,	serial 	= fnMapValDef(info, "serial")
			//,	bookSerial = fnMapValDef(info, "book_serial")
			,	bookno = fnMapValDef(info, "bookno")
			,	type = fnMapValDef(info, "type")
			,	idCust = fnMapValDef(config.custInfo, "id_cust")
			,	url = serializeRequestUrl( serial, bookno, type, idCust )
			;

			return {
				show: function(){
					var bRet = false
					,	msg = ""
					,	win
					;

					if (serial && bookno && type && idCust){
						win = window.open(url, "comic_viewer","width=1124,height=768,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,left=0,top=0");
						// 창을 앞으로 오게 하기
						win.focus();
						bRet = true;
					}
					else{
						msg = "뷰어 수행에 필요한 값이 부족합니다.\n" + serial + "_" + bookno + "_" + type + "_" + idCust;
					}

					if (msg !== ""){
						alert( msg );
					}

					return bRet;
				}
			}
		};
	});