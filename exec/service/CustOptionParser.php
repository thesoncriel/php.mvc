<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

// 참고 자료
//movie category
/*
1 = 최신영화
2 = 한국영화
3 = 외국영화
4 = 성인영화
5 = 3D
6 = 프리미엄관 (유료)  
*/

class CustOptionParser extends BaseService{
	public function __construct(&$config = null){
		parent::__construct($config);

	
	}

	public function __destruct(){
		parent::__destruct();
	}

	public function setModel(&$model){
		parent::setModel($model);
	}

	// 자릿수별 코드 값을 Map의 Key-value 쌍으로 넣어주고 반환 한다.
    public function toMap($code){
        $mRet = array();
        $mRet["PRICE_CATEGORY"]         = substr($code, 0, 1);
        $mRet["CATEGORY"]               = substr($code, 1, 1);
        $mRet["MODE_ADULT_MOVIE_VIEW"]  = substr($code, 2, 1);
        $mRet["MODE_ADULT"]             = substr($code, 3, 1);
        $mRet["MODE_PPV_MOVIE_VIEW"]    = substr($code, 4, 1);
        $mRet["MODE_ADT_MALL_VIEW"]     = substr($code, 5, 1);
        $mRet["SVC_STATUS"]             = "20";// 해당 목록을 볼 수 있는 가맹점은 모두 VODS_MASTER_INFO.SVC_STAUS가 20 이다.
        
        return $mRet;
    }
    
    // 옵션 목록을 반환 한다.
    public function getOptionList(&$optList = null){
    	$arr = null;
        $aRet = array();
        $i = -1;
        $iLen = 0;
        $code = "";

        if (is_array($optList)){
        	$arr = $optList;
        }
        else{
        	$arr = CustOption::getOptionCodeList();
        }

        $iLen = count($arr);
        
        while(++$i < $iLen){
            $code = $arr[ $i ];
            $aRet[] = $this->toMap($code);
        }
        
        return $aRet;
    }
    
    public function toPriceCategory($category){
        /*
        price category
        0 = free only
        1 = sale only
        2 = all
        */
        $price_category = 0;
        if( $category == 6)
        {
            $price_category = 2; // 모든 영화가 보이도록 변경 1;
        }
        else if($category == 5)
        {
            $price_category = 2;
        }
        
        return $price_category;
    }

    public function toIs3d($category){
        if (intval($category) === 5){
            return "1";
        }

        return "0";
    }
    
    public function toOptionCode(&$custInfo){
        $sRet = "";
        
        if ($custInfo == null){
            return $sRet;
        }
        
        $sRet .= $custInfo["PRICE_CATEGORY"];
        $sRet .= $custInfo["CATEGORY"];
        $sRet .= $custInfo["MODE_ADULT_MOVIE_VIEW"];
        $sRet .= $custInfo["MODE_ADULT"];
        $sRet .= $custInfo["MODE_PPV_MOVIE_VIEW"];
        $sRet .= $custInfo["MODE_ADT_MALL_VIEW"];
        
        return $sRet;
    }


    public function toRoomNoDictionary(&$clientInfo){
    	if (is_array($clientInfo) === false){
    		return null;
    	}

    	$aClientInfo = &$clientInfo;
    	$mRet = array();
        $i = -1;
        $iLen = count( $aClientInfo );
        $item = null;

        while(++$i < $iLen){
            $item = &$aClientInfo[ $i ];
            $mRet[ $item["CLIENT_MAC"] ] = $item["ROOM_NO"];
        }

        return $mRet;
    }

    /**
    가맹점 옵션과 방번호 및 각종 정보를 하나의 Map에 병합(merge) 한다.
    방번호는 입력된 Dictionary 에서 MAC 주소를 이용하여 추출하여 사용한다.
    @params
        mCustOpt - 가맹점 정보가 담긴 Map.
        mRoomnoDic - key(MAC) 와 value(방번호) 쌍으로 이뤄진 방번호 Dictionary.
        mac - 방번호를 가져 올 MAC주소.
        category - 카테고리 번호. 기존 html 캐시를 만들 때 사용하던 기능에 대한 하휘 호환성 유지. (신규 EType UI에선 필요치 않다.)
        useRoomNo - 방번호 사용 여부. 사용치 않는다면 해당 키(ROOM_NO)에 대하여 빈값으로 채운다.(기본 true)
    */
    public function toMerge(&$mCustOpt, &$mRoomnoDic, $mac = "", $category = "1", $useRoomNo = true){
        $mRet = &$mCustOpt;
        $mMac = &$mRoomnoDic;
        $mRet["MAC"] = $mac;
        $priceCategory = $this->toPriceCategory( $category );

        if ($useRoomNo && $mac !== ""){
            $mRet["ROOM_NO"] = $mMac[ $mac ];
        }
        else{
            $mRet["ROOM_NO"] = "";
        }

        $mRet["CATEGORY"] = $category;
        $mRet["PRICE_CATEGORY"] = $priceCategory;
        $mRet["OPTION_CODE"] = $this->toOptionCode( $mRet );
        $mRet["STB_PREMINUM"] = Config::$STBPremium;
        $mRet["STB_CODE"] = $this->toSTBCode( $mRet );

        return $mRet;
    }

    


    public function toMovieDetailCustInfo(&$custInfo){
        $aTarget = array(
            "MODE_ADULT",
            "MODE_ADULT_MOVIE_VIEW",
            "MODE_PPV_MOVIE_VIEW",
            "SVC_STATUS"
            );
        $sPrefix = "value_";
        $category = $custInfo["CATEGORY"];

        foreach ($aTarget as $index => $key) {
            $custInfo[ $sPrefix . strtolower( $key ) ] = $custInfo[ $key ];
        }

        $custInfo["is3D"] = $this->toIs3d( $category );

        return $custInfo;
    }

    // 베스트 초이스 패턴 내용을 반환 한다.
    public function getBestChoiceOptionList($iLen = 16){
        $arr = array();
        $item = null;
        $i = -1;

        while(++$i < $iLen){
            $item = array();
            $item["SVC_STATUS"]              = (($i & 8)? "20" : "60");
            $item["MODE_PPV_MOVIE_VIEW"]     = (($i & 4)? "1" : "0");
            $item["MODE_ADULT_MOVIE_VIEW"]   = (($i & 2)? "1" : "0");
            $item["MODE_ADULT"]              = (($i & 1)? "1" : "0");

            $arr[] = $item;
        }

        return $arr;
    }

    public function toBestChoiceCode( &$item ){
        return (($item["SVC_STATUS"] === "20") ? "1" : "0")
            . (($item["MODE_PPV_MOVIE_VIEW"] === "1") ? "1" : "0")
            . (($item["MODE_ADULT_MOVIE_VIEW"] === "1") ? "1" : "0")
            . (($item["MODE_ADULT"] === "1") ? "1" : "0");
    }


    public function getSTBOptionList(&$codeList = null){
        $aRet = array();
        $aCodeList = null;

        if ($codeList === null){
            $aCodeList = CustOption::getBinaryCodeList(128, 8);
        }
        else{
            $aCodeList = &$codeList;
        }

        foreach ($aCodeList as $index => $val) {
            $aRet[] = $this->toSTBMap( $val );
        }

        return $aRet;
    }

    /*
    STB Code 구조
    ※ 최상위 비트부터 나열함.
    1~4 = ID_PROD ---> 0000~1111
    5 = MODE_ADULT
    6 = MODE_ADULT_MOVIE_VIEW
    7 = MODE_PPV_MOVIE_VIEW
    8 = SVC_STATUS (1로 고정)
    */
    public function toSTBMap(&$code){
        $mRet = array();
        $mRet["ID_PROD"] = substr($code, 0, 4);
        $mRet["MODE_ADULT"] = substr($code, 4, 1);
        $mRet["MODE_ADULT_MOVIE_VIEW"] = substr($code, 5, 1);
        $mRet["MODE_PPV_MOVIE_VIEW"] = substr($code, 6, 1);
        $mRet["SVC_STATUS"] = "20";
        $mRet["STB_PREMINUM"] = Config::$STBPremium;
        
        return $mRet;
    }

    public function toSTBCode(&$opt){
        $sRet = "";
        $sIdProd = $opt["ID_PROD"];
        $iLenIdProd = strlen($sIdProd);

        switch ($iLenIdProd) {
            case 1:
                $sIdProd .= "000";
                break;
            case 2:
                $sIdProd .= "00";
                break;
            case 3:
                $sIdProd .= "0";
                break;
            case 4:
                break;
            default:
                $sIdProd = "0000";
                break;
        }

        $sRet = $sIdProd
            . (($opt["MODE_ADULT"] === "1")? "1" : "0" )
            . (($opt["MODE_ADULT_MOVIE_VIEW"] === "1")? "1" : "0" )
            . (($opt["MODE_PPV_MOVIE_VIEW"] === "1")? "1" : "0" )
            ;

        return $sRet;
    }

    /**
    신규 UI를 위한 가맹점 정보로 바꿔준다.
    만약 Model 에서 field를 추가하거나 변경 했다면 이 곳도 함께 변경 시켜주어야 한다.
    - 이 후 구UI가 필요 없어지게 되면 본 내용의 내용중 임의의 필드만 가져오는 부분을
      제거하도록 한다.
    */
    public function toNewCustInfo(&$mCustOpt, &$mRoomnoDic, $mac = "", $useRoomNo = true){
        $mRet = array();
        $iIdGroupInfo = 0;

        if (array_key_exists("ID_GROUP_INFO", $mCustOpt)){
            $iIdGroupInfo = intval( $mCustOpt["ID_GROUP_INFO"] );
        }

        $mRet["name"] = $mCustOpt["NM_SITE"];
        $mRet["id_cust"] = $mCustOpt["ID_SITE"];
        $mRet["id_cust_svc"] = $mCustOpt["ID_CONTRACT"];
        $mRet["id_prod"] = $mCustOpt["ID_PROD"];
        $mRet["svc_status"] = $mCustOpt["SVC_STATUS"];
        $mRet["adult_movie"] = $mCustOpt["MODE_ADULT_MOVIE_VIEW"];
        $mRet["adult_verify"] = $mCustOpt["MODE_ADULT"];
        // id_group_info 값이 존재 한다면 씨네호텔Lite 이므로 유료영화는 보여주지 않는다.
        $mRet["premium"] = ($iIdGroupInfo > 0) ? 0 : $mCustOpt["MODE_PPV_MOVIE_VIEW"];
        $mRet["service"] = $mCustOpt["SERVICE"];
        $mRet["service_name"] = $mCustOpt["SERVICE_NAME"];
        $mRet["service_type"] = $mCustOpt["SERVICE_TYPE"];
        $mRet["id_group_info"] = $iIdGroupInfo;
        
        $mRet["mac"] = $mac;

        if ($useRoomNo && $mac !== ""){
            $mRet["room_no"] = $mRoomnoDic[ $mac ];
        }
        else{
            $mRet["room_no"] = "";
        }

        return $mRet;
    }
}
?>