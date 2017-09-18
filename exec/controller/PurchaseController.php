<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

/**
결제 관련 기능을 담당하는 컨트롤러.
내부적으로 allatutil.php 의 요소를 일부 이용하므로
본 컨트롤러를 이용 시 반드시 allatutil.php 를 include 해야 한다.
여기서 별도로 하지 않는 이유는 일반적으로는 쓰일일이 거의 없는 요소이기 때문이다.

참고로 본 컨트롤러를 직접적으로 이용하는 purchase_trigger.php 에서는 allatutil.php를 include 하고 있다.
*/
class PurchaseController extends BaseController{
	private $at_cross_key = ""; //"가맹점 CrossKey";     //설정필요 [사이트 참조 - http://www.allatpay.com/servlet/AllatBiz/helpinfo/hi_install_guide.jsp#shop]
	private $at_shop_id = "celrunsn";
	// 고정값. 서버형 시절의 잔재가 남은 것임.
	private $no_equip = "AL00";

	private $purchaseService = null;

	public function __construct(){
		parent::__construct();

		if (Config::$dbname === ""/*조건*/){
            $this->applyModel( "WowContent" );
        }
        else{
            $this->applyModel( "Content" );
        }

		$this->applyService( "Content" );
		$this->service->setModel( $this->model );

		$this->purchaseService = new PurchaseService();
	}

	public function purchaseInfoCheck(){
		$contentId = $this->parseParam( "contentId", "" );
		$custId = $this->parseParam( "custId", "" );
		$mac = $this->parseParam( "mac", "" );

		$this->setInfo( $this->purchaseService->hasPurchaseInfo( $contentId, $custId, $mac ) );
	}

	public function getPurchaseInfo(){
		$serviceType = $this->parseParam( "serviceType", "" );
		$contentId = $this->parseParam( "contentId", "" );
		$custSvcId = $this->parseParam( "custSvcId", "" );
		$custId = $this->parseParam( "custId", "" );
		$name = $this->parseParam( "name", "" );
		$mac = $this->parseParam( "mac", "" );

		$this->preventAutoPrint = true;
		
		if (!($contentId && $custSvcId && $custId && $mac)){
			$this->setValid(false);
			$this->setMsg("요청 인자가 잘못 되었습니다.");

			return;
		}
		
		$mCont = $this->service->getMovieDetail( $contentId );

		if (!isset($mCont) || ($mCont === null)){
			$this->setValid(false);
			$this->setMsg("컨텐츠 정보가 없습니다.");

			return;
		}

		$sTime = date('YmdHis');
		$orderNo = $custId . $custSvcId . $sTime . $contentId . $mac;
		$ip = $_SERVER['REMOTE_ADDR'];

		$mData = array(
			"shop_id" => "celrunsn",
			"order_no" => $orderNo,
			"amt" => $mCont["amt_price"],
			"ip" => $ip,
			"content_id" => $contentId,
			"title" => $mCont["title"],
			"series_id" => $mCont["series_id"],
			"cd_purchase" => 1,
			"no_equip" => $this->cd_purchase,
			"tp_service" => $serviceType,
			"mac" => $mac,
			"id_cust" => $custId,
			"id_cust_svc" => $custSvcId,
			"name" => $name,
			"addr" => "회사명"
		);

		return $mData;
	}

	public function purchaseCoupon(){
		$couponSerial = "";
		$couponSerial .= $this->parseParam("coupon0", "");
		$couponSerial .= $this->parseParam("coupon1", "");
		$couponSerial .= $this->parseParam("coupon2", "");
		$couponSerial .= $this->parseParam("coupon3", "");
		$custId 	= $this->parseParam("custId");
		$contractId 	= $this->parseParam("custSvcId");
		$mac 		= $this->parseParam("mac");
		$movieId 	= $this->parseParam("contentId");
		$confirmed  = $this->parseParam("confirmed", "N");
		$serviceType = $this->parseParam( "serviceType", "" );
		$mCont 		= $this->service->getMovieDetail( $movieId );
		$seriesId 	= (isset($mCont))? $mCont["series_id"] : "";
		$iAmtPurchase = (isset($mCont))? intval( $mCont["amt_price"] ) : 0;
		$bCouponAvailable = strlen($couponSerial) === 16;
		$iMaxAvailable = ($bCouponAvailable)? intval(substr($couponSerial, 7, 1) . substr($couponSerial, 10, 1)) * 500 : 0;

		$valid = false;
		$msg = "";
		$mRet = null;
		$mParam = null;
		$resultCode = "";

		if (!$bCouponAvailable){
			$msg = "쿠폰 번호가 유효하지 않습니다.";
		}
		else if (!isset($movieId) || $movieId === ""){
			$msg = "영상 정보가 누락 되었습니다.";
		}
		else if (!isset($seriesId) || $seriesId === ""){
			$msg = "영상 정보를 찾을 수 없습니다.";
		}
		else if ($iAmtPurchase < 1){
			$msg = "해당 영상에 가격이 없거나 잘 못 되었습니다.";
		}
		else if ($iMaxAvailable < $iAmtPurchase){
			$msg = "결제할 금액보다 적은 금액의 쿠폰 입니다.";
		}
		else if (($iMaxAvailable >= $iAmtPurchase) && ($confirmed === "N")){
			$msg = "본 쿠폰은 1회용 으로써 쿠폰 내 사용 가능 액수가 결제액 보다 초과 되어도 1회만 사용 가능 합니다.\n사용 하시겠습니까?";
			// 원래 메시지
			//$msg = "결제액보다 쿠폰액이 초과될 경우 이 쿠폰은 1회용 쿠폰으로, 결제액보다 쿠폰액이 초과 되어도 1회만 사용가능합니다.\n사용 하시겠습니까?";

			$this->setInfo(array(
				"confirm" => true
			));

			$this->setMsg($msg);

			return;
		}
		else{
			$valid = true;
		}

		$mParam = array(
			"COUPON_SERIAL" => $couponSerial,
			"ID_CUST" => $custId,
			"ID_CONTRACT" => $contractId,
			"ID_MAC" => $mac,
			"ID_MOVIE" => $movieId,
			"ID_SERIES" => $seriesId,
			"AMT_PURCHASE" => $iAmtPurchase
		);

		if ($valid){
			$mRet = $this->sendCouponInfo( $mParam );

			//$this->log($mRet);
			$resultCode = $mRet->CODE . "";
			$msg = $mRet->MESSAGE . "";

			if ($resultCode === "0000"){
				$mParam["NO_ORDER"] = $custId . $contractId . date('YmdHis') . $movieId . $mac;
				$mParam["TP_SERVICE"] = $serviceType;
				// 사용자IP
				$mParam["NO_ROOM"] = $_SERVER["REMOTE_ADDR"];
				// 장비번호
				$mParam["NO_EQUIP"] = $this->no_equip;
				// 구매 방법. 1=핸드폰, 2=카드, 3=쿠폰
				$mParam["CD_PURCHASE"] = "3"; // 쿠폰으로 등록 하기에 값은 3번
				$this->purchaseService->addBillLog( $mParam );
			}

			$this->setInfo( $resultCode );
			$this->setMsg( $msg );

			return;
		}

		$this->setValid( $valid );
		$this->setMsg( $msg );
	}

	protected function sendCouponInfo(&$params){
		$params["TS_REQ"] = date("Y-m-d H:i:s");

		return $this->purchaseService->sendPdu("IF-ONS-58", $params);
	}

	public function purchaseApproval(){
		$custId = $this->parseParam("ID_SITE");
		$custSvcId = $this->parseParam("ID_CUST_SVC");
		$contentId = $this->parseParam("CONTENT_ID", "");
		$mac = $this->parseParam("ID_MAC");
		$serviceType = $this->parseParam("TP_SERVICE");
		$allat_test_yn = $this->parseParam("allat_test_yn", "N");
		$completeCode = "0000";

		if ($contentId === ""){
			$this->setValid(false);
			$this->setMsg("상품 컨텐츠 정보가 없습니다.");

			return;
		}

		$mCont = $this->service->getMovieDetail( $contentId );

		if (!isset($mCont) || $mCont === null){
			$this->setValid(false);
			$this->setMsg("상품 컨텐츠 정보를 찾을 수 없었습니다.");

			return;
		}

		if ($allat_test_yn === "Y"){
			$completeCode = "0001";
		}

		$mResult = $this->purchaseService->sendToAllatApproval(
			$this->at_shop_id,
			$mCont["amt_price"],
			//100,//테스트용 금액
			$_POST["allat_enc_data"],
			$this->at_cross_key
		);

		if ($mResult["cd"] !== $completeCode){
			$this->setValid(false);
		}
		else{
			$orderNo = $custId . $custSvcId . date('YmdHis') . $contentId . $mac;
			$mParam["NO_ORDER"] = $orderNo;
			$mParam["ID_CUST"] = $custId;
			$mParam["ID_CONTRACT"] = $custSvcId;
			$mParam["ID_MAC"] = $mac;
			$mParam["TP_SERVICE"] = $serviceType;
			// 사용자IP
			$mParam["NO_ROOM"] = $_SERVER["REMOTE_ADDR"];
			// 장비번호
			$mParam["NO_EQUIP"] = $this->no_equip;

			$mParam["ID_MOVIE"] = $contentId;
			$mParam["ID_SERIES"] = $mCont["series_id"];
			// 구매 방법. 1=핸드폰, 2=카드, 3=쿠폰
			$mParam["CD_PURCHASE"] = "1"; // 핸드폰 구매기에 1번.
			$mParam["AMT_PURCHASE"] = $mCont["amt_price"];

			$iRet = $this->purchaseService->addBillLog( $mParam );

			if ($iRet < 1){
				$this->setValid(false);
				$this->setMsg("결제에는 성공 했으나 이용가능 이력 등록에는 실패 하였습니다.\n아래의 코드로 고객센터에 문의 바랍니다\n" .
					"MAC=" . $mac . "\n" .
					"ID_CUST=" . $custId . "\n" .
					"NO_ORDER=" . $orderNo . "\n" .
					"CONTENT_ID=" . $contentId . "\n" .
					"AMT_PURCHASE=" . $mCont["amt_price"] . "\n" .
					"TEL: 1566-1505"
				);

				return;
			}
		}

		$this->setInfo($mResult["cd"]);
		$this->setMsg($mResult["msg"]);
	}

	
}