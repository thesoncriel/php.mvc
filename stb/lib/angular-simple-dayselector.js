(function(angular){
	var app = angular.module("day-selector", []);

app.factory("daySelectorAPI", function(){
	return {
		value: ""
	};
});

app.directive("daySelector", function(){
	var undefined;
	
	return {
		restrict: "A",
		scope: {
			options: "=?",
			events: "=?"
		},
		template: function(elem, attr){
			var sInnerTemplate = elem.html();
			
			if (!sInnerTemplate){
				sInnerTemplate = "{{year}} {{month}} {{day}} {{weekday}}";
			}
			
			return '<div class="simple-day-selector day-selector simple-calendar">' +
				'<div class="current-day current-month">' +
					'<span class="move-month prev-month" ng-click="prev()"><span class="prev" ng-class="{active: allowedPrev()}">&#x2039;</span></span>' +
					'<span>' + sInnerTemplate + '</span>' +
					'<span class="move-month next-month" ng-click="next()"><span class="next" ng-class="{active: allowedNext()}">&#x203a;</span></span>' +
				'</div>' +
			'</div>';
		},
		controller: ["$scope", "daySelectorAPI", function($scope, api){
/************************************************************************************
INNER METHODS
************************************************************************************/
function isOwnWeek(d, wd){
	/*
	var iwd 			= wd || 4,
		iWeekday 		= d.getDay(),
		iTime			= d.getTime(),
		dateStart 		= new Date( d.getFullYear(), d.getMonth(), 1 ),
		dateEnd 		= new Date( d.getFullYear(), d.getMonth() + 1, 0 ),
		iWeekdayStart 	= dateStart.getDay(),
		iWeekdayEnd 	= dateEnd.getDay(),
		dateFirstWeekEnd 	= new Date( d.getFullYear(), d.getMonth(), 1 + 6 - iWeekdayStart ),
		dateLastWeekEnd 	= new Date( d.getFullYear(), d.getMonth(), dateEnd.getDate() + 6 - iWeekdayEnd ),
		dateLastWeekStart	= new Date( dateLastWeekEnd.getFullYear(), dateLastWeekEnd.getMonth(), dateLastWeekEnd.getDate() - 6 ),
		iFirstWeekEndTime 	= dateFirstWeekEnd.getTime(),
		iLastWeekEndTime 	= dateLastWeekEnd.getTime(),
		iLastWeekStartTime	= dateLastWeekStart.getTime(),
		isMineFirstWeek 	= iWeekdayStart <= iwd,
		isMineLastWeek 		= iWeekdayStart > iwd,
		isFirstWeek 		= iTime <= iFirstWeekEndTime,
		isLastWeek 			= (iTime >= iLastWeekStartTime) && (iTime <= iLastWeekEndTime)
	;
	
	//console.log("iFirstWeekEndTime? :", iFirstWeekEndTime);
	//console.log("iLastWeekEndTime? :", iLastWeekEndTime);
	//console.log("mine :", d.toString());
	//console.log("isMineFirstWeek? :", isMineFirstWeek);
	//console.log("isMineLastWeek? :", isMineLastWeek);
	//console.log("isFirstWeek? :", isFirstWeek, dateFirstWeekEnd.toString());
	//console.log("isLastWeek? :", isLastWeek, dateLastWeekStart.toString(), dateLastWeekEnd.toString());
	
	if (!isMineFirstWeek && isFirstWeek){
		return -1;
	}
	
	if (!isMineLastWeek && isLastWeek){
		return 1;
	}
	*/
	return 0;
}
/* For a given date, get the ISO week number
 *
 * Based on information at:
 *
 *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
 *
 * Algorithm is to find nearest thursday, it's year
 * is the year of the week number. Then get weeks
 * between that date and the first day of that year.
 *
 * Note that dates in one year can be weeks of previous
 * or next year, overlap is up to 3 days.
 *
 * e.g. 2014/12/29 is Monday in week  1 of 2015
 *      2012/1/1   is Sunday in week 52 of 2011
 */
function getWeekNumber(d1, wd) {
    // Copy date so don't modify original
    var d = new Date(+d1);
    d.setHours(0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    
    // Get first day of year
    var yearStart = new Date(d1.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d1 - yearStart) / 86400000) + 1)/7);
    
    var iMonth = d.getMonth(),
    	prevMonthWeek = 0,
    	iWeekNoMonth = weekNo,
    	iwd = wd || 4,
    	dateCurrMonth = new Date(d.getFullYear(), 1, 1),
    	iCurrMonth_startWeek = dateCurrMonth.getDay(),
    	prevMonthFlag = 0,
    	iYearForWeeks = d.getFullYear();
    
    if ((iMonth === 11) && (weekNo === 1)){
    	prevMonthFlag = 1;
    	iYearForWeeks++;
    }
    
    iWeekNoMonth = 0;
    //prevMonthFlag = isOwnWeek(d1);
    
    //console.log("getWeekNumber", "month=" + iMonth, [weekNo, iWeekNoMonth, prevMonthFlag]);
    
	// Return array of year and week number
    return [weekNo, iWeekNoMonth, prevMonthFlag, iYearForWeeks];
}
/************************************************************************************
LOCAL VARIABLES
************************************************************************************/
			var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      		var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			var WEEKDAYSKOR = ["일", "월", "화", "수", "목", "금", "토"];
/************************************************************************************
LOCAL METHODS
************************************************************************************/
      		var allowedDate = function (date) {
		        if (!$scope.options.minDate && !$scope.options.maxDate) {
		          return true;
		        }
		        var currDate = new Date([date.year, date.month + 1, date.day]);
		        if ($scope.options.minDate && (currDate < $scope.options.minDate)) { return false; }
		        if ($scope.options.maxDate && (currDate > $scope.options.maxDate)) { return false; }
		        return true;
		      };
		      
		    var calculateSelectedDate = function (weekInfo) {
		    	var mWeekInfo = weekInfo;
		    	
		        $scope.year 	= mWeekInfo.year;
		        $scope.month 	= mWeekInfo.month;
		        $scope.day 		= mWeekInfo.day;
		        $scope.weekday 	= mWeekInfo.weekday;
				$scope.weekdayEng = mWeekInfo.weekdayEng;
				$scope.weekdayKor = mWeekInfo.weekdayKor;
		        $scope.weekno 	= mWeekInfo.weeksYear;
		        $scope.weeknomonth	= mWeekInfo.weeksMonth;
		        $scope.selectedDate = mWeekInfo.date;
		    };
		      
		    var initSelectedDate = function(){
		    	var mWeekInfo;
		    	
		    	if ($scope.options.defaultDate) {
		          $scope.options._defaultDate = new Date($scope.options.defaultDate);
		        } else {
		          $scope.options._defaultDate = new Date();
		        }
		        
		        $scope.selectedDate = $scope.options._defaultDate;
		        mWeekInfo = getWeekInfoCase( $scope.options.type, $scope.selectedDate );
				calculateSelectedDate(mWeekInfo);
		    };
		      
		    var getMaxDay = function (date){
		    	var date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		    	
		    	return date.getDate();
		    };
		    
		    var addDate = function (date, inc){
		    	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + inc);
		    };
		    
		    var dateFormat = function (date){
		    	var iMonth = date.getMonth() + 1,
		    		iYear = date.getFullYear(),
		    		iDay = date.getDate(),
		    		sMonth = (iMonth < 10)? "0" + iMonth : iMonth,
		    		sDay = (iDay < 10)? "0" + iDay : iDay;
		    	
		    	return iYear + "-" + sMonth + "-" + sDay;
		    };
		    
		    var getWeekInfo = function (date, startDay, inc){
		    	var dateCurr = date,
		    		iInc = inc || 0,
		    		iStartDay = startDay || 0,
		    		iCurrDay,
		    		dateStart,
		    		dateEnd,
		    		aWeekNo,
		    		iPrevFlag,
		    		iYear,
		    		iMonth,
		    		mRet
		    		;
		    	
		    	try{
		    		iInc = parseInt( iInc );
		    		
		    		if (iInc === NaN){
		    			throw "inc is not number.";
		    		}
		    	}catch(e){}
		    	
		    	if (iInc !== 0){
		    		dateCurr = addDate( date, iInc * 7 );
		    	}
		    	
		    	iCurrDay = dateCurr.getDay();
		    	dateStart = addDate( dateCurr, (-1 * iCurrDay) + iStartDay );

		    	dateEnd = addDate( dateCurr, 6 - iCurrDay + iStartDay );
		    	aWeekNo = getWeekNumber( dateEnd );
		    	
		    	iPrevFlag = 0;//aWeekNo[ 2 ];
		    	if (inc === undefined){
					iMonth = date.getMonth() + iPrevFlag;
		    	}
		    	else{
		    		iMonth = dateEnd.getMonth() + iPrevFlag;
		    	}
		    	
		    	iYear = dateCurr.getFullYear();// + aWeekNo[2];
		    	
		    	//console.log("getWeekInfo::", dateCurr.toString());
		    	
		    	if (iMonth < 0){
		    		iMonth = 11;
		    	}
		    	if (iMonth > 11){
		    		iMonth = 0;
		    	}
		    	
		    	mRet = {
		    		year:		iYear,
		    		yearForWeeks:	aWeekNo[3],
		    		month:		iMonth + 1,
		    		monthEng:	MONTHS[ iMonth ],
		    		day:		dateCurr.getDate(),
					weekday: 	dateCurr.getDay(),
		    		weekdayEng:	WEEKDAYS[ dateCurr.getDay() ],
					weekdayKor:		WEEKDAYSKOR[ dateCurr.getDay() ],
		    		date: 		dateCurr,
		    		dateStr:	dateFormat( dateCurr ),
		    		start: 		dateStart,
		    		startStr: 	dateFormat( dateStart ),
		    		end:		dateEnd,
		    		endStr: 	dateFormat( dateEnd ),
		    		weeksYear:	aWeekNo[0],
		    		weeksMonth:	aWeekNo[1],
		    		prevMonthFlag: aWeekNo[2]
		    	};
		    	
		    	//console.log("getWeekInfo", mRet);
		    	//console.log("startStr", mRet.startStr);
		    	//console.log("endStr", mRet.endStr);
		    	
		    	return mRet
		    };
		    
		    var getWeekInfoCase = function(type, datePrev, addDirection){
		    	var date,
		        	iAddDirection = addDirection || 0,
		        	mWeekInfo;
		        
		        switch(type){
		        	case "day":
		        		date = addDate( datePrev, iAddDirection );
		        		mWeekInfo = getWeekInfo( date, 1 );
		        		break;
		        	case "week":
		        		date = datePrev;
		        		mWeekInfo = getWeekInfo( date, 1, iAddDirection );
		        		mWeekInfo.year = mWeekInfo.yearForWeeks;
		        		break;
		        	case "month":
		        		date = new Date( datePrev.getFullYear(), datePrev.getMonth() + iAddDirection, 1 );
		        		mWeekInfo = getWeekInfo( date, 1 );
		        }
		        
		        return mWeekInfo;
		    };
		    
		    var getNextDate = function(type, currDate, direction){
		    	var iDir = direction || 1,
		    		iYear = currDate.getFullYear(),
		    		iMonth = currDate.getMonth(),
		    		iDate = currDate.getDate();
		    	
		    	switch(type){
		    		case "day":
		    			return new Date( iYear, iMonth, iDate + (1 * iDir) );
		    			break;
		    		case "week":
		    			return new Date( iYear, iMonth, iDate + (7 * iDir) );
		    			break;
		    		case "month":
		    			return new Date( iYear, iMonth + (1 * iDir), 1 );
		    			break;
		    	}
		    	
		    	return currDate;
		    };
/************************************************************************************
SCOPE METHODS
************************************************************************************/
			$scope.hasPrevInfo = function(){
				try{
					return $scope.options.hasOwnProperty("prev");
				}
				catch(e){}
				
				return false;
			};
			$scope.hasNextInfo = function(){
				try{
					return $scope.options.hasOwnProperty("next");
				}
				catch(e){}
				
				return false;
			};
			
			$scope._checkValidData = function(mInfo){
				var mRet = {};
				
				if ((!mInfo.year) || (!mInfo.month)){
					mRet.year = $scope.selectedDate.getFullYear();
					mRet.month = $scope.selectedDate.getMonth() + 1;
				}
				else{
					mRet.year = parseInt(mInfo.year);
					mRet.month = parseInt(mInfo.month);
				}
				
				//console.log("_checkValidData", mRet);
				
				return mRet;
			};
			
			$scope.getPrevInfo = function(){
				return $scope._checkValidData( $scope.options.prev );
			};
			$scope.getNextInfo = function(){
				return $scope._checkValidData( $scope.options.next );
			};
			
			$scope.getPrevInfoDate = function(){
				var mInfo = $scope.getPrevInfo();
				
				return new Date(mInfo.year, mInfo.month - 1, 1);
			};
			$scope.getNextInfoDate = function(){
				var mInfo = $scope.getNextInfo();
				
				return new Date(mInfo.year, mInfo.month - 1, 1);
			};
			
			$scope.allowPrevByInfo = function(){
				try{
					var mInfo = $scope.getPrevInfo(),
						date = $scope.selectedDate,
						prevDate = new Date(mInfo.year, mInfo.month - 1, 1)
						;
					
					//console.log("allowPrevByInfo", mInfo, date.toString());
						
					return prevDate.getTime() < date.getTime();
				}
				catch(e){}
				
				return false;
			};
			$scope.allowNextByInfo = function(){
				try{
					var mInfo = $scope.getNextInfo(),
						date = $scope.selectedDate,
						nextDate = new Date(mInfo.year, mInfo.month - 1, 1)
						;
					
					//console.log("allowNextByInfo", mInfo, date.toString());
						
					return nextDate.getTime() > date.getTime();
				}
				catch(e){}
				
				return false;
			};
			

      		$scope.allowedPrev = function () {
		        if (!$scope.options.minDate || !$scope.selectedDate) { return true; }

		        var prevDate,
		        	minDate = $scope.options.minDate,
		        	bRet
		        	;
		        	
		        	if ($scope.hasPrevInfo()){
		        		bRet = $scope.allowPrevByInfo();
		        	}
		        	else{
		        		prevDate = getNextDate( $scope.options.type, $scope.selectedDate, -1 ),
		        		bRet = prevDate.getTime() > minDate.getTime();
		        	}
		        
		        return bRet;
		      };
		
		      $scope.allowedNext = function () {
		      	if (!$scope.options.maxDate || !$scope.selectedDate) { return true; }
		      	
		        var nextDate,
		        	maxDate = $scope.options.maxDate,
		        	bRet
		        	;
		        	
		        	if ($scope.hasNextInfo()){
		        		bRet = $scope.allowNextByInfo();
		        	}
		        	else{
		        		nextDate = getNextDate( $scope.options.type, $scope.selectedDate, 1 ),
		        		bRet = nextDate.getTime() < maxDate.getTime();
		        	}
		        
		        return bRet;
		      };
		      
		    $scope.prev = function () {
		        if (!$scope.allowedPrev()) { return; }
		        
		        var mWeekInfo,
		        	date;
		        	
		        if ($scope.hasPrevInfo()){
		        	date = $scope.getPrevInfoDate();
		        	mWeekInfo = getWeekInfoCase( $scope.options.type, date, 0 );
		        }
		        else{
		        	date = $scope.selectedDate;
		        	mWeekInfo = getWeekInfoCase( $scope.options.type, date, -1 );
		        }
		        
		        calculateSelectedDate(mWeekInfo);

		        try{
		        	$scope.options.click( mWeekInfo );
		        }catch(e){}
		      };
		
		      $scope.next = function () {
		        if (!$scope.allowedNext()) { return; }
		        
		        var mWeekInfo,
		        	date;
		        
		        if ($scope.hasNextInfo()){
		        	date = $scope.getNextInfoDate();
		        	mWeekInfo = getWeekInfoCase( $scope.options.type, date, 0 );
		        }
		        else{
		        	date = $scope.selectedDate;
		        	mWeekInfo = getWeekInfoCase( $scope.options.type, date, 1 );
		        }
		        
		        calculateSelectedDate(mWeekInfo);

		        try{
		        	$scope.options.click( mWeekInfo );
		        }catch(e){}
		      };
/************************************************************************************
SCOPE MEMBERS
************************************************************************************/
      		$scope.options = $scope.options || {};
      		
      		if ($scope.options.minDate){
      			$scope.options.minDate = new Date( $scope.options.minDate );
      		}
      		if ($scope.options.maxDate){
      			$scope.options.maxDate = new Date( $scope.options.maxDate );
      		}
      		if (!$scope.options.type || $scope.options.type === "date"){
      			$scope.options.type = "day";
      		}
      		
      		$scope.$watch('options.defaultDate', function() {
		    	initSelectedDate();
		    });

		    $scope.api = api;
		    $scope.$watch("api.value", function(){
		    	var mWeekInfo = getWeekInfoCase( $scope.options.type, $scope.api.value, 0 );
		        
		        calculateSelectedDate(mWeekInfo);
		    });
      		
		}] // controller [end]
		
	};
});
})(angular);