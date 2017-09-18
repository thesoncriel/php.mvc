<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class PurchaseService extends BaseService{
	private $pduUrl = "";
	private $serviceType = "PTV";
	private $port = "8070";

	public function __construct(&$commonModel = null){
		parent::__construct($commonModel);

		if (true/*조건*/){
			$this->serviceType = "WOW";
			$this->port = "8090";
		}
	}

	public function __destruct(){
		parent::__destruct();
	}

	public function sendPdu($cmd, &$params, $h = "", $v = "01"){
		$sParams = $this->serialize( $params );
		$port = $this->port;
		$sPdu = $sParams;
		$sPdu = urlencode($sPdu);
		$sRet = $this->remoteHttpGet(
			"http://localhost:" . $port . $this->pduUrl,
			array(
				"V" => "03",
				"C" => "20",
				"PDU" => $sPdu
				)
		);

		$this->log($sPdu);
		$this->log(/*위치*/ . $port . $this->pduUrl . "?V=03&C=20&PDU=" . $sPdu);
		$this->log("httpGetResCode=" . $this->httpGetResCode);

		return $this->parse( $sRet );
	}

	public function parse($str){
		$xml = simplexml_load_string($str);

		return $xml->RESULT;
	}

	public function serialize(&$params){
		$sRet = "";
		$i = 0;

		foreach ($params as $key => $value) {
			if ($i > 0){
				$sRet .= "|";
			}
			$sRet .= $key . "^" . $value;

			$i++;
		}

		return $sRet;
	}

	public function getModel(){
		if (isset($this->model) == false){
			$conn = new MySqlConnectionInfo( Config::$dbhostBillLog );
			$modelName = "Content";

			if ($this->serviceType === "WOW"){
				$modelName = "WowContent";
			}

			$this->model = ModelFactory::create( $modelName, $conn );
		}

		return $this->model;
	}

	public function hasPurchaseInfo($contentId, $custId, $mac){
		return $this->getModel()->hasPurchaseInfo($contentId, $custId, $mac);
	}

	public function addBillLog(&$params){
		return $this->getModel()->insertBillLog($params);
	}


	public function sendToAllatApproval(
		$at_shop_id, 
		$at_amt, 
		$allat_enc_data = "", 
		$at_cross_key,
		$completeCode = "0000")
	{
		// 요청 데이터 설정
  		//----------------------
		$at_data   = "allat_shop_id=".$at_shop_id.
               "&allat_amt=".$at_amt.
               "&allat_enc_data=".$allat_enc_data.
               "&allat_cross_key=".$at_cross_key;

          // 올앳 결제 서버와 통신 : ApprovalReq->통신함수, $at_txt->결과값
		//----------------------------------------------------------------
		$at_txt = ApprovalReq($at_data,"SSL");
		// 이 부분에서 로그를 남기는 것이 좋습니다.
		// (올앳 결제 서버와 통신 후에 로그를 남기면, 통신에러시 빠른 원인파악이 가능합니다.)

		// 결제 결과 값 확인
		//------------------
		$REPLYCD   =getValue("reply_cd",$at_txt);        //결과코드
		$REPLYMSG  =getValue("reply_msg",$at_txt);       //결과 메세지

		$mRet = array();
		$mRet["msg"] = $REPLYMSG;
		$mRet["cd"] = $REPLYCD;

		return $mRet;
	}
}