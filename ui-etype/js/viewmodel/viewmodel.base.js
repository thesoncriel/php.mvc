;define("viewmodel.base", 
	["jquery", "knockout", "service", "util"], 
	function($, ko, service, util, undefined){
	
	// Class Definition
	var ViewModel = function(){
		this.binded = false;
		},
		// Class Prototype
		cp = ViewModel.prototype
	;

	// properties
	cp.jqSection = null;
	cp.DOMSection = null;
	cp.section = "";

	// methods
	cp.init = function(opt){
		var mOpt,
			elemSection,
			jqSection,
			key
		;

		if (this.jqSection){
			return this;
		}

		if (!opt){
			mOpt = {
				section: "#viewmodel_section"
			};
		}
		else{
			mOpt = opt;
		}

		jqSection = $( mOpt.section );

		this.jqSection = jqSection;
		this.DOMSection = jqSection[0];

		for (key in mOpt){
			this[ key ] = mOpt[ key ];
		}

		jqSection.unload( this.destroy );

		return this;
	};

	cp.destroy = function(){
		ko.cleanNode( this.DOMSection );

		if (this.jqSection){
			this.jqSection.remove();
			this.jqSection = undefined;
		}
		if (this.DOMSection){
			this.DOMSection = undefined;
		}
		if (this.section){
			this.section = undefined;
		}
	};

	cp.apply = function(){
		if (this.binded || !this.DOMSection){
			return;
		}

		ko.applyBindings( this, this.DOMSection );

		this.binded = true;

		return this;
	};

	cp.applyActionPrevent = function(use){
		if (use === true){
			$("body")
			.on("contextmenu", util.noop)
			.on("selectstart", util.noop)
			.on("dragstart", util.noopstop)
			;
		}
	};

	cp.altPropByAttr = function(dataAttr){
		var sDataAttr = this.jqSection.data( dataAttr.toLowerCase() );

		if (sDataAttr){
			this[ dataAttr ] = sDataAttr;
		}
	};

	cp._findMsg = function(msg){
		if ($.isNumeric(msg)){
			return service("error.msg")[msg];
		}
		
		return msg;
	}

	cp.alertMsg = function(msg, errorObj){
		if (msg instanceof Object || msg instanceof Error){
			// 예상치 못한 알 수 없는 오류.
			// 객체인 msg 값을 서버로 보내도록 한다.
			return this.msgbox(99999, false, msg);
		}
		
		return this.msgbox(msg, false, errorObj);
	};
	cp.confirmMsg = function(msg, errorObj){
		return this.msgbox(msg, true, errorObj);
	};
	cp.msgbox = function(msg, useConfirm, errorObj){
		var sMsg = this._findMsg(msg);

		if (errorObj){
			this.sendError(msg, errorObj);
		}
		return util.promise(function(resolve, reject){
			if (useConfirm){
				if (confirm(sMsg)){
					resolve(1);
				}
				else{
					reject(0);
				}
			}
			else{
				alert(sMsg);
				resolve(0);
			}
		});
	};
	// 원격 서버에 오류 내용을 전달하여 A/S 대비.
	cp.sendError = function(errorCode, errorObj){
		//alert(errorCode + "\n" + util.disassemble(errorObj));
	};

	// route callback methods

	// event methods
	cp.onapply = util.noop;

	return ViewModel;
});