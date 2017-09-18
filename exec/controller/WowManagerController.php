<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class WowManagerController extends BaseController{
	private $secureCd = "5588937";

	public function __construct(){
		parent::__construct();

		// 추 후 DB 통합 작업이 되면 아래 내용은 삭제 합시당~
		$connInfo = new MySqlConnectionInfo( "IP", "DBName" );
		$model = null;

		if ($connInfo->ping()){
			$model = ModelFactory::create( "WowManager", $connInfo );

			$this->setModel( $model );
		}
		else{
			// 요건 남기기..
			$this->applyModel( "WowManager" );
		}

		$this->applyService( "PtvManager" );
	}

	public function __destruct(){
		parent::__destruct();
	}

	public function custList(){
		$idCust = $this->parseParam( "id_cust", "" );
		$page = $this->parseParam( "page", 1 );
		$count = $this->parseParam( "count", 500 );
		$ip = $this->parseParam( "ip", "" );
		$model = $this->model;
		$connInfo = null;
		$hasIP = strlen( $ip ) > 7;

		if ( $hasIP ){
			$connInfo = new MySqlConnectionInfo( $ip );
			$mInfo = array();

			$mInfo["id_cust"] = $idCust;
			$mInfo["ip"] = $ip;
			$mInfo["url"] = "localhost";

			if ($connInfo->ping() === false){
				$mInfo["res_code"] = 408;
				$mInfo["res_msg"] = "timeout";
				$this->setInfo( $mInfo );

				return;
			}

			$model = ModelFactory::create( "WowManager", $connInfo );
			$mInfo["res_code"] = 200;
			$mInfo["res_msg"] = "";

			$this->setInfo( $mInfo );
		}

		$this->setData( $model->selectWowCustLinkList( $idCust, $page, $count ) );
	}

	public function clientOptInfo(){
		$idCust = $this->parseParam( "id_cust", "" );
		$this->setData( $this->model->selectOneClientOpt( $idCust ) );
	}

	public function clientOptUpdate(){
		$idCust = $this->parseParam( "id_cust", "" );
		$ip = $this->parseParam( "ip", "" );
		$model = $this->model;
		$mInfo = $this->service->testDBPing( $ip, "WowManager" );
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

	public function clientBillLogCSV(){
		$sDateDef 	= date("Y-m-d");
		$idCust 	= $this->parseParam( "id_cust", "" );
		$ip 		= $this->parseParam( "ip", "" );
		$dtStart 	= $this->parseParam( "dt_start", $sDateDef );
		$dtEnd 		= $this->parseParam( "dt_end", $sDateDef );
		$seq 		= $this->parseParam( "seq", 0 );
		$mInfo 		= $this->service->testDBPing( $ip, "WowManager" );
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
		$mInfo = $this->service->testDBPing( $ip, "WowManager" );
		$iResCode = $mInfo["res_code"];

		if (($iResCode > 0) && ($iResCode < 400)){
			$model = $this->service->getModel();
			$this->setData( $model->selectLastContentList( $count ) );
		}

		if ($iResCode > 0){
			$this->setInfo( $mInfo );
		}
	}

	// 뉴키 만화 적용 기능 추가 - 2017.04.05 by jhson [시작]
	public function clientProdInfo(){
		$idCust = $this->parseParam( "id_cust", "" );
		$this->setData( $this->model->selectOneClientProd( $idCust ) );
	}

	public function clientProdUpdate(){
		$idCust = $this->parseParam( "id_cust", "" );
		$prod100 = $this->parseParam( "prod_100", "0" );
		$prod010 = $this->parseParam( "prod_010", "0" );
		$prod001 = $this->parseParam( "prod_001", "0" );
		$idProd = $prod100 . $prod010 . $prod001;
		$ip = $this->parseParam( "ip", "" );
		$model = $this->model;
		$mInfo = $this->service->testDBPing( $ip, "WowManager" );
		$iResCode = $mInfo["res_code"];

		if (strpos($idProd, "9") !== false){
			$idProd = "";
		}

		if (($iResCode > 0) && ($iResCode < 400)){
			$model = $this->service->getModel();
			$this->setData( $model->updateClientProd( $idCust, $idProd ) );
		}

		if ($iResCode > 0){
			$mInfo["id_cust"] = $idCust;
			$this->setInfo( $mInfo );
		}
	}
	// 뉴키 만화 적용 기능 추가 - 2017.04.05 by jhson [종료]
}