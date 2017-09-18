(function(angular, $, undefined){
	"use strict";

	var module = angular.module("mng.service", []);

	module.service("ptvdata", ["$timeout", function($timeout){
		return {
			filterIP: function(arrIP, isWow, arrWowOnly, arrPtvOnly){
	            var aNew = [],
	                i = -1,
	                iLen = arrIP.length,
	                aTarget = (isWow)? arrWowOnly : arrPtvOnly,
	                ip = ""
	            ;

	            console.log( "isWow", isWow );

	            while(++i < iLen){
	                ip = arrIP[ i ];

	                aNew.push(ip);
	            }

	            aNew = aNew.concat( aTarget );

	            return aNew;
	        },

	        addSpecField: function(arr, ip, resCode){
	            var i = -1,
	                iLen = 0,
	                iResCode = parseInt( resCode || 400 ),
	                sResMsg = "",
	                mRes = this.parseResCode( iResCode )
	            ;

	            iResCode = mRes.code;
	            sResMsg = mRes.msg;

	            //console.log("msg", sResMsg);

	            if (angular.isArray(arr) === false){
	                return [
	                    {
	                        ip: ip,
	                        id_cust: "",
	                        nm_site: "",
	                        svc_status: sResMsg,
	                        code_cust: "",
	                        resCode: iResCode
	                    }
	                ];
	            }

	            iLen = arr.length;

	            while(++i < iLen){
	                arr[i].ip = ip;
	                arr[i].resCode = iResCode;
	            }

	            return arr;
	        },

	        parseResCode: function(iResCode){
				var sResMsg = "";

	        	if (iResCode === 408){
	                iResCode = 408;
	                sResMsg = "연결시간 초과";
	            }
	            else if (iResCode >= 500){
	                iResCode = 500;
	                sResMsg = "서버 내부 오류";
	            }
	            else if (iResCode >= 400){
	                iResCode = 400;
	                sResMsg = "잘못된 요청";
	            }
	            else{
	                iResCode = 200;
	                sResMsg = "정상-자료 없음";
	            }

	            sResMsg += "(" + iResCode + ")";

	            return {
	            	code: iResCode,
	            	msg: sResMsg
	            };
	        },

	        loopWork: function($scope, mData, formObj, offLoading){
	            var mResult = mData.result
	            ,   mInfo = mData.info
	            ,   mRes
	            ;

	            if (mInfo){
	                mRes = this.parseResCode( mInfo.res_code );
	                mRes.ip = $scope.param.ip;
	                mRes.type = $scope.workType || "";
	            }
	            else{
	                mRes = {
	                    code: 0,
	                    msg: "요청 IP가 잘못됨.",
	                    ip: $scope.param.ip,
	                    type: ""
	                };
	            }

	            try{
	                mRes.ipNo = mRes.ip.split(".")[3];
	            }
	            catch(e){
	                mRes.ipNo = "unknown";
	            }

	            $scope.workResult.push( mRes );

	            $scope.currIndex++;
	            $scope.param.seq++;

	            if ($scope.currIndex < $scope.maxWork){
	                $scope.param.ip = $scope.useIP[ $scope.currIndex ];
	                formObj.submit();
	            }
	            else{
	                $timeout(function(){
	                    $scope.param.ip = "";
	                    $scope.maxWork = 0;

	                    try{
	                    	offLoading();
	                    }
	                    catch(e){}
	                }, 500);
	            }
	        }
		};
	}]);



	module.service("ptvclient", function(){
		return {
			lastNum: function(ip){
	            var aIP;

	            if (ip){
	                aIP = ip.split(".");

	                if (aIP.length === 4){
	                    return aIP[3];
	                }
	            }

	            return "invalid";
	        },

			initColHead: function(arrIP){
	            var arr = [],
	                i = -1,
	                iLen = 0
	            ;

	            iLen = (angular.isArray( arrIP ))? arrIP.length : 0;

	            while(++i < iLen){
	                arr.push( this.lastNum( arrIP[ i ] ) );
	            }

	            return arr;
	        },

	        collectByMac: function(macMap, ipList, ip, clientList){
	            return this.collectByField.apply( this, [macMap, ipList, ip, clientList, "client_mac"] )
	        },

	        collectByField: function(dataMap, ipList, ip, clientList, fieldName){
	        	var mKey = dataMap || {},
	                list = clientList,
	                item,
	                i = -1,
	                iLen = 0,
	                idxClient = 0,
	                sMac = "",
	                aClients,
	                iLenIP = 0,
	                sFieldName = fieldName
	            ;

	            iLen = (angular.isArray(list))? list.length : 0;

	            if (angular.isArray(ipList)){
	                idxClient = ipList.indexOf( ip );
	                iLenIP = ipList.length;
	            }

	            while(++i < iLen){
	                item = list[i];
	                sMac = item[ sFieldName ];

	                if (mKey.hasOwnProperty(sMac) === false){
	                    aClients = [];
	                    aClients.length = iLenIP;
	                    mKey[ sMac ] = aClients;
	                }
	                else{
	                    aClients = mKey[ sMac ];
	                }
	                
	                aClients[ idxClient ] = item;
	            }

	            console.log(i, mKey);

	            return mKey;
	        },

	        totalize: function(mMacMap){
	            // var list = [],
	            //     i = -1,
	            //     iLen = 0,
	            //     key = ""
	            // ;

	            // for (key in mMacMap){
	            //     list.push({
	            //         mac: key,
	            //         clients: mMacMap[key]
	            //     });
	            // }

	            // return list;

	            return this.totalizeBy.apply(this, ["mac", "clients", mMacMap]);
	        },

	        totalizeBy: function(prop1, prop2, mMap){
	            var list = [],
	                i = -1,
	                iLen = 0,
	                key = "",
	                item
	            ;

	            for (key in mMap){
	            	item = {};
	            	item[prop1] = key;
	            	item[prop2] = mMap[key]
	                list.push( item );
	            }

	            return list;
	        }
		};
	});

})(angular, jQuery);