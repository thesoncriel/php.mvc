;define("util", ["jquery", "knockout", "promise"], function($, ko, Promise){
	var fnCheckIEVersion = function(){
		var rv = -1, ua, re;

        if (navigator.appName == 'Microsoft Internet Explorer'){
            ua = navigator.userAgent;
            re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");

            if (re.exec(ua) !== null){
                rv = parseFloat( RegExp.$1 );
            }
        }
        else if(navigator.appName == "Netscape"){                       
            /// in IE 11 the navigator.appVersion says 'trident'
            /// in Edge the navigator.appVersion does not say trident
            if(navigator.appVersion.indexOf('Trident') === -1) rv = 12;
            else rv = 11;
        }

        if (rv > 11){
        	return -1;
        }

        return rv;
	}
	, ieVersion = fnCheckIEVersion()
	, isIE = ieVersion > 0
	;

	return {
		noop: function(e){
			return false;
		},
		noopstop: function(e){
			e.stopPropagation();

			return false;
		},

		addKoFieldsToList: function(data, keys){
			var iLen, i
			;

			if ($.isArray(data) === false){
				return data;
			}

			iLen = data.length;
			i = -1;

			while(++i < iLen){
				data[i] = this.addKoFields(data[i], keys);
			}
		},

		addKoFields: function(item, keys){
			var iLen, i, k = ko, key, val
			;

			if ($.isPlainObject(keys) === true){
				for(key in keys){
					val = keys[key];
					item[ key ] = k.observable( val );
				}
			}

			return item;
		},

		textOverflow: function(text, len, ellipsis){
			var sText = text
			,	iLen = len || 103
			,	sEnd = ellipsis || "..."
			,	iMax = iLen - sEnd.length
			;

			if (typeof sText === "string"){
				if (sText.length > iLen){
					sText = sText.substring(0, iMax) + sEnd;
				}

				return sText;
			}

			return text;
		},

		mapValDef: function(map, key, def){
			if (!map || !map.hasOwnProperty(key)){
				return def;
			}

			return map[key];
		},

		/*
		item 에 등록된 Property 값들에 대한 유효성을 검증한다.
		@param item = Map
		@param info = Array
			구조: {
				name: String,
				msg: String
				regex: 정규식 조건
			}
		*/
		valid: function(item, info){
			var i, iLen, mInfo, key, val, isValid = true
			;

			if (!item || !$.isArray(info)){
				return {
					valid: false,
					target: "all",
					msg: "입력이 잘못 되었습니다."
				};
			}

			i = -1;
			iLen = info.length;

			while(++i < iLen){
				mInfo = info[i];
				key = mInfo.name;
				val = item[key];

				if (!mInfo.regex){
					if (!val === undefined || val === null || val === ""){
						isValid = false;
					}
				}

				if ( mInfo.regex.test( val ) === false ){
					isValid = false;
				}

				if (isValid === false){
					return {
						name: key,
						value: val,
						msg: mInfo.msg,
						valid: false
					};
				}
			}

			return {
				name: "all",
				msg: "",
				valid: true
			};
		},

		trim: function(str){
			if (typeof str === "string"){
				return str.replace(/^\s+|\s+$/g, "");
			}

			return str;
		},

		cookie : {
			set: function(name, value, expirehours, domain) {
			    var today = new Date();

			    today.setTime(today.getTime() + (expirehours * 3600000 /* 60*60*1000*/ ));
			    document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + today.toGMTString() + ";";

			    if (domain) {
			        document.cookie += "domain=" + domain + ";";
			    }
			},
			get: function(name){
			    var find_sw = false
			    ,	start, end
			    ,	i = 0
			    ,	sTmp = unescape(document.cookie)
			    ;

			    for (i=0; i<= sTmp.length; i++)
			    {
			        start = i;
			        end = start + name.length;

			        if(sTmp.substring(start, end) == name) {
			            find_sw = true;
			            break;
			        }
			    }

			    if (find_sw == true){
			        start = end + 1;
			        end = sTmp.indexOf(";", start);

			        if(end < start){
			            end = sTmp.length;
			        }

			        return sTmp.substring(start, end);
			    }
			    return "";
			},
			remove: function(name){
			    var today = new Date()
			    ,	value
			    ;

			    today.setTime(today.getTime() - 1);
			    value = m.cookie.get(name);

			    if(value != ""){
			    	document.cookie = name + "=" + value + "; path=/; expires=" + today.toGMTString();
			    }
			        
			}
		},

		addDate : function(date, intVal, useFmt){
			var dateData = null
			,	saDate = null
			;
			
			if (date instanceof Date){
				dateData = date;
			}
			else{
				//saDate = date.split("-");
				dateData = new Date( date );
				//dateData.setFullYear( saDate[0] );
				//dateData.setMonth( parseInt(saDate[1]) - 1 );
				//dateData.setDate( saDate[2] );
			}
	    	dateData.setDate( dateData.getDate() + intVal );

	    	if (useFmt === false){
	    		return dateData;
	    	}

	    	return this.dateFormat(dateData);
		},

		dateFormat : function(date, delimiter) {
	        var sDelimiter = delimiter || "-"
	        ,	iMonth
	        ,	iDate
	        ;
	        
	        if (date instanceof Date){
				iMonth = date.getMonth() + 1;
				iDate = date.getDate();
				
				return date.getFullYear() + sDelimiter + ((iMonth < 10)? "0" + iMonth : iMonth) + sDelimiter + ((iDate < 10)? "0" + iDate : iDate);
			}
			else{
				return date.substring(0, 4) + sDelimiter + date.substring(4, 6) + sDelimiter + date.substring(6, 8);
			}
	    },

	    setAltImgEvent : function(imgPath){
	    	return function(item, event){
	    		var elem = event.currentTarget;

	    		//console.log("setAltImgEvent", elem.src);

				if (elem.src.indexOf(imgPath) < 0){
					elem.src = imgPath;
				}
	    	};
	    },

		debug: {
			log: function(txt){
				var sTxt
				;

				$("#panel_debug").show();

				sTxt = $("#txtDebug").val() + "\r\n" + txt;

				$("#txtDebug").val(sTxt);
			}
		},

		promise: function(fn){
			return new Promise(fn);
		},

		IEVersion: ieVersion,
	    isIE: function(){
	        return isIE;
	    },
	    pad: function(num, size){
	        var s = "000000000" + num;

	        return s.substr(s.length - (size || 0));
	    },
	    disassemble: function(obj, preppend){
	    	var aMsg, key, val
			sPre = preppend || ""
	    	;

	    	aMsg = []
			for(key in obj){
				aMsg.push(sPre);
				aMsg.push(key)
				aMsg.push("=")

				val = obj[key];

				if (typeof val === "object"){
					aMsg.push( this.disassemble(val, sPre + " -") );
				}
				else{
					aMsg.push( val );
				}
				
				aMsg.push("\n");
			}
			return aMsg.join("");
	    },

	    sameDomain: function(url){
	    	var regex;

	    	if (url.substr(0, 1) !== "/" || url.substr(0, 4) === "http"){
	    		regex = new RegExp(location.hostname);
				return regex.test(url);
	    	}

	    	return true;
	    },

	    objectToParameter: function(params){
	    	var aRet = [], key, i=0;

	    	for(key in params){
	    		if (i > 0){
	    			aRet.push( "&" );
	    		}
				aRet.push( key );
				aRet.push( "=" );
				aRet.push( encodeURIComponent( params[key] ) );
				i++;
	    	}

	    	return aRet.join("");
	    },

	    timeFormat: function(time, wordHour, wordMin){
			var iTime = parseInt( time )
			,	iHour = Math.floor(iTime / 3600)
			,	iMin = Math.floor( (iTime % 3600) / 60 )
			,	sWordHour = wordHour || "시"
			,	sWordMin = wordMin || "분"
			;

			return iHour + sWordHour + " " + iMin + sWordMin;
		},

		copyByOwnProp: function(data){
			var key, val, mRet = {}
			;

			for(key in data){
				if (data.hasOwnProperty(key)){
					mRet[key] = data[key];
				}
			}

			return mRet;
		}
	};
});