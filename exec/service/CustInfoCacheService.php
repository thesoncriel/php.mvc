<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class CustInfoCacheService extends CacheWorker{
    protected $keyPrefix = "cust_info_";

	public function __construct(&$config = null){
		parent::__construct($config);
	}
    
    public function getCustInfoById($idCust, $useRoomNo = true){
        $sServiceType = $this->getServiceType();
        $key = $this->keyPrefix . $sServiceType . $idCust;
        $hasCache = apc_exists( $key );
        $mRet = null;
        $mOption = null;
        $mRoomno = null;

        if ($hasCache){
            return apc_fetch( $key );
        }

        $mRet = array();
        $mOption = $this->model->selectOneCustInfoById( $idCust );
        $mRoomno = $this->getRoomNoDictionaryByID( $idCust );

        // 가맹점 정보 검색 시 없다면 APC에 저장하지 않는다.
        if (($mOption === null) || ($useRoomNo && $mRoomno === null)){
            return null;
        }

        $mOption["AD_EXCEPT"] = CustOption::findExceptCode( $idCust );
        $mOption["SERVICE"] = $sServiceType;
        $mOption["SERVICE_NAME"] = $this->getServiceName();
        $mRet["option"] = $mOption;
        $mRet["roomno"] = $mRoomno;
        apc_add( $key, $mRet, Config::$apcTimeLimit );

        return $mRet;
    }

    /**
    가맹점 정보와 각종 설정옵션을 가져 온다.
    @param
        idCust - 가맹점ID
        category - 영상 카테고리. 기존 html 파일 캐시를 만들던 때에 대한 호환성 유지를 위해 존재. (기본값=1)
        mac - 방번호(ROOM_NO)를 얻기위한 MAC주소.
        compact - 신규 Etype UI에서 필요한 옵션만 가져온다. (기본값=false)
    */
    public function getCustOptionById($idCust, $category = "1", $mac = "", $compact = false, $clientType = "E"){
        $useRoomNo = $this->isPlayTv() && ($clientType !== "D");
        $mCustInfo = $this->getCustInfoById( $idCust, $useRoomNo );
        $mOption = &$mCustInfo["option"];
        $mRoomno = &$mCustInfo["roomno"];
        $mRet = null;

        if ( $mOption === null || ($useRoomNo && $mRoomno === null) ){
            return null;
        }

        if ($compact === false) {
            $mRet = $this->parser->toMerge( $mCustInfo["option"], $mCustInfo["roomno"], $mac, $category, $useRoomNo );
            $mRet["BC_CODE"] = $this->parser->toBestChoiceCode( $mRet );
        }
        else{
            $mRet = $this->parser->toNewCustInfo( $mCustInfo["option"], $mCustInfo["roomno"], $mac, $useRoomNo );
        }

        return $mRet;
    }

    public function getRoomNoDictionaryByID($idCust){
        if ($this->isPlayTv() === false){
            return array();
        }
        
        $aClientInfo = $this->model->selectCustClientInfoById( $idCust );

        if (($aClientInfo == null) || (count($aClientInfo) === 0)){

            return array(
                "temp" => "yes"
            );
        }
        
        return $this->parser->toRoomNoDictionary( $aClientInfo );
    }

    public function deleteCache($idCust){
        $sServiceType = $this->getServiceType();
        $key = $this->keyPrefix . $sServiceType . $idCust;

        return apc_delete( $key );
    }


    public function getMovieDetailCustInfoById($idCust, $category = "1", $mac = ""){
        $mRet = $this->getCustOptionById( $idCust, $category, $mac );
        $mRet = $this->parser->toMovieDetailCustInfo( $mRet );

        return $mRet;
    }
}