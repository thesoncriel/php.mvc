<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class ContentService extends JwayService{
	public function __construct(&$config = null){
		parent::__construct($config);
	}

	public function getMovieList($priceCategory, $category, $adultMovieView, $idGroupInfo = 0){
		$serviceType = $this->getServiceType();
		$key = "movielist_" . $serviceType . $priceCategory . $category . $adultMovieView . $idGroupInfo . "__";
		$hasCache = apc_exists( $key );
		$aRet = null;

		if ( $hasCache ){
			//echo "$key : 있다고?";
			return apc_fetch( $key );
		}

		$aRet = $this->model->selectMovieList( $priceCategory, $category, $adultMovieView, $idGroupInfo );

		apc_add( $key, $aRet, Config::$apcTimeLimit );

		return $aRet;
	}

	public function getMovieDetail($contentId){
		if (isset($contentId) == false || $contentId === ""){
			return null;
		}
		$key = "moviedetail_" . $contentId;
		$hasCache = apc_exists( $key );
		$mRet = null;

		if ($hasCache) {
			return apc_fetch($key);
		}

		$mRet = $this->model->selectOneMovieDetail( $contentId );
		apc_add( $key, $mRet, Config::$apcTimeLimit );

		return $mRet;
	}
}