;define("service.webcube", 
	["jquery", "envcheck", "util"],
	function($, env, util){

	var sId = "webcube"
	, sVer = "4,0,0,9" // 파일은 최신버전인데 구동할 땐 이걸로 하지 않으면 제대로 수행이 안되었음
	//, sVer = "4,1,7,6"
	, sPath = "/comicviewer/webcube4176/"
	, sUrl = ""
	, wc = null
	, hasSetup = false
	, fnGetWebcube = function(){
		if (!wc){
			return document.getElementById(sId);
		}
		
		return wc;
	}
	, fnExeWebcubeOld = function(url){
		var sFileName = fnGetFileName()
		, sTags = '<object classid="CLSID:29BC57E0-018D-46D2-B233-338B779C169C" '+
            'width="0" height="0" id="'+sId+'" codebase="'+sPath+sFileName+'#version='+sVer+'" '+
            'VIEWASTEXT onerror="OnActiveXError()" onreadystatechange="OnWebcubeReady()"></object>' +
            '<div class="loading"><div class="img"></div><br/>만화 뷰어를 불러오는 중입니다...</div>'

        , jqHead = $("head")
        ;

        //alert(sFileName + "," + sVer);
		
		window.OnActiveXError = fnOnActiveXError;
		window.OnWebcubeReady = fnSetActiveXState;//util.noop;
		window.CtrlInitComplete = fnCtrlInitComplete;
		window.CtrlStatus = fnCtrlStatus;

		jqHead.append('<script language="javascript" for="'+sId+'" event="CtrlInitComplete()">CtrlInitComplete();</script>');
		jqHead.append('<script language="javascript" for="'+sId+'" event="CtrlStatus(nCode,nResult)">CtrlStatus(0,0);</script>');

		window.isInstallActiveX = -1;

		//window.isInstallActiveX = 1;
		window.isInitOCX = false;

		sUrl = url;

		//document.write(sTags);

		$("body").html(sTags);

		//document.write(sTags);
	}
	, fnGetFileName = function(){
		var bOs64 = env.os64()
		, bWeb64 = env.web64()
		;

		//alert("os64=" + bOs64 + ",web64=" + bWeb64);

		if (!bOs64 && !bWeb64){
			return "WebCube.cab";
		}
		if (bOs64 && !bWeb64){
			return "WebCubewow.cab";
		}

		return "WebCube64.cab";
	}
	, fnOnActiveXError = function(){
		window.isInstallActiveX = 0;
		alert("ActiveX Error");
	}
	, fnSetActiveXState = function(){
		var webcube = fnGetWebcube()
		;

		//webcube.CtrlInitComplete = fnCtrlInitComplete;
		//webcube.CtrlStatus = fnCtrlStatus;


		if (webcube && (window.isInstallActiveX != 0) && webcube.readyState == 4){
			wc = webcube;
			window.isInstallActiveX = 1;

			//alert("fnSetActiveXState OK");

			//fnCtrlInitComplete();
		}



		//setTimeout(fnSetActiveXState, 500);
	}
	/**************************************
	이벤트명 : CtrlInitComplete()

	내   용 :
	- OCX 초기화가 끝나면 OCX가 CtrlInitComplete이벤트 발생 (OCX가 발생시키는 이벤트)

	- isInstallActiveX 변수 값을 1로 세팅 
	    : CtrlInitComplete 이벤트는 ActiveX가 Install되고 나서 나오는 이벤트이므로 다시 한번 1로 세팅해 줌.

	- OCX 초기화 전역변수 true로 세팅

	***************************************/
	, fnCtrlInitComplete = function(webcube){
		var webcube = fnGetWebcube()
		, aProtectArgs = [
			 "G"    // CheckSum ("G"값 고정)
			,"1"    // VmWare, Terminal 기능 차단(0) / 허용(1)
			,"1"    // Print 기능 차단(0) / 허용(1)
			,"1"    // SaveAs 기능 차단(0) / 허용(1)
			,"1"    // Mouse 기능 차단(0) / 허용(1)
			,"1"    // ScreenCapture 기능 차단(0) / 허용(1)
			,"1"    // SourceView 기능 차단(0) / 허용(1)
			,"1"    // Word Editor 기능 차단(0) / 허용(1)
			,"1"    // Mail로 보내기 기능 차단(0) / 허용(1)
			,"1"    // ClipBorad(Ctrl+C)기능 차단(0) / 허용 (1)
			,"1"	// ClipBorad(Ctrl+V) 기능 차단(0) / 허용 (1)
		];

		if (!webcube){
			setTimeout(fnCtrlInitComplete, 500);
			return;
		}

		//console.log("fnCtrlInitComplete");
		window.OnWebcubeReady = fnSetActiveXState;

		window.isInstallActiveX = 1;
		window.isInitOCX = true;
		//window.ProtectString = aProtectArgs.join("");

		//alert("before Protect");
		webcube.CmdMethod(1000, "0", 0, "0", 0, 0, "0");
		webcube.SetProtect(aProtectArgs.join(""));

		//alert("Protect");

		
		webcube.SetPolicy("#basic#,*:T-PAMSVWLcv+");
		//webcube.SetPolicy("#basic#,*t_viewer.php:T-PAMSVWLcv+");
		
		hasSetup = true;
		

		//fnCtrlStatus(0,0);
	}
	/**************************************

	이벤트명 : CtrlStatus()

	내   용 :
	- SetProtect 메소드가 호출된 후 발생하며, OCX의 현재 상태를 코드로 리턴해주는 이벤트

	- 리턴 코드가 오류인 경우 setMessage() 함수 호출

	- 리턴 코드가 정상인 경우 parent.mainFrm 프레임에 원하는 페이지 호출

	- 리턴 코드는 nCode : 0 , nResult : 0 인 경우 정상. 그외 코드는 오류임

	***************************************/
	, fnCtrlStatus = function(nCode, nResult){
		// if (nCode == 0 && nResult != 0){
		// 	alert("웹큐브 수행에 실패 하였습니다.");

		// 	return;
		// }

		if (!hasSetup || !fnGetWebcube()){
			setTimeout(fnCtrlStatus, 500);
			return;
		}

		//alert("newkey!!!");

		document.location = sUrl;
	}
/*****************************************************************************
웹큐브 신버전 부분
*****************************************************************************/
	, fnExeWebcube = function(url){
		window.__curl__ = url;

		//alert("url=" + window.__curl__);

		$("head").append(
			'<script type="text/javascript" src="./WebCube/WebCubeAgent_UserSet.js"></script>'
		);

		$("body").append(
			//'<script language="javascript" for="Obj" event="CtrlStatus( nCode, nResult)" src="./WebCube/ActiveX1.js"></script>' +
			//'<script language="javascript" for="Obj" event="CtrlInitComplete()" src="./WebCube/ActiveX2.js"></script>' +
			'<script type="text/javascript" src="./WebCube/WebCubeAgent_Msg.js"></script>' +
			'<script type="text/javascript" src="./WebCube/WebCubeAgent_Setup.js"></script>' +
			'<script type="text/javascript" src="./WebCube/WebCubeAgent_I.js"></script>' +
			//'<script type="text/javascript" src="./WebCube/ActiveX3.js"></script>'
			''
		);

		fnStartPolicy();
	}
	, fnStartPolicy = function(){
		if (window.StartPolicy){
			fnApplyBg();
			window.StartPolicy();

			return;
		}

		setTimeout(fnStartPolicy, 250);
	}
	, fnApplyBg = function(){
		//var jqBg = $("<div></div>");

		$("#panel_pluginCheck").hide();

		$("body").css("background", "#fff");

		// jqBg.css({
		// 	width: "100%",
		// 	height: "100%",
		// 	position: "absolute",
		// 	background: "#fff",
		// 	top: 0,
		// 	left: 0
		// 	//,"z-index": 0
		// });

		// $("body").append(jqBg);
	}
	
	;

	return {
		apply: function(url){
			var bOld = env.webcubeOld() || (util.IEVersion < 9);

			// 웹큐브 회피 (테스트용)
			//location.href = url;return;

			// 구버전 웹큐브가 설치 되어 있다면 그 것을 이용 한다.
			if (bOld){
				fnExeWebcubeOld(url);

				return;
			}

			fnExeWebcube(url);

			//

		}
	};
});