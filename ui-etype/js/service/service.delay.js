;define("delay", function(){
	var mSerialCache = {}
	,	delayWork
	,	api
	;

	/*
	@desc
	특정 Array 데이터에 대하여 끊어서 callback을 수행한다.
	@params
	list = 딜레이를 적용하며 수행될 Array.
	max = 한번에 수행되는 개수
	delay = 수행 간격 시간 (ms)
	callback = 수행 함수. 내부에서 return 값을 false 로 주면 중지 한다.
	thisObj = callback 내부에서 this로 접근 할 객체

	※ 아래는 직접 쓰는 일 없음
	index = (Option) 시작되는 위치
	length = (Option) 자료 길이
	*/
	delayWork = function(list, max, delay, callback, thisObj, index, length, workSerial){
		var iLen
		,	i
		,	iFullLen
		,	isLast = false
		,	bCallbackRet
		,	isFirst = false
		,	serial = 0
		,	date
		;

		// 새로 할 때
		if (index === undefined){
			if (Object.prototype.toString.call(list).slice(8, -1) !== "Array"){
				return false;
			}

			iFullLen = list.length;

			// 데이터 길이가 수행 개수랑 같다면
			// 한번만 수행하고 종료.
			if (iFullLen <= max){
				isLast = true;
			}

			iLen = max;
			index = 0;
			isFirst = true;
		}
		// 계속 이어서 할 때
		else if (index > 0){
			if (index >= length){
				return true;
			}

			// 마지막..
			if ((index + max) >= length){
				isLast = true;
				iLen = length - index;
			}
			// 계속...
			else{
				iLen = max;
			}

			iFullLen = length;

			//callback.call(thisObj, list.slice(index, iLen), index, length);
		}
		// -_-???
		else{
			return false;
		}

		bCallbackRet = callback.call(thisObj, list.slice(index, index + iLen), index, iFullLen, isLast);

		if (bCallbackRet === false){
			return true;
		}

		if (isLast){
			return true;
		}

		if (isFirst){
			date = new Date();
			workSerial = date.getTime();
		}

		serial = setTimeout(function(){
			delayWork( list, max, delay, callback, thisObj, index+=max, iFullLen, workSerial );
		}, delay);

		mSerialCache[ workSerial ] = serial;

		return workSerial;
	};

	

	return function(list, max, delay){
		return function(callback, thisObj){
			var serial = delayWork(list, max, delay, callback, thisObj)
			,	api = {
				id: 0,
				stop: function(serial){
					if (serial === undefined){
						serial = this.id;
					}

					clearTimeout( mSerialCache[ serial ] );
				},
				stopAll: function(){
					var m = mSerialCache
					,	key
					;

					for(key in m){
						clearTimeout( m[ key ] );
					}
				},
				pause: function(time){

				}
			};// api [end]

			api.id = serial;

			return api;
		};// return [end]
	};
});