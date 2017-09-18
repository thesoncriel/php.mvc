(function(angular, $, undefined){
    "use strict";

    var app = angular.module("controller.schedule", ["common.service", "day-selector", "schedule.directive", "schedule.service"]);

    // 등록 요청 목록
    app.controller("AdultScheduleSortableController", 
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "$uibModal", "util", "scheduleService", "daySelectorAPI",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, $uibModal, util, service, daySelectorAPI){
        
        var sFormName = "form_adultScheduleList",
            sFormName_oc = "form_adultScheduleOrderChange",
            sFormName_cont = "form_adultContentList",
            sFormName_ins = "form_adultScheduleInsert",
            sFormName_del = "form_adultScheduleDelete",
            sFormName_auto = "form_adultScheduleAppendAuto",
            sFormName_adterm = "form_adultScheduleAdTerm",
            objform,
            objform_oc,
            objform_cont,
            objform_ins,
            objform_del,
            objform_auto,
            objform_adterm,
            changedItem,
            indexOcSource,
            indexOcDest,
            indexDeleteReady,
            endvar
        ;

        $scope.$on( "$stateChangeSuccess", function(val){
            var date = new Date();

            daySelectorAPI.value = date;// 파라메터가 달라지면 날짜 선택기 값을 오늘로 초기화
            $scope.param.date = date
            $scope.param.channel = $state.params.channel;

            objform.submit();
        } );

        console.log("scope", $scope);


        // schedule list
        // schedule list
        $scope.sortableOption = {
            containment: "#panel_adultSchedule",
            orderChanged: function(event){

                //console.log(event);
                // var indexSrc = event.source.index,
                //     indexDest = event.dest.index,
                //     itemSrc,
                //     itemDest,// = $scope.list[ indexDest ],
                //     param = $scope.param_oc,
                //     isBottomToUp = true
                //     ;

                // console.log( event );

                // if (indexSrc > indexDest){
                    
                // }
                // else{
                //     isBottomToUp = false;
                // }

                // itemSrc = $scope.list[ indexSrc ];
                // itemDest = $scope.list[ indexDest ];

                // param.schedule_id = itemDest.schedule_id;
                // param.dt_from = itemSrc.dt_bc_start;
                // param.dt_to = itemDest.dt_bc_start;
                // param.running_time = itemDest.running_time;

                // changedItem = itemDest;
                // indexOcSource = event.source.index;
                // indexOcDest = event.dest.index;

                // console.log( "itemSrc.dt", itemSrc.dt_bc_start );
                // console.log( "itemDest.dt", itemDest.dt_bc_start );
                // console.log( "itemSrc.t", itemSrc.title );
                // console.log( "itemDest.t", itemDest.title );

                // console.log( "indexOcSource", indexOcSource );
                // console.log( "indexOcDest", indexOcDest );
                
                // objform_oc.submit();
            },
            itemMoved: function(event){
                console.log(event);
            }
        };

        $scope.dtServer = undefined;
        $scope.param = {
            date: util.dateFormat( new Date() ),
            channel: $stateParams.channel
        };
        $scope.config = {};
        $scope.list = [];
        $scope.daySelectorOptions = {
            click: function(event){
                $scope.param.date = event.dateStr;
                
                objform.submit();
            }
        };

        $scope.calcHeight = function(runningTime){
            var iRT = parseInt( runningTime ),
                iSnapTime = 60,//$scope.config.snapTime,
                iRet = iRT - (iRT % iSnapTime),
                dHeight = (iRet / 86400) * 100;

            return dHeight;
        };
        $scope.hmFormat = function(datetime){
            return util.hmFormat( new Date(datetime) );
        };
        $scope.hmsFormat = util.convertSecondToTime;

        // schedule delete
        $scope.param_del = {
            schedule_id: -1,
            running_time: 0,
            channel: $stateParams.channel
        };
        $scope.onDeleteClick = function(item, index){
            var param = $scope.param_del;

            param.schedule_id = item.schedule_id;

            indexDeleteReady = index;

            objform_del.submit();
        };
        $scope.onAdvModifyClick = function(item, index){
            var modal = $uibModal.open({
                animation: true,
                templateUrl: "view/adv/adv.list.modal.html",
                controller: "AdvertiseApplyModalController",
                resolve: {
                    schedule: function(){
                        return item;
                    }
                }
            });

            modal.result.then(function(advItem){
                if (advItem){
                    item.adv_id = advItem.adv_id;
                }
            });
        };
        $scope.onAdvDetailClick = function(item, index){
            var modal = $uibModal.open({
                animation: true,
                templateUrl: "view/adv/adv.detail.readonly.modal.html",
                controller: "AdvertiseApplyModalController",
                resolve: {
                    schedule: function(){
                        return item;
                    }
                }
            });

            modal.result.then(function(advItem){
                if (advItem){
                    item.adv_id = advItem.adv_id;
                }
            });
        };

        // order change
        $scope.param_oc = {
            schedule_id: -1,
            dt_from: "",
            dt_to: "",
            running_time: 0,
            channel: $stateParams.channel
        };

        // schedule insert
        $scope.param_ins = {
            dt_bc_start: "",
            content_id: "",
            running_time: 0,
            channel: $stateParams.channel
        };

        // content list
        $scope.contentCloneOption = {
            containment: "#panel_adultSchedule",
            clone: true,
            itemMoved: function(event){
                var indexDest = event.dest.index,
                    scopeDest = event.dest.sortableScope,
                    itemDest = scopeDest.modelValue[ indexDest ],
                    itemPushed = scopeDest.modelValue[ indexDest + 1 ],
                    param = $scope.param_ins
                ;

                if (!itemPushed){
                    return;
                }

                param.dt_bc_start = itemPushed.dt_bc_start;
                param.content_id = itemDest.content_id;
                param.running_time = itemDest.running_time;

                console.log( "itemDest", itemDest );

                console.log("contentCloneOption");
                console.log(event);
                console.log( event.dest.sortableScope );

                objform_ins.submit();
            }
        };
        $scope.param_cont = {
            keyword: "",
            page: 1,
            count: 20
        };
        $scope.contentList = [];
        $scope.contentCount = 0;

        $scope.onPageChange = function(){
            objform_cont.submit();
        };



        function relocateDate(indexStart, indexEnd, datetime){
            var list = $scope.list,
                i = indexStart,
                max = indexEnd,
                mStart;

            mStart = list[ indexStart ];

            i--;

            while(++i <= max){
                list[i].dt_bc_start = blah( datetime )
            }
        }

        function applyPushDateToAfterSchedules(item, list, snapTime){
            var i = 0,
                iOcSource = indexOcSource,
                iOcDest = indexOcDest,
                iPushed = iOcDest,
                iMax = 0,
                iRunningTime = parseInt( item.running_time ),
                sDateAfterApply,
                u = util;

            // 스케줄을 위로 올렸을 때
            if (iOcSource > iOcDest){
                i = iOcDest;
                iMax = iOcSource;
                iPushed++;
            }
            else{
                iMax = iOcDest;
                i = iOcSource;
                iPushed--;
                iRunningTime *= -1;
            }

            sDateAfterApply = list[ iPushed ].dt_bc_start;

            i -= 1;

            while(++i <= iMax){
                console.log( list[i].title );
                console.log("before", list[ i ].dt_bc_start);
                list[ i ].dt_bc_start = u.calcSnappedNextDatetime( list[ i ].dt_bc_start, iRunningTime, snapTime );
                console.log("after", list[ i ].dt_bc_start);
            }

            list[ iOcDest ].dt_bc_start = sDateAfterApply;

            console.log( "name", list[ iOcDest ].title );
            console.log( "sDateAfterApply", sDateAfterApply );
            console.log( "iOcSource", iOcSource );
            console.log( "iOcDest", iOcDest );

            return list;
        };
        
        // schedule list
        // schedule list
        $scope.$on(sFormName + ".before", function($event, $data){
            
        });
        $scope.$on( sFormName, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result,
                mConfig = $scope.config;
            
            if (angular.isArray(mData.data)){
                $scope.list = mData.data;
                $scope.totalcount = mData.data.length;
            }
            else{
                $scope.list = [];
                $scope.totalcount = 0;
            }
            

            if (mData.info){
                mConfig.adTerm = parseInt( mData.info.ad_term );
                mConfig.autoCount = parseInt( mData.info.auto_count );
                mConfig.noDupCount = parseInt( mData.info.no_dup_count );
            }
            else{
                mConfig = {
                    adTerm: 100,
                    autoCount: 40,
                    noDupCount: 10
                };
            }

            $scope.config = mConfig;
            $scope.dtServer = mData.dtServer;

            //objform_cont.submit();
        });
        $scope.$on(sFormName + ".fail", function($event, $data){
            
        });
        $scope.$on(sFormName + ".ready", function($event, $data){
            objform = $data.form;
        });

        // order change
        // order change
        $scope.$on(sFormName_oc + ".before", function($event, $data){
            
        });
        $scope.$on( sFormName_oc, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result;

            //applyPushDateToAfterSchedules( changedItem, $scope.list, $scope.config.snapTime )
        });
        $scope.$on(sFormName_oc + ".fail", function($event, $data){
            
        });
        $scope.$on(sFormName_oc + ".ready", function($event, $data){
            objform_oc = $data.form;
        });

        // schedule insert
        // schedule insert
        $scope.$on(sFormName_ins + ".before", function($event, $data){
            
        });
        $scope.$on( sFormName_ins, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            console.log( "sFormName_ins success ", mData );
            //applyPushDateToAfterSchedules( changedItem, $scope.list, $scope.config.snapTime )
        });
        $scope.$on(sFormName_ins + ".fail", function($event, $data){
            
        });
        $scope.$on(sFormName_ins + ".ready", function($event, $data){
            objform_ins = $data.form;
        });

        // content list
        // content list
        $scope.$on(sFormName_cont + ".before", function($event, $data){
            
        });
        $scope.$on( sFormName_cont, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result;

            $scope.contentList = mData.data;
            $scope.contentCount = mData.count;
            //applyPushDateToAfterSchedules( changedItem, $scope.list, $scope.config.snapTime )
        });
        $scope.$on(sFormName_cont + ".fail", function($event, $data){
            
        });
        $scope.$on(sFormName_cont + ".ready", function($event, $data){
            objform_cont = $data.form;
        });

        // schedule delete
        // schedule delete
        $scope.$on(sFormName_del + ".before", function($event, $data){
            
        });
        $scope.$on( sFormName_del, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result;

            $scope.list.splice( indexDeleteReady, 1 );
            //applyPushDateToAfterSchedules( changedItem, $scope.list, $scope.config.snapTime )
        });
        $scope.$on(sFormName_del + ".fail", function($event, $data){
            
        });
        $scope.$on(sFormName_del + ".ready", function($event, $data){
            objform_del = $data.form;
        });

        // schedule auto append
        // schedule auto append
        $scope.$on(sFormName_auto + ".before", function($event, $data){
            
        });
        $scope.$on( sFormName_auto, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result,
                msg = $scope.msgAutoSuccess
            ;

            if (mData.info){
                msg = msg.replace( "%n1", mData.info.ch1 );
                msg = msg.replace( "%n2", mData.info.ch2 );
                alert(msg);
            }


            //applyPushDateToAfterSchedules( changedItem, $scope.list, $scope.config.snapTime )
        });
        $scope.$on(sFormName_auto + ".fail", function($event, $data){
            
        });
        $scope.$on(sFormName_auto + ".ready", function($event, $data){
            objform_auto = $data.form;
        });

        // schedule AD Term
        // schedule AD Term
        $scope.$on(sFormName_adterm + ".before", function($event, $data){
            
        });
        $scope.$on( sFormName_adterm, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result,
                msg = $scope.msgAdtermSuccess
            ;

            alert(msg);

            //$scope.config.adTerm = $data

            //applyPushDateToAfterSchedules( changedItem, $scope.list, $scope.config.snapTime )
        });
        $scope.$on(sFormName_adterm + ".fail", function($event, $data){
            
        });
        $scope.$on(sFormName_adterm + ".ready", function($event, $data){
            objform_auto = $data.form;
        });


        $scope.$on("$destroy", function(){
            
        });
    }]);
})(angular, jQuery);