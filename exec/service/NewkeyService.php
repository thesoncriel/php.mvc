<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class NewkeyService extends BaseService{
	private $type = "comic";
	private $prod = 0;

	public function __construct(&$model = null){
		parent::__construct($model);
	}

	public function type($type){
		$this->type = $type;

		return $this;
	}

	public function prod($prod){
		$this->prod = $prod;

		return $this;
	}

	protected function getServiceType(){
		if (true/*조건*/){
			return "ptv";
		}

		return "wow";
	}

	public function getComicList($genre, $grade, $search, $page = 1, $count = 16, $wowtv = false, $author = "", $cp = ""){
		$type = $this->type;
		$sSrv = $this->getServiceType();
		$key = $sSrv . $type . "list_" . $genre . "_" . $grade . "_" . $search . "_" . $page . "_" . $count . "__" . $author;
		$aRet = null;

		if ( apc_exists( $key ) ){
			return apc_fetch( $key );
		}

		$iPage = intval($page);
		$iCount = intval($count);

		if ($wowtv && $type === "comic"){
			$aRet = $this->model->selectWowTvComicList( $genre, $grade, $search, "", $iPage, $iCount, $author, $cp);
		}
		else if ($type === "comic"){
			$aRet = $this->model->selectComicList( $genre, $grade, $search, "", $iPage, $iCount );
		}
		else{
			$aRet = $this->model->selectNovelList( $genre, $grade, $search, "", $iPage, $iCount );
		}

		apc_add( $key, $aRet, Config::$apcTimeLimit );

		return $aRet;
	}

	public function getComicListCount($genre, $grade, $search, $wowtv = false, $author = "", $cp = ""){
		$type = $this->type;
		$sSrv = $this->getServiceType();
		$key = $sSrv . $type . "count_" . $genre . "_" . $grade . "_" . $search . "__" . $author;
		$iCnt = 0;

		if ( apc_exists( $key ) ){
			return apc_fetch($key);
		}

		if ($wowtv && $type === "comic"){
			$iCnt = $this->model->getWowTvComicListCount( $genre, $grade, $search, $author, $cp );
		}
		else if ($type === "comic"){
			$iCnt = $this->model->getComicListCount( $genre, $grade, $search );
		}
		else{
			$iCnt = $this->model->getNovelListCount( $genre, $grade, $search );
		}

		apc_add( $key, $iCnt, Config::$apcTimeLimit );

		return $iCnt;
	}

	public function getComicDetail($serial){
		$type = $this->type;
		$key = $type . "detail_" . $serial;
		$mRet = null;
		$aBooks = null;

		if ( apc_exists( $key ) ) {
			return apc_fetch($key);
		}

		if ($type === "comic"){
			$mRet = $this->model->selectOneComicDetail( $serial );
			$aBooks = $this->model->selectComicBooksList( $serial );
		}
		else{
			$mRet = $this->model->selectOneNovelDetail( $serial );
			$aBooks = $this->model->selectNovelBooksList( $serial );
		}
		
		$aBooks = $this->checkBookFileExistsAndReorder( $aBooks );
		$mRet["each_books"] = $aBooks;
		apc_add( $key, $mRet, Config::$apcTimeLimit );

		return $mRet;
	}

	/**
	웹상에서 북 컨텐츠 존재 여부를 확인하고
	존재하는 것들에 대해서만 다시 수집하여 반환 한다.
	-- 성능상 이슈 때매 웹상의 체크 하는 기능은 제거 했음.
	*/
	public function checkBookFileExistsAndReorder(&$books){
		$mInfo = null;
		$aRet = array();

		foreach ($books as $index => $info) {
			if ( $this->isBookFileExists( $info ) === true ){
				//unset( $info[ "contents_server" ] );
				//unset( $info[ "contents_server_path" ] );
				$aRet[] = $info;
			}
		}

		unset( $books );

		return $aRet;
	}

	public function isBookFileExists( &$info ){
		// 간혹 부하가 많이 걸려서 이 부분은 체크 하지 않음
        return true;
		// $fileName = "index.xml";

		// $aRet = @file( $info["contents_server"] . $info["contents_server_path"] . $fileName );

		// $bRet = is_array( $aRet );

		// if ($bRet === false){
		// 	$this->log( "File Not Exists: " . $info["contents_server"] . $info["contents_server_path"] . $fileName );
		// }

		// return is_array( $aRet );
	}

	/*
	해당 가맹점 정보가 뉴키에 등록 되어 있는지 확인 한다.
	있다면 true, 아니면 false.
	없을 경우 g4_member, g4_member_ons, b2b_charge_history 를 차례대로 검증한 뒤 추가 한다.
	만약 셋 다 있는 상황이면 APC 캐시에 해당 내용을 등록하여
	같은 가맹점에 대하여 24시간이 지나기 전 까진 재검사를 하지 않는다.

	@param
		$idCust 가맹점ID (11자)
		$idCustSvc 계약ID (10자)
		$name 가맹점명
	*/
	public function checkNewkeyMember($idCust, $idCustSvc, $name){
		$key = "newkey_member_safe_" . $idCust;
		$model = $this->model;
		$iPass = 0;

		if ( apc_exists( $key ) ){
			return apc_fetch( $key ) === "1";
		}

		if ($model->existsMemberInfo($idCust) === false){
        	$this->log( "사용자 정보가 존재하지 않음" );
        	$model->insertMemberInfo($idCust, $name);
        }
        else{
			$iPass++;
        }

        if ($model->existsOnsInfo($idCust, $idCustSvc) === false){
        	$this->log( "ONS 정보가 존재하지 않음" );
        	$model->insertOnsInfo($idCust, $idCustSvc);
        }
        else{
			$iPass++;
        }

        if ($model->existsChargeHistory($idCust) === false){
        	$this->log( "뉴키캐시 정보가 존재하지 않음" );
        	$model->insertChargeHistory($idCust);
        }
        else{
			$iPass++;
        }

        if ($iPass === 3){
        	apc_add( $key, "1", Config::$apcTimeLimit * 24 );

        	return true;
        }

        return false;
	}

	public function checkNewkeyClient($idCust, $idCustSvc, $name, $ip){
        $model = $this->model;
        $iPass = 0;

        if (strlen($idCust) < 11){
        	$this->log( "가맹점ID가 잘 못 되었음." );

        	return false;
        }

        if (strlen($idCust) < 10){
        	$this->log( "계약ID가 잘 못 되었음." );

        	return false;
        }

        // 처음 수행할 때는 자료가 없을 시 삽입하고 일단 false를 반환.
        if ($this->checkNewkeyMember($idCust, $idCustSvc, $name) === false){
        	// 두번째 때 삽입이 정상적으로 수행 되었다면 true를 반환.
    		if ($this->checkNewkeyMember($idCust, $idCustSvc, $name) === false){
				$this->log("가맹점 정보없어 추가 입력을 시도 하였으나 실패 했음.");

				return false;
    		}
        }
        
        if ($model->existsClient( $idCust, $ip ) === false){
            $this->log( "클라이언트 정보가 존재하지 않음" );
            $this->log( $model->insertClientInfo( $idCust, $ip ) );
        }
    }
    // 뉴키 DB에 등록된 IP 인지 확인한다.
    public function isRegistredIP($idCust, $ip){
    	if (!isset($idCust) || !isset($ip)){
    		return false;
    	}
		return $this->model->existsClient( $idCust, $ip );
    }
}