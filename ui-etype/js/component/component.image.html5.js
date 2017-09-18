;define("component.image.html5", ["jquery", "component.image", "util"], 
	function($, ImageComponent, util){
	var Html5ImageComponent = function(elem){
			var self = this
			, fnLoad
			, fnError
			;

			fnLoad = function(){
				var responseArray = util.decImg( new Uint8Array(this._xhr.response, 0) );
				var blob = new Blob([responseArray], {type: "image/jpeg"});

				this._jqImg[0].src = URL.createObjectURL(blob);
				this.isLoaded = true;
				this.onLoaded(this);
			}.bind(this);
			fnError = function(e){
				this.isLoaded = true;
				this._throwError(1, e, this);

				if (this._altSrc){
					this._jqImg[0].src = this._altSrc;
				}
			}.bind(this);

			this._xhr = new XMLHttpRequest();

			this._xhr.addEventListener("load", fnLoad);
			this._xhr.addEventListener("error", fnError);
	
			this.isReady = true;
            this.isLoaded = true;
			this._jqElem = null;
			this._jqImg = null;
			this._src = "";
            this._altSrc = "";
            this._emptySrc = "";
            this._fnError = fnError;

			this.destruct = function(){
				ImageComponent.prototype.destruct.call(this);
				
				try{
					this._jqImg.remove();
					this._jqImg = undefined;
				}
				catch(e){}

				try{
					this._jqElem.empty();
					this._jqElem = undefined;
				}
				catch(e){}

				try{
					this._xhr.abort();
					this._xhr.removeEventListener("load", fnLoad);
					this._xhr.removeEventListener("error", fnError);
					this._xhr = undefined;
				}
				catch(e){}
			};
			this.build = function(){};

			this.init(elem);
		}
	,	cp
	;

	Html5ImageComponent.prototype = new ImageComponent();

	cp = Html5ImageComponent.prototype;

	cp.constructor = Html5ImageComponent;
	cp.init = function(elem){
		ImageComponent.prototype.init.call(this, elem);

		var jqElem = $(elem)
		,	jqImg = $('<img src="" alt="comic" />')
		,	jqParent = jqElem.parent()
		;

		jqImg.replaceAll(jqElem);
		jqElem = jqImg;
		jqElem.empty().append( jqImg );

		this._jqElem = jqElem;
		this._jqImg = jqImg;

		return this;
	};

	
	// @override
	cp.onready = function(handler, owner){
		ImageComponent.prototype.onready.call(this, handler, owner);

		if (this.isReady === true){
			this.onReady(this);
		}
	};

	cp.loadImage = function(url){
		this.isLoaded = false;
		this._xhr.open("GET", url, true);
		this._xhr.responseType = "arraybuffer";
		this._xhr.send();
	};
	cp.getSrc = function(){
		return this._src;
	};
	cp.setSrc = function(src){
		if (this.isLoaded === false){
            return;
        }
        if (this._src === src){
        	this.onLoaded(this);
        	return;
        }
		this._src = src;
		this.loadImage(src);
	};

	cp.getAltSrc = function(){
        return this._altSrc;
    };
    cp.setAltSrc = function(src){
        this._altSrc = src;
    };

    cp.getEmptySrc = function(){
        return this._emptySrc;
    };
    cp.setEmptySrc = function(src){
        this._emptySrc = src;
    };
    cp.empty = function(){
    	if (this._emptySrc){
			this._jqImg[0].src = this._emptySrc;
    	}

		this._src = "";
    	this.isLoaded = true;
    	this.onLoaded(this);
    };

	cp.getWidth = function(){
		return this._jqImg.outerWidth();
	};
	cp.setWidth = function(width){
		//this._width = width;
	};
	cp.getHeight = function(){
		return this._jqImg.outerHeight();
	};
	cp.setHeight = function(height){
		//this._height = height;
	};
	cp.show = function(){
        this._jqElem[0].style.display = "inline-block";
        //this._jqElem.show();
    };
    cp.hide = function(){
        this._jqElem[0].style.display = "none";
        //this._jqElem.hide();
    };
    cp.isDisplay = function(){
    	var sDisplay = this._jqElem[0].style.display;

        return (sDisplay === "" || sDisplay !== "none");
    };

	return Html5ImageComponent;
});