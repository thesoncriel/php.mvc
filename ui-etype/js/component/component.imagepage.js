;define("component.imagepage", ["jquery", "util", "component.base", "component.image", "factory.component.image"], 
	function($, util, BaseComponent, ImageComponent, ImageComponentFactory){

	var ImagePageComponent = function(idPrefix){
		this._images = [];
		this._page = 1;
		this._max = 1;
		this._rdir = READING_DIRECTION_L2R;
		this._showCount = 0;
		this._ext = ".jpg.nkc";
		this.isReady = false;
		this.isLoaded = true;
		//this._pagination = new PaginationComponent();
		
		this.init();
		this.createImages(idPrefix, 2);
	}
	, cp
	// left2right=zorder2, right2left=zorder1
	, READING_DIRECTION_L2R = 0
	, READING_DIRECTION_R2L = 1
	;

	cp = ImagePageComponent.prototype = new ImageComponent();

	cp.constructor = ImagePageComponent;

	cp.init = function(elem){
		ImageComponent.prototype.init.call(this, elem);

		return this;
	};

	cp.createImages = function(idPrefix, count){
		var i = -1, iLen = count || 1
		, imgComp
		;

		while(++i < iLen){
			imgComp = ImageComponentFactory( "#" + idPrefix + i );
			imgComp.onready(this.onReadyImages, this);
			imgComp.onloaded(this.onLoadedImages, this);
			imgComp.onfail(this.onFailImages, this);
			this._images.push( imgComp );
		}

		this._showCount = iLen;
	};

	cp.destruct = function(){
		var i = -1, iLen = this._images.length
		;

		ImageComponent.prototype.destruct.call(this);

		while(++i < iLen){
			this._images[i].destruct();
			this._images[i] = undefined;
		}

		this._images = undefined;
	};

	cp.build = function(){
		this.batchSetMethod("build");
	};

	cp.makePaging = function(){
		var iPage = this.page()
		, i = -1
		, iLen = this.showCount()
		, aPaging = []
		;

		while(++i < iLen){
			aPaging.push(iPage);
			iPage++;
		}

		return aPaging;
	};

	cp.width = function(){
		return this.sumImageProp("getWidth");
	};
	cp.height = function(){
		return this.sumImageProp("getHeight", true);
	};

	cp.load = function(){
		var i = -1
		, iLen
		, aImg
		, sPath = this.sourcePath()
		, aPaging
		, fnPad = util.pad
		, iPage = 0
		, iMax = 0
		;

		if (!sPath || !this.isReady || !this.isLoaded){
			return;
		}

		this.isLoaded = false;
		this.onLoading();

		iLen = this.showCount();
		aImg = this._images;
		aPaging = this.makePaging();
		iMax = this.max();

		if (this._rdir === READING_DIRECTION_R2L){
			aPaging = aPaging.reverse();
		}

		while(++i < iLen){
			iPage = aPaging[i];

			if (iPage <= iMax){
				aImg[i].setSrc( sPath + fnPad( iPage, 3 ) + this._ext );
			}
			else {
				/**
				※참고
				empty는 image component에 setEmptySrc 로 값을 설정하지 않으면
				onloaded 이벤트가 발생되지 않는다.
				*/
				aImg[i].empty();
			}
		}
	};

	cp.sourcePath = function(path){
		var i
		, iLen
		;

		if (path === undefined){
			return this._sourcePath;
		}

		i = -1;
		iLen = this._images.length;

		this._sourcePath = path;
		this.page(1);

		return this;
	};

	cp.batchSetMethod = function(name, value){
		var aImg = this._images
		, i = -1
		, iLen = aImg.length
		;

		while(++i < iLen){
			aImg[i][name](value);
		}
	};

	cp.altSrc = function(path){
		this.batchSetMethod("setAltSrc", path);

		return this;
	};
	cp.emptySrc = function(path){
		this.batchSetMethod("setEmptySrc", path);

		return this;
	};

	cp.page = function(page){
		var iPage = 0;

		if (page === undefined){
			return this._page;
		}

		if (this.isLoaded === false){
			return this;
		}

		iPage = this.checkPage(page);

		if (iPage < 1){
			return this;
		}

		this._page = iPage;

		this.onPageChange(iPage);

		return this;
	};

	cp.goTo = function(page){
		this.page(parseInt(page)).load();
	};
	/*
	특정 페이지 번호를 실제 쓰일 수 있는 유효한 값으로 바꾼다.
	원래 다중 이미지에 대한 첫번째 페이지 값을 되돌려 주려고 했는데
	수학이 필요하고 시간이 오래걸려서
	그냥 최대 2페이지라 가정하고 만듬.
	*/
	cp.checkPage = function(page){
		var iBeforeVal = this._page
		, iCurrVal = parseInt(page || 1)
		, iChanged = 0
		, iCount = this.showCount()
		, iMax = this.max()
		;

		if (iCurrVal < 1){
			iCurrVal = 1;
			this._throwError(205);
		}
		else if (iCurrVal > this.max()){
			iCurrVal = this.max();
			this._throwError(206);
		}

		if (iCount === 1){
			return iCurrVal;
		}

		if (iCurrVal % 2 === 0){
			return iCurrVal - 1;
		}

		return iCurrVal;
	};

	cp.max = function(max){
		if (max === undefined){
			return this._max;
		}
		try{
			this._max = parseInt(max || this._max);
		}
		catch(e){
			this._throwError(204, e);
		}
		
		return this;
	};

	cp.readDir = function(_rdir){
		var rdir = 0
		, i_rdir = 0
		;

		if (_rdir === undefined){
			return this._rdir;
		}

		i_rdir = parseInt(_rdir);

		if (i_rdir === READING_DIRECTION_L2R || 
			i_rdir === READING_DIRECTION_R2L){
			rdir = i_rdir;
		}
		else{
			// 잘못된 값이 왔더라도 기본 왼쪽->오른쪽 값을 설정.
			rdir = READING_DIRECTION_L2R;
		}

		if (this._rdir !== rdir){
			this._rdir = rdir;
		}

		return this;
	};
	
	cp.showCount = function(count){
		var i = 0
		, aImg
		, iLen
		, iBeforeCount
		, iPage
		, iCount
		;

		if (count === undefined){
			return this._showCount;
		}

		iCount = parseInt(count);

		if (iCount < 1){
			iCount = 1;
		}
		else if (iCount > 2){
			iCount = 2;
		}

		aImg = this._images;
		iLen = aImg.length;
		iBeforeCount = this._showCount;
		iPage = this.page();

		while(i < iCount){
			aImg[i].show();
			i++;
		}
		while(i < iLen){
			aImg[i].hide();
			aImg[i].empty();
			i++;
		}

		this._showCount = iCount;

		this.goTo(iPage);
	};

	cp.prev = function(){
		var iPage = this.page()
		, iPrev
		;

		iPrev = iPage - this.showCount();

		if (iPrev < 1){
			iPrev = 1;
			this.onFirst(1);

			return;
		}

		this.page(iPrev).load();
	};
	cp.next = function(){
		var iPage = this.page()
		, iNext
		, iShowCount = this.showCount()
		, iMax = this.max()
		;

		iNext = iPage + iShowCount;

		if (iNext > iMax){
			if (iShowCount > 1){
				iNext = iMax - ((iMax + 1) % iShowCount);
			}
			else{
				iNext = iMax;
			}
			this.onLast(iMax);

			return;
		}

		this.page(iNext).load();
	};

	cp.sumImageProp = function(prop, single){
		var i = -1
		, aImg = this._images
		, iLen = this.showCount()
		, iVal = 0
		;

		if (single){
			return aImg[0][prop]()
		}

		while(++i < iLen){
			iVal = iVal + aImg[i][prop]();
		}

		return iVal;
	};

	cp.checkImagesProp = function(prop){
		var i = -1
		, aImg = this._images
		, iLen = aImg.length
		, bStatus = true
		;

		while(++i < iLen){
			bStatus = bStatus && aImg[i][prop];
		}

		return bStatus;
	};
	//@override
	cp.onready = function(){
		ImageComponent.prototype.onready.apply(this, arguments);

		this.onReadyImages();

		return this;
	};
	cp.onReadyImages = function(){
		var bReady = this.checkImagesProp("isReady")
		;

		this.isReady = bReady;

		if (bReady){
			this.load();
			this.onReady(this);
		}
	};
	cp.onLoadedImages = function(){
		var bLoaded = this.checkImagesProp("isLoaded")
		;

		if ((this.isLoaded !== bLoaded) && bLoaded){
			this.isLoaded = bLoaded;
			//console.log("onLoadedImages", ++window.__cnt, (new Date()).getSeconds());
			this.onLoaded(this);
		}
	};
	cp.onFailImages = function(e, img){
		var iCode
		, mFailCodes = {1:1,2:1,40:1}
		;

		this.isLoaded = true;

		if (e){
			iCode = e.code;

			if (mFailCodes[iCode]){
				if (iCode === 2){
					img.empty();
				}
				this.onImageLoadFail({
					path: this.sourcePath(),
					page: this.page(),
					max: this.max(),
					show: this.showCount()
				});
			}
			else{
				this.onFail(e);
			}
		}
	};

	BaseComponent.regEvent(cp, 
		/**
		페이지 값이 변경되었을 때 수행 된다.
		가령 잘못된 페이지 값이 설정되고 이를 바로잡은 값이 필요하다면
		사용 한다.
		*/
		"onPageChange", 
		//이전으로 갔을 때 더이상 이전 페이지가 없을 때 발생.
		"onFirst", 
		// 다음을 수행했을 때 더이상 다음 페이지가 없을 때 발생.
		"onLast",
		// 특정 페이지에 대한 이미지를 불러오는데 실패
		"onImageLoadFail", 
		// 특정 페이지를 불러올 때 수행.
		"onLoading");

	ImagePageComponent.parseZOder = function(zorder){
		var iZOrder = parseInt(zorder)
		;

		if (iZOrder === 1){
			return READING_DIRECTION_R2L;
		}

		return READING_DIRECTION_L2R;
	};

	return ImagePageComponent;
});