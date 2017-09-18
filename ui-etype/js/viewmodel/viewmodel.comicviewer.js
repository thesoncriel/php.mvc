;define("viewmodel.comicviewer", 
	["jquery", "knockout", "service", "util", "viewmodel", "viewmodel.base", "component.imagepage"], 
	function($, ko, service, util, viewmodel, BaseViewModel, ImagePageComponent, undefined){

	//Class Definition
	var ViewModel = function(){
		var self = this;
		// Property
		this._sourcePath = "";
		this._info;
		this._maxCountAvailable = false;
		this._failCount = 0;
		this._maxFailCount = 2;
		// Auto Read Timeout Serial - 자동 넘기기 timeout 번호
		this._arts = 0;
		
		// Auto Send Bill Timeout - 자동 빌로그 넘기기 timeout 번호
		this._asbt = 0;
		// 자동 빌로그 넘기는 시간 (초)
		this._asbintv = 0;
		
		// Time To Change To Absent - 부재중인지 확인하는 timeout 번호
		this._ttctat = 0;
		// 부재중으로 바뀌는 시간(초)
		this._ttcta = 0;
		// 부재중 여부
		this._absent = false;

		this._bookSerial = "";

		this.title = ko.observable("");
		this.author = ko.observable("");
		this.each_books = ko.observableArray([]);
		this.bookno = ko.observable(1);
		this.type = ko.observable("");
		this.page = ko.observable(1);
		this.max = ko.observable(1);
		this.autoRead = ko.observable(0);
		this.autoBook = ko.observable(false);
		this.viewMode = ko.observable(0);
		this.readDir = ko.observable(0);
		this.disable = ko.observable(false);

		this.imgPage = null;
		this.loading = null;

		// this.imgPage.sourcePath("http://contents1.newkey.co.kr/comic/lucky/gohangsuk/gohangsuk_8/13/")
		// .max(124).page(4).load();

		// 북번호가 바뀌면 윈도 타이틀 내용도 바꾼다.
		this.bookno.subscribe(function(newVal){
			this.applyWindowTitle();
		}, this);

		// 몇가지 UI에 대하여 사용 금지를 하게끔 한다.
		this.preventAction = ko.pureComputed(function(){
			return this.disable() || (this.autoRead() > 0);
		}, this);
		
		this.bookOptText = function(item){
			return item.bookno + ((parseInt(item.state) === 1)? "권" : "회");
		};

		// ViewModel Event Method [시작]
		// 다른 권 보기
		this.onBookSelect = function(vm, e, item){
			self.stopAutoNext();
			self.load();
		};
		
		this.onGotoPageFocus = function(vm, event){
			self.refreshAbsent();
			event.currentTarget.select();
		};
		this.onGotoClick = function(){
			$("#form_comicViewerCtrl").submit();

			return false;
		};
		// 자동 넘기기
		this.onAutoReadChange = function(){
			var iAutoRead = parseInt(self.autoRead() || 0);

			self.stopAutoNext();

			if (!iAutoRead){
				self.applyAutoRead(false);
			}
			else{
				self.applyAutoRead(true);
			}
		};
		// 보기 모드
		this.onViewModeChange = function(){
			var viewMode = self.viewMode();

			self.refreshAbsent();
			self.applyAutoRead(0);
			self.imgPage.showCount( viewMode );
			//self.setPageCoverCount( viewMode );
		};
		// 넘기기 방향
		this.onReadDirChange = function(){
			self.refreshAbsent();
			self.imgPage.readDir( self.readDir() ).load();
		};
		// 이전
		this.onPrevClick = function(){
			var me = self;

			if (me.preventAction()){
				return;
			}
			if (me.readDir() == 0){
				me.imgPage.prev();
			}
			else{
				me.imgPage.next();
			}
			/*
			만약 일본만화 (왼쪽<--오른쪽) 보는데 
			오른쪽이 다음 버튼이 되길 원한다면
			아래 주석을 지우고 윗 내용을 지우거나 주석 처리 한다.
			*/
			//me.imgPage.prev();

			me.refreshAbsent();
			
		};
		// 다음
		this.onNextClick = function(){
			var me = self;

			if (me.preventAction()){
				return;
			}
			if (me.readDir() == 0){
				me.imgPage.next();
			}
			else{
				me.imgPage.prev();
			}
			/*
			만약 일본만화 (왼쪽<--오른쪽) 보는데 
			오른쪽이 다음 버튼이 되길 원한다면
			아래 주석을 지우고 윗 내용을 지우거나 주석 처리 한다.
			*/
			//me.imgPage.next();

			me.refreshAbsent();
		};
		this.onKeyup = function(e){
			var tagName;

			e.preventDefault();

			if (e && e.target){
				tagName = e.target.tagName;
				tagName = tagName.toLowerCase();

				if (tagName === "input"){
					return;
				}
			}

			self.refreshAbsent();

			if (e.keyCode === 37){
				self.onPrevClick();

				return false;
			}
			else if (e.keyCode === 39){
				self.onNextClick();

				return false;
			}
		};
		// 부재중이 되었을 때 수행됨
		this.onAbsent = function(self){
			// 최근 내용을 마지막으로 한번 전달 하고 자동 빌로그 쌓기는 중지 한다.
			self.sendBill(false);
		};
		// ViewModel Event Method [종료]

	}
	, cp
	;

	cp = ViewModel.prototype = new BaseViewModel();
	cp.constructor = ViewModel;

	cp.init = function(opt){
		var mOpt = {
			section: "#comicviewer",
			pageSection: "bookImg"
		}
		, imgPage
		;

		mOpt = $.extend(mOpt, opt);

		BaseViewModel.prototype.init.call(this, mOpt);

		this._contentsDomain = mOpt.contentsDomain;

		if (mOpt.info.serial){
			this._info = mOpt.info;
			this.initProp(this._info);
			this.initComponent(mOpt);
			this.initEvent(mOpt);
		}
		else{
			this.disable(true);
		}

		this.applyActionPrevent( mOpt.actionPrevent );

		return this;
	};

	cp.initProp = function(info){
		var iReadDir = ImagePageComponent.parseZOder(info.zorder);

		this.type(info.type);
		this.title(info.title);
		this.author(info.am_name);
		this.bookno(parseInt(info.bookno || 1));
		this.each_books(info.each_books);
		this.readDir(iReadDir);
		this._maxFailCount = info.maxFailCount || 4;
		this._asbintv = info.send_bill_interval || 60; // 기본값 60초
		this._ttcta = info.time_to_absent || 20; // 기본값 20초
	};

	cp.initComponent = function(mOpt){
		var imgPage = new ImagePageComponent(mOpt.pageSection);

		this.imgPage = imgPage;
		this.loading = service("loading")(mOpt.section + " .loading");
		this.loading(true);

		imgPage
		.altSrc(mOpt.altImg)
		.emptySrc(mOpt.emptyImg)
		.onready(this.onReady, this)
		.onloaded(this.onLoaded, this)
		.onpagechange(this.onPageChange, this)
		.onfirst(this.onFirst, this)
		.onlast(this.onLast, this)
		.onimageloadfail(this.onImageLoadFail, this)
		.onfail(this.onImageFail, this)
		.onloading(this.onLoading, this)
		.build()
		;
	};

	cp.initEvent = function(mOpt){
		$("body").keyup(this.onKeyup);
	};

	cp.applyWindowTitle = function(){
		if (!this._info){
			return;
		}
		document.title = this.title() + " [" + this.bookno() + "] - " + this.author();
	};

	// 이미지 컴포넌트 이벤트 [시작]
	cp.onReady = function(){
		this.sourcePath(this._contentsDomain + this._info.contents_server_path);
		this.load();
	};
	cp.onLoaded = function(){
		var iPage = parseInt(this.page())
		;

		this._failCount = 0;
		this.loading(false);

		if (this.autoRead() > 0){
			this.autoNext();
		}
		// 첫페이지를 본다면 처음 본다는 내용을 서버에 같이 전달
		if (iPage <= 1){
			this.sendBill(true);
		}
		// 마지막 페이지를 보게 된다면 다 봤다는 내용을 서버에 전달
		else if ((iPage + 1) >= this.max()){
			this.sendBill(false);
		}
	};
	cp.onPageChange = function(fixedPage){
		this.page(fixedPage);
	};
	cp.onFirst = function(){
		this.alertMsg(120);
		this.onLoaded();
	};
	cp.onLast = function(){
		var self = this;

		try{
			// 마지막권일 경우 자동/수동 관계 없이 메시지 출력
			if (this.isLastBook()){
				this.applyAutoRead(0);
				this.alertMsg(129);
			}
			// 마지막권은 아니고 자동이면 그냥 다음권 수행
			else if (this.autoBook() && (this.autoRead() > 0)){
				this.autoNextBook();
			}
			// 마지막권이 아니고 수동일 경우 물어보고 진행
			else{
				this.stopAutoNext();
				this.confirmMsg(122)
				// 예
				.done(function(){
					self.autoNextBook();
				})
				// 아니오
				.fail(function(){
					self.autoRead(0);
				});

				return;
			}
		}
		// 마지막권인지 확인 중 내용이 수상하다면 catch 하여 메시지 출력
		catch(e){
			this.alertMsg(e.errorCode, e);
		}

		this.onLoaded();
	};
	cp.onImageLoadFail = function(error){
		var self = this;

		this._failCount++;
		this.loading(false);
		// 최대 개수를 못읽어서 유효하지 않다면
		if (this._maxCountAvailable === false){
			// 그런데 페이지도 갓 시작했다.
			if (this.page() <= 2){
				if (this._failCount > 1){
					setTimeout(function(){
						self.alertMsg(111, true);
					}, 200);
					this.disable(true);
					this.autoRead(0);
					this.autoBook(false);
					this.stopAutoSendBill();
				}
			}

			return;
		}
		
		if (this._failCount >= this._maxFailCount){
			setTimeout(function(){
				this.alertMsg(112, true);
			}, 200);
			this.disable(true);
			this.autoRead(0);
			this.autoBook(false);
			this.stopAutoSendBill();
		}
		else{
			this.onLoaded();
		}
	};
	cp.onImageFail = function(error){
		// 너무 자주 뜨면 사용자가 짜증(...)을 낼 수 있으므로 오류를 서버로 보냄.
		this.sendError(error.code, error);
	};
	cp.onLoading = function(){
		this.loading(true);
	};
	// 이미지 컴포넌트 이벤트 [종료]

	cp.load = function(){
		var self = this;

		this.disable(false);

		this.imgPage.sourcePath( this.getSourcePathWithBookNo() );
		this.loadCount()
		.done(function(max){
			self._absent = false;
			self._maxCountAvailable = true;
			self.setMaxAndImageload(max);
			self.refreshAbsent();
		})
		.fail(function(errorCode){
			self._maxCountAvailable = false;
			self.alertMsg(errorCode);
			self.setMaxAndImageload(200);
		});

		
	};

	cp.loadCount = function(){
		var self = this
		, mInfo = this._info
		, type = mInfo.type
		, serial = mInfo.serial
		, bookno = this.bookno()
		;

		return util.promise(function(resolve, reject){
			var key = type + "_" + serial + "_" + bookno
			, sCount = util.cookie.get(key)
			, promise = util.promise()
			, path
			;

			if (!sCount){
				path = self.getSourcePathWithBookNo() + "index.xml";

				service("backend")
				("xml", path)
				.done(function(xml){
					var iCount = self.parseMaxCountByXml(xml);

					if (iCount === NaN || !$.isNumeric(iCount)){
						reject(102);

						return;
					}

					// 가져온 카운트값은 30일간 쿠키로 보관
					util.cookie.set(key, iCount, (24 * 30));

					resolve( iCount );
				})
				.fail(function(e){
					reject(100);
				});
			}
			else{
				resolve( parseInt(sCount) );
			}
		});
	};

	

	cp.sourcePath = function(path){
		if (path === undefined){
			return this._sourcePath;
		}

		if (path && (path.substr(path.length - 1, 1) === "/")){
			path = path.substr(0, path.length - 1);
		}

		this._sourcePath = path;

		// 간혹 뒷부분에 / 가 빠져 있는 경우가 있다.
		// if (path && (path.charAt(path.length - 1) === "/")){
		// 	this._sourcePath = path;
		// }
		// else{
		// 	this._sourcePath = path + "/";
		// }
	};
	cp.getSourcePathWithBookNo = function(){
		return this.sourcePath() + "/" + this.bookno() + "/";
	};

	cp.parseMaxCountByXml = function(xml){
		var jqXml = $(xml)
		, jqCount = jqXml.find("count")
		, sCount = jqCount.text()
		, iCount = parseInt( sCount )
		;

		return iCount;
	};

	cp.setMaxAndImageload = function(max){
		this.max(max);
		this.imgPage.max(max).load();
	};

	/**
	자동 넘기기 적용.
	@param
	use = [true|false|number]
		true면 자동 넘기기 적용.
		false면 자동 넘기기를 중단.
		숫자로 넣으면 그 값을 autoRead Property에 설정하며 0이면 중단, 1이상이면 적용.
	*/
	cp.applyAutoRead = function(use){
		var bRefreshAbsentAwaken = true
		;
		if (use === true){
			this.autoNext();
			
		}
		else{
			if ($.isNumeric(use)){
				this.autoRead(parseInt(use));
			}

			if (!use){
				this.stopAutoNext();
				bRefreshAbsentAwaken = false;
			}
			else{
				this.autoNext();
			}
		}

		if (bRefreshAbsentAwaken){
			// 자동 넘기기 할 때는 부재중 시간을 체크하지 않는다.
			this.refreshAbsent(true);
		}
		else{
			// 사용 안하게 된다면 다시 부재중 시간을 체크 한다.
			this.refreshAbsent();
		}
	};

	/**
	자동 넘기기 값을 확인하고 
	유효하면 그 값을 이용하여 자동 넘기기 1번을 수행 한다.
	*/
	cp.autoNext = function(){
		var self = this
		, iSec = parseInt(this.autoRead());
		;

		if (!iSec){
			
			return;
		}
		else{
			
		}

		this.stopAutoNext();
		// Auto Read Timeout Serial
		this._arts = setTimeout(function(){
			self.imgPage.next()
		}, iSec * 1000);
	};
	cp.autoNextBook = function(){
		this.stopAutoNext();
		this.bookno(this.getNextBook());
		//this.load();
	};
	cp.stopAutoNext = function(){
		if (this._arts){
			clearTimeout(this._arts);
			this._arts = 0;
		}
	};
	cp.isLastBook = function(){
		var iBookno = parseInt(this.bookno())
		, aEachBooks = this.each_books()
		, iBookLen
		, iLastBookno
		;

		if (aEachBooks){
			iBookLen = aEachBooks.length;
			iLastBookno = parseInt( aEachBooks[ iBookLen - 1 ].bookno );
		}
		else{
			iBookLen = 0;
			iLastBookno = 0;
		}

		if (!iBookno && !iLastBookno){
			throw {errorCode: 130, bookno: iBookno, lastBookno: iLastBookno, bookLen: iBookLen};
		}

		return iBookno >= iLastBookno;
	};
	cp.getNextBook = function(){
		var iBookno = parseInt(this.bookno())
		, aEachBooks = this.each_books()
		, i = -1
		, iLen = (aEachBooks)? aEachBooks.length : 0
		, iItemBookno = 0
		, bDetected = false;
		;

		while(++i < iLen){
			iItemBookno = parseInt(aEachBooks[i].bookno);

			if (bDetected){
				return iItemBookno;
			}

			if (iItemBookno === iBookno){
				bDetected = true;
			}
		}

		return 0;
	};

	/**
	사용자의 이용 현황을 서버로 전달한다.
	관련 내용은 서버에서 bill log 로 기록 한다.
	*/
	cp.sendBill = function(isFirst){
		var self = this
		, iTimeoutCode = 0
		, iFirst = 0
		;

		if (isFirst === true){
			this._bookSerial = this.getBookSerial();
			iFirst = 1;
		}

		this.stopAutoSendBill();

		service("backend")
		("/exec/comic_bill.php",{
			serial: this._info.serial,
			book_serial: this._bookSerial,
			type: this.type(),
			first: iFirst,
			absent: this._absent ? 1 : 0
		})
		.done(function(res){
			if (isFirst === false){
				return;
			}
			self.autoSendBill();
		})
		.fail(function(){
			self.disable(true);
			self.alertMsg(140, true);
		});
	};
	cp.autoSendBill = function(){
		var self = this;

		this.stopAutoSendBill();

		this._asbt = setTimeout(function(){
			self.sendBill();
		}, this._asbintv * 1000);
	};
	cp.stopAutoSendBill = function(){
		if (this._asbt){
			clearTimeout(this._asbt);
		}
	};
	
	cp.getBookSerial = function(){
		var bookno = this.bookno()
		, aEachBooks = this.each_books()
		, i = -1
		, iLen = aEachBooks.length
		, mBook
		;

		while(++i < iLen){
			mBook = aEachBooks[i];

			if (mBook.bookno == bookno){
				return mBook.book_serial;
			}
		}

		return -1;
	};

	cp.refreshAbsent = function(alwaysAwaken){
		var self = this;

		if (this._ttctat){
			clearTimeout(this._ttctat);
		}

		// 기존에 부재중이었다면 빌로그를 처음부터 다시 쌓는다.
		if (this._absent){
			this._absent = false;
			this.sendBill(true);
		}

		// true일 경우 부재중 확인을 수행하지 않는다.
		if (alwaysAwaken){
			return;
		}

		this._ttctat = setTimeout(function(){
			self._absent = true;
			self.onAbsent(self);
		}, this._ttcta * 1000);
	};

	// route callback methods
	// 페이지 이동
	cp.routecallback = function(ctx){
		var sPage
		, iPage
		;
		try{
			sPage = ctx.params.page;

			if (sPage && $.isNumeric(sPage)){
				this.imgPage.goTo( parseInt( sPage ) );
			}
			else{
				throw "page is not number";
			}
		}
		catch(e){
			this.alertMsg(7);
			this.page( this.imgPage.page() );
		}
	};

	return ViewModel;
});