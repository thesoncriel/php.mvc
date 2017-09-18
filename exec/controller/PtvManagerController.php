<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class PtvManagerController extends BaseController{
	private $secureCd = "";

	public function __construct(){
		parent::__construct();

		$this->applyModel( "PtvManager" );
		$this->applyService( "PtvManager" );
	}

	public function __destruct(){
		parent::__destruct();
	}

	protected function sendRemoteHttp($url){
		$idCust = $this->parseParam( "id_cust", "" );
		$ip = $this->parseParam( "ip", "" );
		$sUrl = "";

		if (strlen($ip) < 7){
			$this->setValid(false)
			->setMsg("입력된 IP가 유효하지 않습니다.");

			return;
		}

		$mInfo = array();

		$sUrl = str_replace("#IP#", $ip, $url) . "?id_cust=" . $idCust . "&__secure_cd=" . $this->secureCd;
		$mData = $this->service->remoteHttpGetJSON( $sUrl );
		$mInfo["id_cust"] = $idCust;
		$mInfo["ip"] = $ip;
		$mInfo["res_code"] = $mData["res_code"];
		$mInfo["res_msg"] = $mData["res_msg"];
		$mInfo["url"] = $sUrl;

		$this->setInfo( $mInfo );
		$this->setData( $mData["data"] );
	}

	public function custList(){
		$idCust = $this->parseParam( "id_cust", "" );
		$page = $this->parseParam( "page", 1 );
		$count = $this->parseParam( "count", 500 );
		$ip = $this->parseParam( "ip", "" );
		$model = $this->model;
		$mInfo = $this->service->testDBPing( $ip );
		$iResCode = $mInfo["res_code"];

		if (($iResCode > 0) && ($iResCode < 400)){
			$model = $this->service->getModel();
			$this->setData( $model->selectCustLinkList( $idCust, $page, $count ) );
		}

		if ($iResCode > 0){
			$mInfo["id_cust"] = $idCust;
			$this->setInfo( $mInfo );
		}
	}

	public function clientList(){
		$idCust = $this->parseParam( "id_cust", "" );
		$ip = $this->parseParam( "ip", "" );
		$model = $this->model;
		$mInfo = $this->service->testDBPing( $ip );
		$iResCode = $mInfo["res_code"];

		if (($iResCode > 0) && ($iResCode < 400)){
			$model = $this->service->getModel();
			$this->setData( $model->selectClientList( $idCust ) );
		}

		if ($iResCode > 0){
			$mInfo["id_cust"] = $idCust;
			$this->setInfo( $mInfo );
		}
	}

	public function dkClientInfo(){
		$idCust = $this->parseParam( "id_cust", "" );
		$data = $this->service->getDKClientInfo( $idCust );

		$this->setData( $data );
	}

	// @override
	protected function checkSession($cmd){
		if ($cmd === "login" || $cmd === "logout"){
			return true;
		}

		$sAdminLogin = $_SESSION["admin_login"];

		if ($sAdminLogin !== "yes"){
			$this->setRedirect("/mng/#login");
			$this->setMsg("세션이 종료되어 로그인이 필요합니다.");

			return false;
		}

		return true;
	}

	/**
	클라이언트 옵션 정보 가져오기
	*/
	public function clientOptInfo(){
		$idCust = $this->parseParam( "id_cust", "" );
		$this->setData( $this->model->selectOneClientOpt( $idCust ) );
	}

	/**
	클라이언트 옵션 변경
	*/
	public function clientOptUpdate(){
		$idCust = $this->parseParam( "id_cust", "" );
		$ip = $this->parseParam( "ip", "" );
		$model = $this->model;
		$mInfo = $this->service->testDBPing( $ip );
		$iResCode = $mInfo["res_code"];

		if (($iResCode > 0) && ($iResCode < 400)){
			$model = $this->service->getModel();
			$this->setData( $model->updateClientOpt( $this->param ) );
		}

		if ($iResCode > 0){
			$mInfo["id_cust"] = $idCust;
			$this->setInfo( $mInfo );
		}
	}

	/**
	클라이언트 옵션 중 광고 관련 내용 변경
	*/
	public function clientOptAdvUpdate(){
		$idCust = $this->parseParam( "id_cust", "" );
		$ip = $this->parseParam( "ip", "" );
		$model = $this->model;
		$mInfo = $this->service->testDBPing( $ip );
		$iResCode = $mInfo["res_code"];

		if (($iResCode > 0) && ($iResCode < 400)){
			$model = $this->service->getModel();
			$this->setData( $model->updateClientOptAdv( $this->param ) );
		}

		if ($iResCode > 0){
			$mInfo["id_cust"] = $idCust;
			$this->setInfo( $mInfo );
		}
		
	}


	public function cacheDeleteAll(){
		$ip = $this->parseParam( "ip", "" );
		$sUrl = "";
		$mRet = null;

		if (strlen($ip) < 7){
			$this->setMsg("IP가 잘 못 되었습니다.")
			->setValid( false );

			return;
		}

		$sUrl = $this->getCacheDeleteAllRemoteUrl( $ip );
		$mRet = $this->service->remoteHttpGetJSON( $sUrl );

		$this->setInfo($mRet);
	}

	public function cacheDeleteCustInfo(){
		$ip = $this->parseParam( "ip", "" );
		$idCust = $this->parseParam( "id_cust", "" );
		$sUrl = "";
		$mRet = null;

		if (strlen($ip) < 7){
			$this->setMsg("IP가 잘 못 되었습니다.")
			->setValid( false );

			return;
		}

		$sUrl = $this->getCacheDeleteAllRemoteUrl( $ip, $idCust );
		$mRet = $this->service->remoteHttpGetJSON( $sUrl );

		$this->setInfo($mRet);
	}

	protected function getCacheDeleteCustInfoRemoteUrl( $ip, $idCust ){
        return "http://". $ip . ":8070/exec/cust_info_delete.php?id_cust=" . $idCust;
    }
    protected function getCacheDeleteAllRemoteUrl( $ip ){
        return "http://". $ip . ":8070/exec/cust_info_delete_all.php";
    }

	public function login(){
		$id = $this->parseParam( "id", "" );
		$pw = $this->parseParam( "pw", "" );
		$msg = "";

		if (!$this->model->isValidUserId( $id )){
			$msg = "로그인할 수 없는 아이디 입니다.";
		}
		else if (!$this->model->isValidUserPw( $pw )){
			$msg = "유효한 비밀번호가 아닙니다.";
		}

		if ($msg !== ""){
			$this->setMsg( $msg );
			$this->setValid( false );
			$this->setAuth( false );

			return;
		}

		$_SESSION["admin_login"] = "yes";

		$this->setRedirect( "/mng/admin.php" );
	}

	public function logout(){
		unset( $_SESSION["admin_login"] );

		$this->setMsg( "로그아웃 되었습니다." );
		$this->setRedirect( "/mng/#login" );
	}

	public function loginCheck(){
		// 로그인 체크 기능은 위의 checkSession 에서 맡고 있어서 빈 함수로 이용함.
	}



	public function clientBillLogCSV(){
		$sDateDef 	= date("Y-m-d");
		$idCust 	= $this->parseParam( "id_cust", "" );
		$ip 		= $this->parseParam( "ip", "" );
		$dtStart 	= $this->parseParam( "dt_start", $sDateDef );
		$dtEnd 		= $this->parseParam( "dt_end", $sDateDef );
		$seq 		= $this->parseParam( "seq", 0 );
		$mInfo 		= $this->service->testDBPing( $ip );
		$iResCode 	= $mInfo["res_code"];
		$path		= $_SESSION["__collectBillLogPath"];
		$data 		= null;
		$iSeq		= intval( $seq );

		if ($iSeq === 0){
			if ($path){
				@unlink( $path );
			}
			$path = $_SERVER["DOCUMENT_ROOT"] . "/_cache/bill_log_" . session_id() . "_" . rand(10000000, 99999999);

			$_SESSION["__collectBillLogPath"] = $path;
		}

		if (($iResCode > 0) && ($iResCode < 400)){
			$data = $this->service->collectBillLog( $path, $ip, $idCust, $dtStart, $dtEnd );
			$this->setData( $data );
			$this->setCount( count($data) );
		}

		if ($iResCode > 0){
			$mInfo["id_cust"] = $idCust;
			$this->setInfo( $mInfo );
		}
	}

	public function clientBillLogDownload(){
		$path = $_SESSION["__collectBillLogPath"];

		$this->attachmentByPath( $path, "영화상영내역.csv", "text/csv" );
	}


	public function LastContentList(){
		$count = intval( $this->parseParam( "count", 10 ) );
		$ip = $this->parseParam( "ip", "" );
		$model = $this->model;
		$mInfo = $this->service->testDBPing( $ip );
		$iResCode = $mInfo["res_code"];

		if (($iResCode > 0) && ($iResCode < 400)){
			$model = $this->service->getModel();
			$this->setData( $model->selectLastContentList( $count ) );
		}

		if ($iResCode > 0){
			$this->setInfo( $mInfo );
		}
	}


	public function dbDate(){
		$idCust = $this->parseParam( "id_cust", "" );
		$ip = $this->parseParam( "ip", "" );
		$model = $this->model;
		$mInfo = $this->service->testDBPing( $ip );
		$iResCode = $mInfo["res_code"];

		if (($iResCode > 0) && ($iResCode < 400)){
			$model = $this->service->getModel();
			$this->setData( $this->model->getDBDate() );
		}

		if ($iResCode > 0){
			$mInfo["id_cust"] = $idCust;
			$this->setInfo( $mInfo );
		}
		
	}
}