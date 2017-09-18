;define("viewmodel.purchase", 
	["jquery", "knockout", "service", "util", "config", "viewmodel", "viewmodel.base"],
	function($, ko, service, util, config, viewmodel, BaseViewModel){

	var ViewModel = function(){
		var self = this;

		this.detail = ko.observable();
		this.purchaseUrl = ko.observable("");
		this.bannerUrl = ko.observable( config.purchaseBottomBanner );

		this.detail.subscribe(function(val){
			var custInfo = config.custInfo
			, custId = ""
			, custSvcId = ""
			, serviceType = ""
			, name = ""
			, mac = ""
			, mParam
			;

			if (custInfo){
				custId = custInfo.id_cust;
				custSvcId = custInfo.id_cust_svc;
				serviceType = custInfo.service_type;
				mac = custInfo.mac;
				name = custInfo.name;
			}

			mParam = {
				mac: mac,
				custId: custId,
				custSvcId: custSvcId,
				contentId: val.content_id,
				serviceType: serviceType,
				name: name
			};

			this.purchaseUrl(
				"/exec/view/purchase_trigger.php?" + util.objectToParameter(mParam)
			);
		}, this, "change");

		this._resolve = null;
		this._jqFrame = null;

		this.modalAPI = null;
		this.vmCoupon = null;

		// event
		this.cancel = function(){
			self.modalAPI.hide();

			return false;
		};
		this.coupon = function(){
			if (!self.vmCoupon){
				self.vmCoupon = viewmodel("coupon").init().apply();
			}

			//console.log("detail", self.detail() );
			self.vmCoupon.promise( self.detail() )
			.done(function(info){
				self.execResolve( info );
			})
			.fail(function(err){
				self.execReject(err);
			})
			;
		};
	}
	, cp
	;
	
	// Class extends
	cp = ViewModel.prototype = new BaseViewModel();
	cp.constructor = ViewModel;

	// methods
	cp.init = function(opt){
		var mOpt = {
			section: "#modal_purchase"
		}
		;

		mOpt = $.extend(mOpt, opt);
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);
		this.loading = service("loading")( this.section + "+.loading" );
		this.modalAPI = service("modal")( this.section );

		this.initFrame();

		return this;
	};

	cp.initFrame = function(){
		var self = this
		, jqFrame = this._jqFrame
		, regex = new RegExp("purchase_approval")
		;

		if (!jqFrame){
			jqFrame = $("iframe[name='frame_purchase']")

			if (jqFrame.length === 0){
				alert("구매 프레임이 설정되어 있지 않습니다.");

				return;
			}

			this._jqFrame = jqFrame;
		}

		

		// _jqFrame[0].onload = function(){
		// 	if (regex.test(_jqFrame[0].src)){
		// 		alert(_jqFrame[0].innerHTML);
		// 	}
		// };

		jqFrame.on("load", function(){
			var win = jqFrame[0].contentWindow
			, doc = win.document
			, txt = doc.body.innerHTML
			, mData
			, msg
			;

			try{
				if (!regex.test( win.location.href )){
					return;
				}
				mData = $.parseJSON(txt);

				if (!mData){
					throw {};
				}

				if (mData){
					if(mData.info === "0000" || mData.info === "0001"){
						self.execResolve({
							code: mData.info,
							msg: "결제에 성공 하였습니다."
						});
					}
					else if (mData.result.msg){
						alert(mData.result.msg);
					}
					else{
						throw {};
					}
				}
			}
			catch(e){
				alert("결제 진행 결과가 잘못 되었습니다.\n" + util.disassemble(e));

				return;
			}
		});	
	};

	cp.promise = function(item){
		var self = this;

		if (!item){
			return util.promise(function(res, rej){
				rej({msg: "요청 컨텐츠 정보가 없습니다."});
			});
		}

		this.getModal().show();
		this.detail(item);

		return util.promise(function(resolve, reject){
			self._resolve = resolve;
		});
	};

	cp.execResolve = function(info){
		if ($.isFunction(this._resolve)){
			this.getModal().hide();
			this._resolve(info);
		}
	};
	cp.execReject = function(err){
		alert(err.msg);
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



	
	

	cp.routecallback = function(ctx){
		// var self = this;

		// self.loading();

		// service("backend")("post", "/exec/")
	};

	cp.timeFmt = util.timeFormat;
	cp.textOverflow = util.textOverflow;

	return ViewModel;
});