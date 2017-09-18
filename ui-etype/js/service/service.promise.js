;define("promise", function(){
	var $p = function(fn){
		var self = this
		;

		this.resolve = function(){
			if (typeof self._cbDone === "function"){
				self._cbDone.apply( this, arguments );
				self.anyway.apply( this, arguments );
			}
			else{
				self._iw = "done";
				self._iwArgs = arguments;
			}
		};
		this.reject = function(){
			if (typeof self._cbFail === "function"){
				self._cbFail.apply( this, arguments );
				self.anyway.apply( this, arguments );
			}
			else{
				self._iw = "fail";
				self._iwArgs = arguments;
			}
		};
		this.anyway = function(){
			if (typeof self._cbAlways === "function"){
				self._cbAlways.apply( this, arguments );
			}
			
			self.unbind();
		};

		this._cbDone = null;
		this._cbFail = null;
		this._cbAlways = null;
		this._iw = "";
		this._iwArgs = undefined;


		if (typeof fn === "function"){
			fn.call(this, this.resolve, this.reject);
		}
	};

	$p.prototype = {
		done: function(callback){
			try{
				if (this._iw === "done"){
					callback.apply(this, this._iwArgs);
				}
				else{
					this._cbDone = callback;
				}
			}
			catch(error){
				this.reject(error);
			}

			return this;
		},
		fail: function(callback){
			if (this._iw === "fail"){
				callback.apply(this, this._iwArgs);
			}
			else{
				this._cbFail = callback;
			}

			return this;
		},
		always: function(callback){
			if (this._iw === "done" || this._iw === "fail"){
				callback.apply(this, this._iwArgs);
			}
			else{
				this._cbAlways = callback;
			}

			return this;
		},
		unbind: function(){
			this._cbDone = undefined;
			this._cbFail = undefined;
			this._cbAlways = undefined;
			this._iw = undefined;
			this._iwArgs = undefined;
		}
	};

	return $p;
});