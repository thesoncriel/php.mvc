<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class PtvManagerService extends BaseService{
	protected $hist = null;
	protected $modelAdv = null;
	protected $billLogGroupData = null;

	public function __construct(&$config = null){
		parent::__construct($config);
	}

	public function __destruct(){
		parent::__destruct();
	}

	public function useLog($use){
        parent::useLog($use);
    }

	public function setModel($model){
		parent::setModel($model);
	}

	protected function getCustomConn($ip){
		$sDBName = "";

		if ($ip === "211.43.189.156"){
			$sDBName = "DK";
		}

		return new CustomConnectionInfo( $ip, $sDBName, Config::$dbuser, Config::$dbpass );
	}

	protected function getCustomModel($ip){
		$conn = $this->getCustomConn( $ip );

		return ModelFactory::create( "PtvManager", $conn );
	}

	public function getDKClientInfo($idCust){
		$model = $this->getCustomModel( "211.43.189.156" );
		$mRet = $model->selectDkClient( $idCust );

		return $mRet;
	}

	/**
	특정 IP 에 대하여 ping을 확인하고 연결이 정상적이라면
	modelName 에 따른 DAO를 만들어
	model 멤버에 바인딩 한다.
	*/
	public function testDBPing($ip, $modelName = "PtvManager"){
		$mInfo = array();
		$connInfo = null;
		$hasIP = strlen( $ip ) > 7;

		if ( $hasIP ){
			$connInfo = new MySqlConnectionInfo( $ip );
			$mInfo["ip"] = $ip;
			$mInfo["url"] = "localhost";

			if ($connInfo->ping() === false){
				$mInfo["res_code"] = 408;
				$mInfo["res_msg"] = "timeout";

				return $mInfo;
			}

			$this->model = ModelFactory::create( $modelName, $connInfo );
			$mInfo["res_code"] = 200;
			$mInfo["res_msg"] = "";
		}
		else{
			$mInfo["res_code"] = 0;
		}

		return $mInfo;
	}

	public function getBillLogGroupData(){
		if (is_array($this->billLogGroupData) === false){
			$this->billLogGroupData = array();
		}

		return $this->billLogGroupData;
	}

	public function setBillLogGroupData(&$billLogGroupData){
		$this->billLogGroupData = &$billLogGroupData;
	}

	public function collectBillLog($path, $ip, $idCust, $dtStart, $dtEnd){
		$data = $this->model->selectBillLog( $idCust, $dtStart, $dtEnd );
		$mIP = array("IP" => $ip);
		$aRet = array();
		
		foreach ($data as $index => $mRow) {
			$aRet[] = $mIP + $mRow;
		}

		if ( $this->appendDataToCSV( $path, $aRet ) ){
			return $aRet;
		}

		return null;
	}

	
}