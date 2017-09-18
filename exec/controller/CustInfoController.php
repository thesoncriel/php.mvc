<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class CustInfoController extends BaseController{
    private $custInfoPath = "";
    private $movieListPath = "";
    private $movieDetailPath = "";
    
    private $custInfo;
    private $altCustId = "";
    private $useAtNew = false;

	public function __construct(){
		parent::__construct();

        $this->log("dbname::" . Config::$dbname);

        if (Config::$dbname === ""/*조건*/){
            $this->applyModel( "WowCustInfo" );
        }
        else{
            $this->applyModel( "CustInfo" );
        }

		
        $this->applyService( "CustInfo" );
        $this->service->setModel( $this->model );
	}

	public function __destruct(){
		parent::__destruct();
	}

    public function alt($custId = ""){
        $this->altCustId = $custId;

        return $this;
    }
    

    /*
    가맹점 정보 가져오기.
    */
    public function getCustInfo($custId = null){
        $idCust = $this->parseParam( "CUSTID", "empty" );
        $idCust = $this->parseParam( "CUST_ID", $idCust );
        $idCust = $this->parseParam( "ID_CUST", $idCust );
        $idCust = $this->parseParam( "IDCUST", $idCust );
        $category = $this->parseParam( "CATEGORY", "1" );
        $mac = $this->parseParam( "ID_MAC", "" );
        $mac = $this->parseParam( "MAC", $mac );
        $prodType = $this->parseParam( "PROD_TYPE", "" );
        $useAtNew = $this->useAtNew;
        $ip = $_SERVER["REMOTE_ADDR"];
        $mRet = null;
        $sClientType = $this->getClientType();

        if (strlen($custId) === 11){
            $idCust = $custId;
        }
        // id_cust 파라메터가 정상적이지 않다면
        else if (strlen($idCust) !== 11){
            // 클라이언트 IP를 통해 id_cust를 가져온다.
            $idCust = $this->model->getIdCustByIP( $ip );

            // 그래도 없다면
            if (strlen($idCust) !== 11){
                // 대체 ID를 이용하고
                if (strlen($this->altCustId) === 11){
                    $idCust = $this->altCustId;
                }
                // 그 마저도 없다면 답이 없음 -_-;
                else{
                    return null;
                }
            }
        }

        $this->preventAutoPrint = true; //JSON을 자동으로 출력하는 것을 방지

        $mRet = $this->service->getCustOptionById($idCust, $category, $mac, $useAtNew, $sClientType);

        if ($useAtNew === true){
            $this->checkMenuAndRedirect( $mRet["id_cust"], $mRet["id_prod"] );
            $this->checkNewkeyClient( $mRet );

            if ($mRet === null){
                $mRet = $this->createTmpCustInfo();
            }

            $mRet["client_type"] = $sClientType;
            // field test가 끝나면 아래를 지우고 그 아래 주석을 활성화 ㄱㄱㄱ
            $mRet["new_comicviewer"] = $this->isNewViewerUse( $idCust );
            //$mRet["new_comicviewer"] = true;
        }

        

        return $mRet;
    }

    protected function isNewViewerUse($idCust){
        $arr = array(
            // 시네호텔
			// 와우시네
			""
        );

        if (count($arr) == 0){
            return true;
        }

        return in_array($idCust, $arr, true);
    }

    protected function createTmpCustInfo(){
        return array ( 
            /*자료들..*/
        );
    }

    protected function checkMenuAndRedirect($idCust, $idProd = "000"){
        $menu           = $this->parseParam( "MENU", 0 );
        $iMenu          = intval( $menu );
        $sRedirectUrl   = "";
        $sUrlPrefix     = "";

        if ($iMenu === 1){
            $sRedirectUrl = "#/newkey/comic/0";
        }

        if ($sRedirectUrl !== ""){
            $sUrlPrefix = "./main_page.php?CUSTID=" . $idCust;
            header( "Location: " . $sUrlPrefix . $sRedirectUrl );

            exit();
        }
    }

    public function atNew(){
        $this->useAtNew = true;

        return $this;
    }

    public function checkNewkeyClient(&$mRet){
        $ip = $_SERVER["REMOTE_ADDR"];
        $model = ModelFactory::create("Newkey");
        $service = ServiceFactory::create("Newkey");
        $service->setModel($model);

        $service->checkNewkeyClient($mRet["id_cust"], $mRet["id_cust_svc"], $mRet["name"], $ip);

        unset($service);
        unset($model);
    }

    public function getClientType(){
        $path = getcwd();

        if ($this->endsWith( $path, "CE" )){
            return "E";
        }
        else{
            return "D";
        }
    }

    public function cacheTest(){
        $idCust = $this->parseParam( "id_cust", "empty" );
        $idCust = $this->parseParam( "cust_id", $idCust );

        $this->setData( $this->service->getCustOptionById($idCust, "1", "", true) );
    }



    /*
    특정 가맹점 캐시 지우기
    */
    public function cacheDelete(){
        $idCust = $this->parseParam( "id_cust", "empty" );
        $idCust = $this->parseParam( "cust_id", $idCust );
        $sParam = "";

        $idCust = trim( $idCust );

        $this->boxlog("가맹점 정보 캐시 삭제. 대상ID = " . $idCust, true);
        $isSucc = $this->service->deleteCache( $idCust );

        $this->log("결과: " . ($isSucc ? "OK" : "NO (이미 캐시가 제거됨)"));

        $this->setInfo( $isSucc );
    }

    protected function getCacheDeleteRemoteUrl( $ip ){
        return ""/*캐시 제거 url*/;
    }

    /*
    모든 캐시 지우기
    */
    public function cacheDeleteAll(){
        $this->boxlog("모든 캐시 삭제.", true);
        $isSucc = apc_clear_cache("user");
        $this->log("결과: " . ($isSucc ? "OK" : "NO"));

        $this->setInfo( $isSucc );
    }
}
?>