<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class AdultVerifyController extends BaseController{
	public function __construct(){
		parent::__construct( "STBConfig" );

        $this->applyService( "Base" );

        // 별도의 모델이 없으므로 직접 수행
        $this->parameterEscape();
	}

	protected function dateDiff($date1, $date2, $Service_Age){ 
	 $_date1 = explode("-",$date1); 
	 $_date2 = explode("-",$date2);
	 $YY = $_date1[0] - $_date2[0];
	 $MM = $_date1[1] - $_date2[1];
	 $DD = $_date1[2] - $_date2[2];
	 
	 $DIFF_YY = (int)$YY - $Service_Age;
	 $DIFF_MM = (int)$MM;
	 $DIFF_DD = (int)$DD;
	 
	 if($DIFF_YY > 0)
	 {
		 return true;
	 }
	 else if($DIFF_YY == 0)
	 {
		 if($DIFF_MM > 0)
			 return true;
		 else if($DIFF_MM == 0)
		 {
			 if($DIFF_DD > 0)
				 return true;
		 }
	 }
	  
	 return false;
	 
	}

	protected function isAdult($date){
		$sNowDate = date("Y-m-d");
		$sUserDate = date("Y-m-d", strtotime($date));

		//echo "now: $sNowDate | user: $sUserDate |";

		return $this->dateDiff( $sNowDate, $sUserDate, 18 );
	}

	public function check(){
		$name = $this->parseParam( "name", "" );
		$birth = $this->parseParam( "birth", "" );
		$telnum = $this->parseParam( "telnum", "" );
		$isValid = false;
		$msg = "";
		$sRemoteResult = "";
		$sRemoteUrl = ""/*호출 url*/;
		$mParam = null;
		$sRet = "";

		//echo "$name | $birth | $telnum | " . $_GET[name];

		if (!$name || !$birth || !$telnum){
			$msg = "잘못된 입력 입니다. 이름, 생년월일, 핸드폰 번호는 반드시 입력 하셔야 합니다.";
		}
		else if (preg_match("/^[가-힣]{2,}$/", $name) < 1){
			$msg = "이름은 한글로 최소 두글자 이상 입력 하십시오.";
		}
		else if (preg_match("/^\d{8}$/", $birth) < 1){
			$msg = "생년월일은 숫자 8자리로 입력 하십시오.";
		}
		else if (preg_match("/^01[0-9]\d{6,8}$/", $telnum) < 1){
			$msg = "핸드폰 번호는 010, 011, 016, 017, 018, 019 로 시작하며 최소 9자리, 최대 11자리의 숫자로만 작성 하십시오.";
		}
		else if ($this->isAdult( $birth ) === false){
			$msg = "성인인증에 실패하여 서비스를 이용하실수 없습니다.";
			$sRet = "tooYoung";
		}
		else{
			$isValid = true;

			$mParam = array(
				"name" => $name,
				"Birth" => $birth,
				"TelNum" => $telnum
			);

			$sRemoteResult = $this->service->remoteHttpGet( $sRemoteUrl, $mParam );

			$sRemoteResult = trim( $this->removeBOM($sRemoteResult) );

			if (strpos($sRemoteResult, "Success") > -1){
				$sRet = "new";
			}
			else if ($sRemoteResult === ""){
				$sRet = "exists";
			}
			else{
				$sRet = "unknown";
			}
		}

		$this->setValid( $isValid );
		$this->setMsg( $msg );
		$this->setData( $sRet );
		$this->setInfo($sRemoteResult);
	}
}