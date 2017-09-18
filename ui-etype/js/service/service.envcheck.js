;define("envcheck", ["util"], function(util){
	var bActX = !!window.ActiveXObject
	, fnFlashVer = function(){
		try{
			 try {
		      // avoid fp6 minor version lookup issues
		      // see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
		      var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
		      try { axo.AllowScriptAccess = 'always'; }
		      catch(e) { return 6; }
		    } catch(e) {}
		    return parseInt(
		    	new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1].split(",")[0]
		    	);
		}
		catch(e){
			return -1;
		}
	}
	, fnWebcubeOld = function(){
		try{
			var act = new window.ActiveXObject("WebCube.WebCubeCtrl.1");

			return !!act;
		}
		catch(e){
			return false;
		}
	}
	, sUserAgent = navigator.userAgent.toLowerCase()
	, iFlashVer = fnFlashVer()
	, bWebcubeOld = fnWebcubeOld()
	, bWeb64 = (sUserAgent.indexOf("x64") >= 0) || (sUserAgent.indexOf("wow64") >= 0)
	, bOS64 = (sUserAgent.indexOf("win64") >= 0)
	;

	return {
		// 액티브X 가능 여부
		activex: function(){
			return bActX;
		},

		// 플래시버전
		flashVer: function(){
			return iFlashVer;
		},
		// 플래시 가능 여부
		flash: function(){
			return iFlashVer >= 10;
		},
		// html5 지원 여부
		html5: function(){
			return !!window.Blob;
		},
		// 웹큐브 액티브X 버전 설치 여부
		webcubeOld: function(){
			return bWebcubeOld;
		},
		// IE 여부
		ie: function(){
			return util.isIE();
		},
		// IE 버전
		ieVer: function(){
			return util.IEVersion;
		},
		// OS 64비트 여부
		os64: function(){
			return bOS64;
		},
		// 웹브라우저 64비트 여부
		web64: function(){
			return bWeb64;
		}
	};
});