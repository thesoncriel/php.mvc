;define("service.weblauncher.desktop", ["jquery", "util", "config"],
	function($, util, config){

var mInfo = config.custInfo;
var DEMO_PLAY_SEC = 300000;
var CLIENT_TYPE = (mInfo && mInfo.client_type)? mInfo.client_type : "E";

function sendCommand(cmd){
	window.status = cmd;
	window.status = "";
}

// InitSetting.js [시작]
function Resize(Mode)
{
	var value_status	= "";
	if(Mode.indexOf("Mini") != -1)
		value_status = ""/*설정값*/;
	else if(Mode.indexOf("Main") != -1)
		value_status = ""/*설정값*/;
	else if(Mode.indexOf("CON") != -1)
		value_status = Mode;

	sendCommand(value_status);
}

function BKColor()
{
	sendCommand(""/*설정값*/);	
}

function MainExit()
{
	sendCommand(""/*설정값*/);
}
function CaptionMove(Mode)
{
	var value_status	= "";
	if(Mode == "CAP_MAIN")
		value_status = ""/*설정값*/;
	else if(Mode == "CAP_SETTING")
		value_status = ""/*설정값*/;
	else
		value_status = ""/*설정값*/;

	sendCommand(value_status);
}
// InitSetting.js [종료]


// movie.js 참고 [시작]
function serializePlayString(info){
	var fnMapValDef	= util.mapValDef
	,	sRet = "" +
		/*각종파라메터들*/
		""
	;

	return sRet;
}
// movie.js 참고 [종료]

// menu.js 참고 [시작]
function showTV(){
	if (CLIENT_TYPE === "D"){
		sendCommand(""/*설정값*/);
	}
	else{
		sendCommand(""/*설정값*/);
	}
}
// menu.js 참고 [종료]

// initialize [시작]
// 별다른 조건이 필요 없다면 즉시 수행하는 것들
CaptionMove( ""/*설정값*/ );
mInfo = undefined;
// initialize [종료]

		return {
			close: function(){
				MainExit();
			},
			captionMove: function(){
				CaptionMove( ""/*설정값*/ );
			},
			play: function(info){
				var sPlayString = serializePlayString(info);

				sendCommand(sPlayString);
			},
			showTV: function(){
				showTV();
			}
		};
	});