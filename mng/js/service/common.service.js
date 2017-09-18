(function(angular, $, undefined){
	"use strict";

	var module = angular.module("common.service", []);

	module.service("util", function(){
		var util = {
			dateFormat: function (date, delimiter){
		    	var iMonth = date.getMonth() + 1,
		    		iYear = date.getFullYear(),
		    		iDay = date.getDate(),
		    		sMonth = (iMonth < 10)? "0" + iMonth : iMonth,
		    		sDay = (iDay < 10)? "0" + iDay : iDay,
		    		sDelimiter = delimiter || "-";
		    	
		    	return iYear + sDelimiter + sMonth + sDelimiter + sDay;
		    },
		   
		    timeFormat: function (date, delimiter){
		    	var iHour = date.getHours(),
		    		iMin = date.getMinutes(),
		    		iSec = date.getSeconds(),
		    		sHour = (iHour < 10)? "0" + iHour : iHour,
		    		sMin = (iMin < 10)? "0" + iMin : iMin,
		    		sSec = (iSec < 10)? "0" + iSec : iSec,
		    		sDelimiter = delimiter || ":";
		    	
		    	return sHour + sDelimiter + sMin + sDelimiter + sSec;
		    },

		    // 출처: http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
		    convertSecondToTime: function(second){
		    	var sec_num = parseInt(second); // don't forget the second param
			    var hours   = Math.floor(sec_num / 3600);
			    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
			    var seconds = sec_num - (hours * 3600) - (minutes * 60);

			    if (hours   < 10) {hours   = "0"+hours;}
			    if (minutes < 10) {minutes = "0"+minutes;}
			    if (seconds < 10) {seconds = "0"+seconds;}
			    return hours+':'+minutes+':'+seconds;
		    },

		    datetimeFormat: function(dateRaw){
		    	var date = new Date(dateRaw);

		    	return this.dateFormat( date ) + " " + this.timeFormat( date );
		    },

		    hmFormat: function(date, delimiter){
		    	var iHour = date.getHours(),
		    		iMin = date.getMinutes(),
		    		sHour = (iHour < 10)? "0" + iHour : iHour,
		    		sMin = (iMin < 10)? "0" + iMin : iMin,
		    		sDelimiter = delimiter || ":";
		    	
		    	return sHour + sDelimiter + sMin;
		    },
		   
			numberFormat: function(num) {
				var pattern = /(-?[0-9]+)([0-9]{3})/;
				var sNum = num + "";
				
				while(pattern.test(sNum)) {
					sNum = sNum.replace(pattern,"$1,$2");
				}
				return sNum;
			},
			
			convertToMonthName: function(month, len, names){
				var MONTHS = names || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
					iLen = len || false;
				
				if (iLen){
					return (MONTHS[ parseInt(month) - 1 ]).slice(0, iLen);
				}
				else{
					return MONTHS[ parseInt(month) - 1 ];
				}
			},

			addSeconds: function(dateRaw, seconds, format){
				var date = new Date( dateRaw ),
					iSec = parseInt( seconds );

				date.setSeconds( date.getSeconds() + iSec );

				if (format === "hh:mm"){
					return this.hmFormat( date );
				}
				if (format === "hh:mm:ss"){
					return this.timeFormat( date );
				}

				return date;
			},

			calcSnappedRunningTime: function(runningTime, snapTime){
				var iRunningTime = parseInt( runningTime ),
					iRunningTimeSnapped = iRunningTime - ( iRunningTime % snapTime );

				return iRunningTimeSnapped;
			},

			calcSnappedNextDatetime: function(dateRaw, runningTime, snapTime){
				console.log(dateRaw, runningTime, snapTime);
				var iRunningTime = this.calcSnappedRunningTime( runningTime, snapTime ),
					sDate = this.datetimeFormat( this.addSeconds( dateRaw, iRunningTime ) );

				console.log( "sDate", sDate );

				return sDate;
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
				    var find_sw = false;
				    var start, end;
				    var i = 0;
				    var sTmp = unescape(document.cookie);

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
				    var today = new Date();

				    today.setTime(today.getTime() - 1);
				    var value = m.cookie.get(name);
				    if(value != ""){
				    	document.cookie = name + "=" + value + "; path=/; expires=" + today.toGMTString();
				    }
				        
				}
			}
		};

		return util;
	});

// 자바스크립트 기능 부족한 것 보충
Array.prototype.filter||(Array.prototype.filter=function(r){"use strict";if(void 0===this||null===this)throw new TypeError;var t=Object(this),e=t.length>>>0;if("function"!=typeof r)throw new TypeError;for(var i=[],o=arguments.length>=2?arguments[1]:void 0,n=0;e>n;n++)if(n in t){var f=t[n];r.call(o,f,n,t)&&i.push(f)}return i});
})(angular, jQuery);