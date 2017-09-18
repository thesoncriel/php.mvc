(function(angular, $, undefined){
    "use strict";

    var app = angular.module("controller.ptv", ["common.service", "mng.service"]);

    app.service("SessionCheck", ["$http", "$q", "$location", function($http, $q, $location){
        
        return function(){
            var hasLogin = sessionStorage.mngHasLogin === true;

            function checkLogin(){
                return $q(function(resolve, reject){
                    $http.get("/exec/mng/login.check.php")
                    .then(function(res){
                        //console.log(res);
                        try{
                            hasLogin = !!res.data.result.auth;
                        }
                        catch(e){
                            hasLogin = false;
                        }

                        if (hasLogin){
                            sessionStorage.mngHasLogin = true;
                            resolve(true);
                        }
                        else{
                            reject(false);
                            //console.log("checkLogin.reject");
                        }
                    })
                    .catch(function(res){
                        //console.log("checkLogin.catch");
                        reject();
                    });
                });
            };

            return {
                check: function(){
                    if (!hasLogin){
                        checkLogin()
                        .catch(function(){
                            location.href = "/mng/";
                            //console.log("check.catch");
                        });
                    }
                }
            };
        }
    }]);

    app.controller("WithSession",
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModal", "ptvdata", "SessionCheck",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModal, ptvdata, SessionCheck){

        SessionCheck().check();
    }]);

    app.controller("PtvLoginController",
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModal", "ptvdata",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModal, ptvdata){

        var sFormName = "form_login"
        ,   objform
        ,   sId = util.cookie.get("mng_id")
        ,   sPw = util.cookie.get("mng_pw")
        ,   bRemember = util.cookie.get("remember_me") === "yes"
        ;

        $scope.param = {
            id: sId,
            pw: sPw,
            remember: bRemember
        };

        console.log($scope.param);

        $scope.nowloading = false;

        $scope.$on(sFormName + ".before", function($event, $data){
            var msg = "";

            if (!$scope.param.id){
                msg = $scope.msgInvalidId;
            }
            else if (!$scope.param.pw){
                msg = $scope.msgInvalidPw;
            }

            if (msg){
                alert( msg );

                $data.param.prevent = true;

                return;
            }

            $scope.nowloading = true;

            if ($data.param.remember){
                util.cookie.set("remember_me", "yes", 24*30);
                util.cookie.set("mng_id", $scope.param.id, 24*30);
                util.cookie.set("mng_pw", $scope.param.pw, 24*30);
            }
            else{
                util.cookie.remove("remember_me");
                util.cookie.remove("mng_id");
                util.cookie.remove("mng_pw");
            }
        });

        $scope.$on(sFormName, function($event, $data){
            $scope.nowloading = false;
            //console.log("succ", $data);
        });

        $scope.$on(sFormName + ".fail", function(){
            $scope.nowloading = false;
        });
    }]);

    app.controller("Logout", ["$scope", "$http", function($scope, $http){
        $http.get("/exec/mng/logout.php")
        .then(function(data){
            alert("로그아웃 되었습니다.");

            location.href = "/mng/";
        })
        .catch(function(){
            alert("로그아웃에 실패 했습니다.\n그냥 끄시면 될 듯..");
        });
    }]);

    app.controller("PtvCustListController", 
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModal", "ptvdata",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModal, ptvdata){
        
        var sFormName = "form_ptvCustList",
            sFormNameDkInfo = "form_dkClient",
            objform,
            objformDkInfo,
            endvar
        ;

        $scope.param = {
            id_cust: "",
            ip: "",
            page: 1,
            count: 500
        };

        $scope.list = [];
        $scope.totalcount = 0;
        $scope.useIP = [];
        $scope.currIndex = 0;
        $scope.maxWork = 0;
        $scope.dkList = [];
        $scope.dkSearch = false;

        $scope.onPageChange = function(){
            objform.submit();
        };

        $scope.$on(sFormName + ".before", function($event, $data){
            if (!$scope.param.id_cust){
                alert($scope.msgIdCustNeed);

                $data.param.prevent = true;

                return;
            }

            if ($scope.maxWork === 0){
                $scope.list = [];
                $scope.currIndex = 0;
                $scope.totalcount = 0;
                $scope.maxWork = $scope.useIP.length;
                $scope.param.ip = $scope.useIP[ 0 ];

                $scope.dkSearch = false;
            }
        });
        
        $scope.$on( sFormName, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            $scope.list = $scope.list.concat( ptvdata.addSpecField(mData.data, $scope.param.ip, mData.info.res_code) );

            $scope.currIndex++;
            
            if ($scope.currIndex < $scope.maxWork){
                $scope.param.ip = $scope.useIP[ $scope.currIndex ];
                objform.submit();
            }
            else{
                $scope.totalcount = $scope.list.length;
                $timeout(function(){
                    //alert($scope.msgSearchSuccess);
                    $scope.param.ip = "";
                    $scope.maxWork = 0;
                }, 500);
                objformDkInfo.submit();
            }
            
        });
        
        $scope.$on(sFormName + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormName + ".ready", function($event, $data){
            objform = $data.form;
        });

        $scope.$watch("wow", function(){
            $scope.useIP = ptvdata.filterIP( $scope.IP, $scope.wow, $scope.WOW_ONLY, $scope.PTV_ONLY );
        });





        $scope.$on(sFormNameDkInfo + ".before", function($event, $data){
            $scope.dkSearch = false;
        });
        
        $scope.$on(sFormNameDkInfo, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            $scope.dkList = (angular.isArray(mData.data))? mData.data : [];
            $scope.dkSearch = true;
        });

        $scope.$on(sFormNameDkInfo + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormNameDkInfo + ".ready", function($event, $data){
            objformDkInfo = $data.form;
        });

        $scope.$on("$destroy", function(){
            
        });
    }]);


    app.controller("PtvClientListController", 
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModal", "ptvdata", "ptvclient",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModal, ptvdata, ptvclient){
        
        var sFormName = "form_ptvClientList",
            objform,
            endvar
        ;

        $scope.param = {
            id_cust: "",
            ip: "",
            page: 1,
            count: 500
        };

        $scope.list = [];
        $scope.totalcount = 0;
        $scope.useIP = [];
        $scope.currIndex = 0;
        $scope.maxWork = 0;
        $scope.macMap = undefined;
        $scope.colHead = undefined;

        $scope.onPageChange = function(){
            objform.submit();
        };

        $scope.lastNum = ptvclient.lastNum;

        $scope.$on(sFormName + ".before", function($event, $data){
            if (!$scope.param.id_cust){
                alert($scope.msgIdCustNeed);

                $data.param.prevent = true;

                return;
            }

            if ($scope.maxWork === 0){
                $scope.list = [];
                $scope.currIndex = 0;
                $scope.totalcount = 0;
                $scope.maxWork = $scope.useIP.length;
                $scope.param.ip = $scope.useIP[ 0 ];

                $scope.macMap = {};
            }
        });
        
        $scope.$on( sFormName, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            if ($scope.collectByContent){
                $scope.macMap = ptvclient.collectByField( $scope.macMap, $scope.useIP, $scope.param.ip, mData.data, "title" );
            }
            else{
                $scope.macMap = ptvclient.collectByMac( $scope.macMap, $scope.useIP, $scope.param.ip, mData.data );
            }

            //$scope.list = $scope.list.concat( $scope.addSpecField(mData.data, $scope.param.ip, mData.info.res_code) );
            

            $scope.currIndex++;
            
            if ($scope.currIndex < $scope.maxWork){
                $scope.param.ip = $scope.useIP[ $scope.currIndex ];
                objform.submit();
            }
            else{
                $scope.list = ptvclient.totalize( $scope.macMap );
                $scope.totalcount = $scope.list.length;
                $timeout(function(){
                    //alert($scope.msgSearchSuccess);
                    $scope.param.ip = "";
                    $scope.maxWork = 0;
                }, 500);
            }
            
        });
        
        $scope.$on(sFormName + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormName + ".ready", function($event, $data){
            objform = $data.form;
        });

        $scope.$watch("wow", function(){
            $scope.useIP = ptvdata.filterIP( $scope.IP, $scope.wow, $scope.WOW_ONLY, $scope.PTV_ONLY );
            $scope.colHead = ptvclient.initColHead( $scope.useIP );
            //$scope.macMap = initMacMap( $scope.useIP );
        });

        $scope.$on("$destroy", function(){
            
        });
    }]);

    app.controller("PtvClientOpt",
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModal", "ptvdata", "ptvclient",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModal, ptvdata, ptvclient){

        var nameInfo = "form_ptvClientOptInfo"
        ,   nameOpt = "form_ptvClientOpt"
        ,   nameAdv = "form_ptvClientOptAdv"
        ,   nameProd = "form_ptvClientProd"
        ,   formInfo
        ,   formOpt
        ,   formAdv
        ,   formProd
        ;

        $scope.param = {
            id_cust: "",
            seq: 0,

            mode_screen: -1,
            mode_play_movie: -1,
            mode_sound_intro: -1,
            mode_adult: -1,
            mode_adult_movie_view: -1,
            mode_ppv_movie_view: -1,
            mode_adt_mall_view: -1,
            mode_adt_green_view: -1,
            mode_yaya_view: -1,

            mode_start_adv_view: -1,
            mode_osd_adt_view: -1,
            mode_osd_nor_view: -1,
            mode_osd_opacity: "0",
            mode_preroll_view: -1,
            preroll_url: "",

            //mode_ppv_movie_view: -1, -- 위에 이미 존재함.
            mode_mini_adv_view: -1,
            mode_mini_adv_view2: -1,
            mode_start_app: -1,

            prod_100: -1,
            prod_010: -1,
            prod_001: -1
        };

        //$scope.info = [];
        $scope.loading = false;
        $scope.OSDOpacityList = undefined;
        $scope.currIndex = 0;
        $scope.maxWork = 0;
        $scope.workResult = [];

        function initOSDOpacityList(){
            var i
            ,   list = []
            ;

            for(i = 0; i < 260; i+=10){
                list.push( i );
            }

            list.push( 255 );

            //console.log(list);

            $scope.OSDOpacityList = list;
        }

        function onLoading($event, $data){
            if (!$scope.param.id_cust){
                alert("가맹점ID는 필수 입니다.");

                $data.param.prevent = true;

                return;
            }

            $scope.loading = true;
        }

        function offLoading(){
            $scope.loading = false;

            if ($scope.workResult.length > 0){
                $scope.$broadcast("cache.delete", {id_cust: $scope.param.id_cust});
            }
        }

        function beforeWork($event, $data){
            if (!$scope.param.id_cust){
                alert("가맹점ID는 필수 입니다.");

                $data.param.prevent = true;

                return;
            }

            if ($scope.maxWork === 0){
                if (confirm("적용 하시겠습니까?") === false){
                    $data.param.prevent = true;

                    return;
                }

                $scope.currIndex = 0;
                $scope.param.seq = 0;
                $scope.maxWork = $scope.useIP.length;
                $scope.param.ip = $scope.useIP[ 0 ];
                $scope.workResult = [];
                $scope.$broadcast("cache.delete.result.clear");
            }
        }

        initOSDOpacityList();

        $scope.onWorkResultClose = function(){
            $scope.workResult = [];
        };

        $scope.$watch("wow", function(){
            if (angular.isArray( $scope.useIP ) && ( $scope.useIP.length > 0 )){
                return;
            }

            $scope.useIP = ptvdata.filterIP( $scope.IP, $scope.wow, $scope.WOW_ONLY, $scope.PTV_ONLY );
        });

        $scope.$on( nameInfo + ".before", onLoading );
        $scope.$on( nameOpt  + ".before", beforeWork );
        $scope.$on( nameAdv  + ".before", beforeWork );
        $scope.$on( nameProd  + ".before", beforeWork );

        $scope.$on( nameOpt  + ".ready", function(event, data){
            formOpt = data.form;
        } );
        $scope.$on( nameAdv  + ".ready", function(event, data){
            formAdv = data.form;
        } );
        $scope.$on( nameProd  + ".ready", function(event, data){
            formProd = data.form;
        } );

        $scope.$on( nameInfo, function($event, $data){
            var mData = $data.response.data
            ,   mResult = mData.result
            ,   info = mData.data
            ,   key
            ,   val, iVal, sVal = ""
            ,   aPureStr = [
                    "mode_osd_opacity",
                    "preroll_url"
                ]
            ;

            for(key in info){
                val = info[key];

                if (isFinite(val) && aPureStr.indexOf(key) < 0 ){
                    $scope.param[key] = parseInt(val);
                }
                else{
                    $scope.param[key] = val
                }
            }

            $scope.workResult = [];

            offLoading();
        });

        $scope.$on( nameOpt, function($event, $data){
            ptvdata.loopWork($scope, $data.response.data, formOpt, offLoading);
        });

        $scope.$on( nameAdv, function($event, $data){
            ptvdata.loopWork($scope, $data.response.data, formAdv, offLoading);
        });

        $scope.$on( nameProd, function($event, $data){
            ptvdata.loopWork($scope, $data.response.data, formProd, offLoading);
        });
    }]);

    app.controller("PtvCache",
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModal", "ptvdata", "ptvclient",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModal, ptvdata, ptvclient){

        var nameCust = "form_cacheDeleteCustInfo"
        ,   nameAll = "form_cacheDeleteAll"
        ,   formCust
        ,   formAll
        ;

        $scope.param = {
            id_cust: ""
        };

        $scope.loading = false;
        $scope.currIndex = 0;
        $scope.maxWork = 0;
        $scope.workResult = [];
        $scope.workType = "cache";
        $scope.autoRemote = false;

        function onLoading($event, $data){
            if (!$scope.param.id_cust){
                alert("가맹점ID는 필수 입니다.");

                $data.param.prevent = true;

                return;
            }

            $scope.loading = true;
        }

        function offLoading(){
            $scope.loading = false;
            $scope.autoRemote = false;
        }

        function beforeWork($event, $data){
            if ($scope.maxWork === 0){
                if (!$scope.autoRemote && confirm("캐시를 삭제 합니다.") === false){
                    $data.param.prevent = true;

                    return;
                }

                $scope.currIndex = 0;
                $scope.maxWork = $scope.useIP.length;
                $scope.param.ip = $scope.useIP[ 0 ];
                $scope.workResult = [];
            }
        }

        $scope.onWorkResultClose = function(){
            $scope.workResult = [];
        };

        $scope.$on( nameCust + ".before", function($e, $d){
            if (!$scope.param.id_cust){
                alert("가맹점ID는 필수 입니다.");

                $data.param.prevent = true;

                return;
            }

            beforeWork($e, $d);
        } );
        $scope.$on( nameAll  + ".before", beforeWork );

        $scope.$on( nameCust  + ".ready", function(event, data){
            formCust = data.form;
        } );
        $scope.$on( nameAll  + ".ready", function(event, data){
            formAll = data.form;
        } );

        $scope.$on( nameCust, function($event, $data){
            ptvdata.loopWork($scope, $data.response.data, formCust, offLoading);
        });

        $scope.$on( nameAll, function($event, $data){
            ptvdata.loopWork($scope, $data.response.data, formAll, offLoading);
        });

        $scope.$on( "cache.delete", function($event, $data){
            //console.log($data);
            $scope.param.id_cust = $data.id_cust;
            $scope.autoRemote = true;
            formCust.submit();
        });

        $scope.$on( "cache.delete.result.clear", function($event, $data){
            $scope.workResult = [];
        });
    }]);

    app.controller("PtvBillLog",
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "$filter", "util", "$uibModal", "ptvdata", "ptvclient",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, $filter, util, $uibModal, ptvdata, ptvclient){

        var name = "form_ptvBillLog"
        ,   form
        ,   aCollect
        ;

        $scope.param = {
            id_cust: "",
            seq: 0,
            ip: "",
            dt_start: "",
            dt_end: ""
        };

        //$scope.info = [];
        $scope.loading = false;
        $scope.currIndex = 0;
        $scope.maxWork = 0;
        $scope.workResult = [];

        $scope.dtStart = new Date();
        $scope.dtEnd = new Date();
        $scope.dataLength = 0;
        $scope.list = [];


        function offLoading(){
            var mRes
            ,   key
            ,   iCnt = 0
            ,   aRes = []
            ;

            console.log("offLoading");

            mRes = _.countBy( aCollect, function(item){
                var date = new Date(item.dt_insert.replace(" ", "T"));

                console.log(date);

                return $filter("date")(date, "yyyy-MM-dd");
            } );

            aRes = _.map(mRes, function(val, key){
                return {ins_date: key, count: val};
            });

            $scope.list = _.orderBy( aRes, ["ins_date"], ["asc"] );

            $scope.loading = false;
        }

        function beforeWork($event, $data){
            if (!$scope.param.id_cust){
                alert("가맹점ID는 필수 입니다.");

                $data.param.prevent = true;

                return;
            }

            if ($scope.maxWork === 0){
                if (confirm("자료를 수집 하시겠습니까?") === false){
                    $data.param.prevent = true;

                    return;
                }

                $scope.currIndex = 0;
                $scope.param.seq = 0;
                $scope.maxWork = $scope.useIP.length;
                $scope.param.ip = $scope.useIP[ 0 ];
                $scope.param.dt_start = $filter("date")($scope.dtStart, "yyyy-MM-dd");
                $scope.param.dt_end = $filter("date")($scope.dtEnd, "yyyy-MM-dd");
                $scope.workResult = [];
                $scope.dataLength = 0;
                $scope.loading = true;
                $scope.list = [];
                aCollect = [];
            }
        }

        $scope.onWorkResultClose = function(){
            $scope.workResult = [];
        };

        $scope.$watch("wow", function(){
            if (angular.isArray( $scope.useIP ) && ( $scope.useIP.length > 0 )){
                return;
            }

            $scope.useIP = ptvdata.filterIP( $scope.IP, $scope.wow, $scope.WOW_ONLY, $scope.PTV_ONLY );
        });

        $scope.$on( name + ".before", beforeWork );

        $scope.$on( name  + ".ready", function(event, data){
            form = data.form;
        } );

        $scope.$on( name, function($event, $data){
            var data = $data.response.data;

            if (isFinite(data.count)){
                $scope.dataLength += parseInt(data.count);

                if (angular.isArray(data.data)){
                    aCollect = aCollect.concat( data.data );
                }
            }

            ptvdata.loopWork($scope, data, form, offLoading);
        });
    }]);

    app.controller("PtvContentListController", 
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModal", "ptvdata", "ptvclient",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModal, ptvdata, ptvclient){
        
        var sFormName = "form_ptvContentList",
            objform,
            endvar
        ;

        $scope.param = {
            ip: "",
            page: 1,
            count: "10"
        };

        $scope.list = [];
        $scope.totalcount = 0;
        $scope.useIP = [];
        $scope.currIndex = 0;
        $scope.maxWork = 0;
        $scope.titleMap = undefined;
        $scope.colHead = undefined;

        $scope.onPageChange = function(){
            objform.submit();
        };

        $scope.lastNum = ptvclient.lastNum;

        $scope.$on(sFormName + ".before", function($event, $data){
            if ($scope.maxWork === 0){
                $scope.list = [];
                $scope.currIndex = 0;
                $scope.totalcount = 0;
                $scope.maxWork = $scope.useIP.length;
                $scope.param.ip = $scope.useIP[ 0 ];

                $scope.titleMap = {};
            }
        });
        
        $scope.$on( sFormName, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            $scope.titleMap = ptvclient.collectByField( $scope.titleMap, $scope.useIP, $scope.param.ip, mData.data, "title" );
            
            $scope.currIndex++;
            
            if ($scope.currIndex < $scope.maxWork){
                $scope.param.ip = $scope.useIP[ $scope.currIndex ];
                objform.submit();
            }
            else{
                $scope.list = ptvclient.totalizeBy( "title", "contents", $scope.titleMap );
                $scope.totalcount = $scope.list.length;
                $timeout(function(){
                    //alert($scope.msgSearchSuccess);
                    $scope.param.ip = "";
                    $scope.maxWork = 0;
                }, 500);
            }
            
        });
        
        $scope.$on(sFormName + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormName + ".ready", function($event, $data){
            objform = $data.form;
        });

        $scope.$watch("wow", function(){
            $scope.useIP = ptvdata.filterIP( $scope.IP, $scope.wow, $scope.WOW_ONLY, $scope.PTV_ONLY );
            $scope.colHead = ptvclient.initColHead( $scope.useIP );
            //$scope.macMap = initMacMap( $scope.useIP );
        });

		//function getCount($contents, $titlename){
		$scope.IsNullChk =  function(contents){
			var Len = 0;
			var Index = -1;
			
			if(angular.isArray(contents)){
				Len = contents.length;
			}
			
			while(++Index < Len){
				if(!contents[Index])
					return false;
			}
			
			return true;
		}

		
        $scope.$on("$destroy", function(){
            

        });
    }]);


    app.controller("DBDateController", 
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModal", "ptvdata", "ptvclient",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModal, ptvdata, ptvclient){
        
        var sFormName = "form_dbDateList",
            objform,
            endvar
        ;

        $scope.param = {
            ip: "",
            page: 1,
            count: "10"
        };

        $scope.list = [];
        $scope.totalcount = 0;
        $scope.useIP = [];
        $scope.currIndex = 0;
        $scope.maxWork = 0;
        $scope.colHead = undefined;
        $scope.search = false;

        $scope.onPageChange = function(){
            objform.submit();
        };

        $scope.lastNum = ptvclient.lastNum;

        $scope.$on(sFormName + ".before", function($event, $data){
            if ($scope.maxWork === 0){
                $scope.list = [];
                $scope.currIndex = 0;
                $scope.totalcount = 0;
                $scope.maxWork = $scope.useIP.length;
                $scope.param.ip = $scope.useIP[ 0 ];
                $scope.search = false;
            }
        });

        $scope.$on( sFormName, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            $scope.currIndex++;

            $scope.list.push({
                ip: $scope.param.ip,
                date: mData.data
            });
            
            if ($scope.currIndex < $scope.maxWork){
                $scope.param.ip = $scope.useIP[ $scope.currIndex ];
                objform.submit();
            }
            else{
                $scope.totalcount = $scope.list.length;
                $scope.search = true;
                $timeout(function(){
                    //alert($scope.msgSearchSuccess);
                    $scope.param.ip = "";
                    $scope.maxWork = 0;
                }, 500);
            }
            
        });
        
        $scope.$on(sFormName + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormName + ".ready", function($event, $data){
            objform = $data.form;
        });

        $scope.$watch("wow", function(){
            $scope.useIP = ptvdata.filterIP( $scope.IP, $scope.wow, $scope.WOW_ONLY, $scope.PTV_ONLY );
            $scope.colHead = ptvclient.initColHead( $scope.useIP );
            //$scope.macMap = initMacMap( $scope.useIP );
        });

        
        $scope.$on("$destroy", function(){
            

        });
    }]);
})(angular, jQuery);