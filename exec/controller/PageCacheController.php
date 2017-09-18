<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class PageCacheController extends BaseController{
    private $movieListPath = "";
    private $movieDetailPath = "";
    
    private $modelCI;
    private $serviceCI;

    private $cacheSubName = "";
    private $movieDetailCustInfo = null;
    private $useCustInfo = true;
    private $custInfo = null;
    private $altCustId = "";

	public function __construct(){
		parent::__construct();

		$this->applyModel( "PageCache" );
		$this->applyService( "PageCache" );

		$this->service->setModel( $this->model );
		$this->modelCI = ModelFactory::create("CustInfo", $this->config);
		$this->serviceCI = ServiceFactory::create("CustInfo");
		$this->serviceCI->setModel( $this->modelCI );
        
        $cacheRoot = $_SERVER["DOCUMENT_ROOT"] . Config::$CacheRoot;
        
        $this->movieListPath = $cacheRoot . Config::$MovieListPath . "/";
        $this->movieDetailPath = $cacheRoot . Config::$MovieDetailPath . "/";
	}

	public function __destruct(){
		parent::__destruct();

		unset( $this->modelCI );
		unset( $this->serviceCI );
		unset( $this->movieDetailCustInfo );
	}
    
	public function sub($name){
		$this->cacheSubName = $name;

		return $this;
	}

	public function useCust($use){
		$this->useCustInfo = $use;

		return $this;
	}

	public function alt($custId = "70000009340"){
        $this->altCustId = $custId;

        return $this;
    }

	public function parseCustOptParams(){
        $idCust = $this->parseParam( "CUSTID", "empty" );
        $idCust = $this->parseParam( "CUST_ID", $idCust );
        $idCust = $this->parseParam( "ID_CUST", $idCust );
        $category = $this->parseParam( "CATEGORY", "1" );
        $mac = $this->parseParam( "MAC", "" );
        $prodType = $this->parseParam( "PROD_TYPE", "" );

        if (strlen($idCust) !== 11){
            if (strlen($this->altCustId) === 11){
                $idCust = $this->altCustId;
            }
            else{
                return null;
            }
        }

        $mCustOpt = $this->serviceCI->getCustOptionById( $idCust, $category, $mac );

        return $mCustOpt;
    }

    public function parseMovieDetailCustInfo(){
    	$mParam = $this->parseParams( 
	    		"value_svc_status_get", 
	    		"value_mode_adult_get",
	    		"category",
	    		"cust_id",
	    		"CUSTID",
	    		"CONTENT_ID"
    		);

    	if (strlen($mParam["CUSTID"]) === 11 ){
    		$mParam["cust_id"] = $mParam["CUSTID"];
    	}

    	if ($this->useCustInfo){
    		$mCustInfo = $this->serviceCI->getMovieDetailCustInfoById( 
    		$mParam["cust_id"], $mParam["category"] );

    		return array_merge( $mParam, $mCustInfo );
    	}
    	else{
    		return $mParam;
    	}
    }

    public function getErrorPath($file){
    	return $_SERVER["DOCUMENT_ROOT"] . $GLOBALS["__mvcRoot"] . ErrorView::$Path . "/" . $file;
    }

    /*
     * - 영화 목록 생성
     */
    public function movieListCreate(){
        $this->preventAutoPrint = true;
        $this->useLog(true);
        $this->boxlog( "영화 목록 - Movie List 생성 작업 시작", true );
        $this->service->movieListCreate( $this->cacheSubName );
    }
    /*
     * - 영화 상세 생성
     */
    public function movieDetailCreate(){
        $this->preventAutoPrint = true;
        $this->useLog(true);
        $this->boxlog( "영화 상세  - Movie Detail 생성 작업 시작", true );
        $this->service->movieDetailCreate( $this->cacheSubName );
    }
    /*
     * - Best Choice 영화 목록 생성
     */
    public function bestChoiceCreate(){
        $this->preventAutoPrint = true;
        $this->useLog(true);
        $this->boxlog( "Best Choice - Movie List 생성 작업 시작", true );
        $this->service->bestChoiceCreate( $this->cacheSubName );
    }
    /*
	- Box Office 순위 목록 생성
    */
    public function boxOfficeCreate(){
    	$this->preventAutoPrint = true;
        $this->useLog(true);
        $this->boxlog( "Box Office - Movie List 생성 작업 시작", true );
        $this->service->boxOfficeCreate( $this->cacheSubName );
    }
    /*
	- Box Office 순위 목록 생성
    */
    public function latestMovieCreate(){
    	$this->preventAutoPrint = true;
        $this->useLog(true);
        $this->boxlog( "Latest Movie - Movie List 생성 작업 시작", true );
        $this->service->latestMovieCreate( $this->cacheSubName );
    }
    /*
	- STB Keyboard 이용 UI 목록 생성
    */
    public function stbKeyboardCreate(){
    	$this->preventAutoPrint = true;
    	$this->useLog(true);
    	$this->boxlog( "STB Keyboard - Movie List 생성 작업 시작", true );
        $this->service->stbKeyboardCreate( $this->cacheSubName );
    }
    /*
	- STB Mouse 이용 UI 목록 생성
    */
    public function stbMouseCreate(){
    	$this->preventAutoPrint = true;
    	$this->useLog(true);
    	$this->boxlog( "STB Mouse - Movie List 생성 작업 시작", true );
        $this->service->stbMouseCreate( $this->cacheSubName );
    }
    /*
	- 영상 경로 파일 생성
		포스터는 모두 로컬 서버의 posters를 바라보게 되었으므로 사용치 않게 되었음.
    */
	/*
    public function moviePathCreate(){
    	$this->preventAutoPrint = true;
    	$this->useLog(true);
    	$this->boxlog( "영상 경로 - Movie Path Javascript 생성 작업 시작", true );
    	$this->service->moviePathCreate();
    }
    */
    
    /*
	- 영화 목록 파일 경로를 가져 온다.
    */
    public function getMovieListPath($optCode = null){
    	$mCustOpt = null;

    	if ($optCode === null){
    		$mCustOpt = $this->parseCustOptParams();
    		$optCode = $mCustOpt["OPTION_CODE"];

    		if (!$mCustOpt){
	    		return null;
	    	}
    	}

    	return $this->service->getMovieListCachePath( $this->cacheSubName ) . "/" . $optCode . ".html";
    }
    /*
	- 영화 상세 파일 경로를 가져 온다.
    */
    public function getMovieDetailPath(){
    	$mInfo = $this->getMovieDetailCustInfo();
    	$path = $this->service->getMovieDetailCachePath( $this->cacheSubName ) . "/" . $mInfo["CONTENT_ID"] . ".html";

    	//echo $path;

    	if ( $this->useCustInfo && (
    			($mInfo === null) || 
    	    	(strlen($mInfo["cust_id"]) !== 11))
    		){
    		return $this->getErrorPath( ErrorView::$MovieDetailCustId );
    	}

    	if (file_exists( $path ) === false){
    		return $this->getErrorPath( ErrorView::$MovieDetailContentId );
    	}

    	return $path;
    }

    /*
	- Best Choice 파일 경로를 가져온다.
    */
    public function getBestChoicePath(){
    	$mInfo = $this->getCustInfo();
    	$optCode = $mInfo["BC_CODE"];

    	return $this->service->getBestChoiceCachePath( $this->cacheSubName ) . "/" . $optCode . ".html";
    }
    /*
	- Box Office 파일 경로를 가져온다.
    */
    public function getBoxOfficePath(){
    	$mInfo = $this->getCustInfo();
    	$optCode = $mInfo["MODE_ADULT_MOVIE_VIEW"];

    	return $this->service->getBoxOfficeCachePath( $this->cacheSubName ) . "/" . $optCode . ".html";
    }
    /*
	- Latest Movie 파일 경로를 가져온다.
    */
    public function getLatestMoviePath(){
    	$optCode = "0";

    	return $this->service->getLatestMovieCachePath( $this->cacheSubName ) . "/" . $optCode . ".html";
    }
    /*
	- STB 키보드 타입 파일 경로를 가져 온다.
    */
    public function getSTBKeyboardPath(){
    	$mInfo = $this->getCustInfo();
    	$optCode = $mInfo["STB_CODE"];

    	return $this->service->getSTBKeyboardCachePath( $this->cacheSubName ) . "/" . $optCode . ".html";
    }
    /*
	- STB 마우스 타입 파일 경로를 가져 온다.
    */
    public function getSTBMousePath(){
    	$mInfo = $this->getCustInfo();
    	$optCode = $mInfo["STB_CODE"];

    	return $this->service->getSTBMouseCachePath( $this->cacheSubName ) . "/" . $optCode . ".html";
    }

    /*
	- 영화 상세에서 쓰이는 가맹점 정보를 가져 온다.
    */
    public function getMovieDetailCustInfo(){
    	if (isset($this->movieDetailCustInfo) === false){
    		$this->movieDetailCustInfo = $this->parseMovieDetailCustInfo();
    	}

		return $this->movieDetailCustInfo;
    }

    /*
	- CATEGORY, PROD_TYPE, CUSTID(CUST_ID, ID_CUST) 파라미터를 사용하는 View 에 전달 할 사용자 옵션 내용을 반환한다.
    */
    public function getCustInfo(){
    	if (isset($this->custInfo) === false){
    		$this->custInfo = $this->parseCustOptParams();
    	}

    	return $this->custInfo;
    }

}
?>