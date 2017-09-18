;define("service.cache", [], function(undefined){
	var mCache = {}
	,	mTimeLimit = {}
	,	aKey = []
	,	max = 100
	,	fnCache
	;

	return {
		get: function(key){
			if (this.isTimeout(key)){
				this.remove( key );

				return undefined;
			}

			return mCache[ key ];
		},
		put: function(key, val, time){
			var iTime = (time)? parseInt(time) : 0
			,	date
			,	iTimeNow
			,	sOldKey
			,	iCount = aKey.length
			;

			iCount++;

			if (iCount > max){
				sOldKey = aKey.pop();
				this.remove( sOldKey );
			}

			mCache[ key ] = val;
			aKey.push( key );

			if (iTime > 0){
				date = new Date();
				iTimeNow = date.getTime();
				mTimeLimit[ key ] = iTimeNow + (iTime * 1000);
			}
			else{
				mTimeLimit[ key ] = 0;
			}
		},
		remove: function(key){
			delete mCache[ key ];
			delete mTimeLimit[ key ];
		},
		isTimeout: function(key){
			var date
			,	iTimeNow
			,	iTimeLimit = mTimeLimit[ key ]
			,	iTimeRec
			;

			if (iTimeLimit === 0){
				return false
			}

			date = new Date();
			iTimeNow = date.getTime();

			return iTimeNow >= iTimeLimit;
		}
	};
});