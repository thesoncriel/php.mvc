;define("viewmodel.coupon", 
	["jquery", "knockout", "service", "util", "config", "viewmodel", "viewmodel.base"],
	function($, ko, service, util, config, viewmodel, BaseViewModel){

	var ViewModel = function(){
		var self = this;

		this.detail = ko.observable();
		this.purchaseUrl = ko.observable("");
		this.bannerUrl = ko.observable( config.couponTopBanner );
		this.num0 = ko.observable("");
		this.num1 = ko.observable("");
		this.num2 = ko.observable("");
		this.num3 = ko.observable("");

		this.detail.subscribe(function(val){
			var custInfo = config.custInfo
			, custId = ""
			, custSvcId = ""
			, serviceType = ""
			, name = ""
			, mac = ""
			, mParam = $.extend({}, this._reqInfo)
			;

			mParam.contentId = val.content_id;

			this.purchaseUrl(
				"/exec/view/purchase_trigger.php?" + util.objectToParameter(mParam)
			);
		}, this, "change");

		this._reqInfo = undefined;
		this._resolve = null;
		this._couponHist = {};

		this.modalAPI = undefined;

		// event
		this.cancel = function(){
			self.modalAPI.hide();

			return false;
		};
		this.onChange = function(vm, event){
			var val = event.target.value
			, jqInputList
			, iKeyCode = event.keyCode || event.which
			;

			//console.log(event.keyCode, event.which, event.shiftKey);

			if ((iKeyCode === 9 && event.shiftKey) || 
				(iKeyCode === 9) ||
				(iKeyCode === 16) || 
				(iKeyCode === 39) ||
				(iKeyCode === 37)){
			}
			else if (val && val.length === 4){
				jqInputList = $(event.target).nextAll("input");

				if (jqInputList.length > 0){
					jqInputList[0].focus();
				}
			}
		};

		this.submit = function(e){
			self.jqSection.find("form").submit();

			return false;
		};
	}
	, cp
	;
	
	// Class extends
	cp = ViewModel.prototype = new BaseViewModel();
	cp.constructor = ViewModel;

	// methods
	cp.init = function(opt){
		var self = this
		, mOpt = {
			section: "#modal_coupon"
		}
		;

		mOpt = $.extend(mOpt, opt);
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);
		this.loading = service("loading")( this.section + " .loading" );
		this.modalAPI = service("modal")( this.section );

		this.initCustInfo();

		return this;
	};

	cp.initCustInfo = function(){
		var custInfo = config.custInfo
		, custId = ""
		, custSvcId = ""
		, serviceType = ""
		, name = ""
		, mac = ""
		, mInfo
		;

		if (custInfo){
			custId = custInfo.id_cust;
			custSvcId = custInfo.id_cust_svc;
			serviceType = custInfo.service_type;
			mac = custInfo.mac;
			name = custInfo.name;
		}

		mInfo = {
			mac: mac,
			custId: custId,
			custSvcId: custSvcId,
			contentId: "",
			serviceType: serviceType,
			name: name
		};

		this._reqInfo = mInfo;
	};

	cp.promise = function(item){
		var self = this;

		if (!item){
			return util.promise(function(res, rej){
				rej({msg: "요청 컨텐츠 정보가 없습니다."});
			});
		}

		this.getModal()
		.clear()
		.show();

		this.detail( item );

		return util.promise(function(resolve, reject){
			self._resolve = resolve;
		});
	};

	cp.getModal = function(){
		return this.modalAPI;
	};

	// @Override
	cp.destroy = function(){
		BaseViewModel.prototype.destroy.call(this);

		if (this.modalAPI){
			this.modalAPI.destroy();
			this.modalAPI = undefined;
		}
	};

	cp.execResolve = function(info){
		if ($.isFunction( this._resolve )){
			this.getModal().hide();
			this._resolve(info);
		}
	};
	cp.execReject = function(err){
		alert(err.msg);
	};

	cp.validate = function(item){
		var aValid = []
		, i = 0
		;

		for(;i < 4; i++){
			aValid.push({
				name: "coupon" + i,
				msg: "쿠폰 코드는 16자리 입니다.",
				regex: /^\d{4}$/
			});
		}

		return util.valid(item, aValid);
	};

	cp.mergeCouponCode = function(params){
		var aCode = []
		, i = 0
		;

		while(i < 4){
			aCode.push( params["coupon" + i] );
			i++;
		}

		return aCode.join("");
	};

	cp.checkCouponHist = function(sCode){
		var sResult
		;

		sResult = this._couponHist[sCode];

		if (sResult){
			return true;
		}

		return false;
	};
	

	cp.routecallback = function(ctx){
		var self = this
		, mParam = $.extend( {}, this._reqInfo, util.copyByOwnProp(ctx.params))
		, mValid = this.validate(mParam)
		, nowLoading = false
		, sCouponCode = this.mergeCouponCode(mParam)
		;

		if (mValid.valid === false){
			alert(mValid.msg);

			this.jqSection.find("input[name='" + mValid.name + "']").focus();

			return false;
		}

		if (this.checkCouponHist(sCouponCode)){
			alert("이미 등록 시도 했던 쿠폰 입니다.");
			return false;
		}

		this.loading();

		service("backend")("post", "/exec/purchase_coupon.php", mParam, true)
		.done(function(res){
			var info = res.info
			, result = res.result
			;

			if (info){
				if (info.confirm){
					if (confirm(res.result.msg)){
						ctx.params.confirmed = "Y";

						self.routecallback(ctx);

						return;
					}
				}
				else if (info){
					/*
					0000=성공
					0001=사용된 쿠폰
					0002=만기된 쿠폰
					0003=사용 정지 쿠폰
					0004=금액부족
					0009=미발급 쿠폰, 혹은 유효하지 않은 쿠폰
					9999=알 수 없는 오류
					*/
					self._couponHist[ sCouponCode ] = info;

					//alert(res.result.msg);

					if (info === "0000"){
						self.execResolve({
							code: info,
							msg: "결제에 성공 하였습니다."
						});
					}
					else{
						self.execReject({
							code: info,
							msg: result.msg
						});
					}
				}
			}
			else if (result && !result.valid){
				self.execReject(result);
			}

			self.loading(false);
		})
		.fail(function(res){
			self.execReject(res);
			self.loading(false);
		})
		.always(function(){
			
		});
	};

	cp.timeFmt = util.timeFormat;
	cp.textOverflow = util.textOverflow;

	return ViewModel;
});