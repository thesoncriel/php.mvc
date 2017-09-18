(function(angular, $, undefined){
    "use strict";

    var app = angular.module("controller.adv", ["common.service"]);

    app.controller("AdvertiseListController", 
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModal",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModal){
        
        var sFormName = "form_advertiseList",
            objform,
            endvar
        ;

        $scope.param = {
            keyword: "",
            page: 1,
            count: 10
        };

        $scope.list = [];
        $scope.totalcount = 0;

        $scope.onItemClick = function(item){
            var modal = $uibModal.open({
                animation: true,
                templateUrl: "view/adv/adv.detail.modal.html",
                controller: "AdvertiseDetailModalController",
                resolve: {
                    item: function(){
                        return angular.copy( item );
                    }
                }
            });

            modal.result.then(function(item){
                $scope.param.page = 1;
                objform.submit();
            });
        };
        $scope.onAddClick = function(item){
            var modal = $uibModal.open({
                animation: true,
                templateUrl: "view/adv/adv.detail.modal.html",
                controller: "AdvertiseDetailModalController",
                resolve: {
                    item: function(){
                        return {
                            adv_title: "",
                            adv_type: "1",
                            adv_use: "Y",
                            duration: 60,
                            url: "http://",
                            adv_desc: ""
                        };
                    }
                }
            });

            modal.result.then(function(item){
                $scope.param.page = 1;
                objform.submit();
            });
        };
        $scope.onPageChange = function(){
            objform.submit();
        };

        $scope.$on(sFormName + ".before", function($event, $data){
            
        });
        
        $scope.$on( sFormName, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            if (mData.data){
                $scope.list = mData.data;
                $scope.totalcount = mData.count;
            }
            else{
                $scope.list = [];
                $scope.totalcount = 0;
            }

            
        });
        
        $scope.$on(sFormName + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormName + ".ready", function($event, $data){
            objform = $data.form;
        });

        $scope.$on("$destroy", function(){
            
        });
    }]);

    app.controller("AdvertiseDetailModalController", 
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModalInstance", "item",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModalInstance, item){
        
        var sFormName = "form_advModifyForModal",
            objform,
            advId,
            endvar
        ;

        if (item){
            item.duration = parseInt( item.duration );
        }
        $scope.item = item;
        $scope.param = item;

        $scope.ok = function(){
            objform.submit();
        };
        $scope.cancel = function(){
            $uibModalInstance.close();
        };
        $scope.remove = function(){
            $scope.param.adv_type = 0;
            objform.submit();
        };

        $scope.$on(sFormName + ".before", function($event, $data){
            
        });
        
        $scope.$on( sFormName, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            if (mResult.valid){
                $uibModalInstance.close( $scope.param );
            }
        });
        
        $scope.$on(sFormName + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormName + ".ready", function($event, $data){
            objform = $data.form;
        });

        $scope.$on("$destroy", function(){
            
        });
    }]);

    app.controller("AdvertiseApplyModalController", 
        ["$scope", "$rootScope", "$location", "$document", "$state", "$stateParams", "$timeout", "util", "$uibModalInstance", "schedule",
        function($scope, $rootScope, $location, $document, $state, $stateParams, $timeout, util, $uibModalInstance, schedule){
        
        var sFormName = "form_advListForModal",
            sFormName_adv = "form_advForModal",
            sFormName_apply = "form_advApplyForModal",
            objform,
            objform_adv,
            objform_apply,
            endvar
        ;

        $scope.schedule = schedule;
        $scope.adv = {};
        $scope.param_adv = {
            adv_id: schedule.adv_id
        };
        $scope.param = {
            page: 1,
            count: 5,
            keyword: ""
        };
        $scope.param_apply = {
            schedule_id: 0,
            adv_id: 0
        };
        $scope.list = [];
        $scope.selectedItem = undefined;

        $scope.clearSelected = function(){
            var list = $scope.list,
                iLen = list.length,
                i = -1
            ;

            while(++i < iLen){
                list[i].selected = false;
            }
        };

        $scope.onItemClick = function(item){
            $scope.clearSelected();
            item.selected = true;
            $scope.selectedItem = item;
        };
        $scope.onPageChange = function(){
            objform.submit();
        };

        $scope.apply = function(){
            var param = $scope.param_apply
            ;
            param.schedule_id = $scope.schedule.schedule_id;
            param.adv_id = $scope.selectedItem.adv_id;

            objform_apply.submit();
        };
        $scope.cancel = function(){
            $uibModalInstance.dismiss("cancel");
        };

        $scope.hmFormat = function(datetime){
            return util.hmFormat( new Date(datetime) );
        };

        $scope.hmsFormat = util.convertSecondToTime;

        // list
        // list
        $scope.$on(sFormName + ".before", function($event, $data){
            
        });
        
        $scope.$on( sFormName, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            $scope.list = mData.data;
            $scope.totalcount = mData.count;
            $scope.selectedItem = undefined;
        });
        
        $scope.$on(sFormName + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormName + ".ready", function($event, $data){
            objform = $data.form;
        });

        // adv
        // adv
        $scope.$on(sFormName_adv + ".before", function($event, $data){
            
        });
        
        $scope.$on( sFormName_adv, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            $scope.adv = mData.data;
        });
        
        $scope.$on(sFormName_adv + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormName_adv + ".ready", function($event, $data){
            objform_adv = $data.form;
        });

        // apply
        // apply
        $scope.$on(sFormName_apply + ".before", function($event, $data){
            
        });
        
        $scope.$on( sFormName_apply, function($event, $data){
            var mData = $data.response.data,
                mResult = mData.result
            ;

            if (mResult.valid){
                $uibModalInstance.close( $scope.selectedItem );
            }
        });
        
        $scope.$on(sFormName_apply + ".fail", function($event, $data){
            
        });
        
        $scope.$on(sFormName_apply + ".ready", function($event, $data){
            objform_apply = $data.form;
        });

        $scope.$on("$destroy", function(){
            
        });
    }]);
})(angular, jQuery);