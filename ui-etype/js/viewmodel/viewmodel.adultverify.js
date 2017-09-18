;define("viewmodel.adultverify", 
	["jquery", "knockout", "service", "util", "viewmodel.base"], 
	function($, ko, service, util, BaseViewModel, undefined){
	
	// Class Definition
	var ViewModel = function(){
		// properties
		this.loading = util.noop;

		

		// Adult Verify Promise
		this._resolve = null;
		this._reject = null;

		// event methods
		// this.onSubmit = function(event){
		// 	alert("submit");

		// 	return false;
		// };
		// this.onPosterError = function(item, event){
		// 	//event.stopPropagation();
		// 	event.currentTarget.src = "css/img/no_poster.jpg";
		// };
	},
		cp
	;

	// Class extends
	ViewModel.prototype = new BaseViewModel();
	ViewModel.prototype.constructor = ViewModel;

	// Class Prototype
	cp = ViewModel.prototype;

	

	// methods
	cp.init = function(opt){
		var mOpt = {
			section: "#form_adultVerify"
		};
		// super class init method call
		BaseViewModel.prototype.init.call(this, mOpt);

		this.loading = service("loading")( this.section + "+.loading" );

		return this;
	};

	cp.destroy = function(){
		if (this.loading){
			this.loading.destroy( this.DOMSection );
		}

		this.unbindCallbackOnVerify();

		// super class destroy method call
		BaseViewModel.prototype.destroy.call(this);
	};

	cp.validate = function(item){
		var mRet = util.valid(item, [
			{
				name: "name",
				msg: "이름은 한글로 최소 두글자 이상 입력 하십시오.",
				regex: /^[가-힣]{2,}$/
			}
			,{
				name: "birth",
				msg: "생년월일은 숫자 8자리로 입력 하십시오.",
				regex: /^\d{8}$/
			}
			,{
				name: "telnum",
				msg: "핸드폰 번호는 010, 011, 016, 017, 018, 019 로 시작하며 최소 9자리, 최대 11자리의 숫자로만 작성 하십시오.",
				regex: /^01[0-9]\d{6,8}$/
			}
		])
		;

		return mRet;
	};

	cp.promise = function(){
		var self = this;
		// if (this._promise === undefined){
		// 	this._promise = util.promise();
		// }
		
		return util.promise(function(resolve, reject){
			self._resolve = resolve;
			self._reject = reject;
		});
	};

	cp.execResolve = function(){
		if ($.isFunction(this._resolve)){
			this._resolve.apply(this, arguments);
		}
	};
	cp.execReject = function(){
		if ($.isFunction(this._reject)){
			this._reject.apply(this, arguments);
		}
	}

	// route callback methods
	cp.routecallback = function(ctx){
		var self = this
		,	mParam = ctx.params
		,	mValid = this.validate(mParam)
		;

		//console.log(ctx);
		if (mValid.valid === false){
			alert(mValid.msg);

			this.jqSection.find("input[name='" + mValid.name + "']").focus();

			return false;
		}

		//util.debug.log("post - 성인인증");


		self.loading();

		service("backend")("post", "/exec/adult_verify.php", ctx.params)
		.done(function(res){
			if (!res || !res.result){
				self.execReject(res, "원격 인증 서버로부터 잘못된 응답이 전송 되었습니다.\n응답 데이터 형식이 맞지 않거나 응답 내용이 비어 있습니다.");

				return;
			}

			if (res.result.valid){
				self.execResolve(res.data, res.result.msg);
			}
			else{
				self.execReject(res.data, res.result.msg);
			}
		})
		.fail(function(res){
			self.execReject(res, "원격 인증 서버가 정상적으로 동작하지 않거나 존재하지 않습니다.\n인터넷 연결 상태나 인증서버 상태를 확인 하시길 바랍니다.");
		})
		.always(function(){
			self.loading(false);
		});
	};

	// event methods
	cp.onapply = function(){

	};

	return ViewModel;
});