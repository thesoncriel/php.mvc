<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class AdvertiseController extends BaseController{
	public function __construct(){
		parent::__construct();

		$this->applyModel( "Advertise" );
	}

	public function _list(){
		$keyword 	= $this->parseParam( "keyword", "" );
		$page 		= $this->parseParam( "page", 1 );
		$count 		= $this->parseParam( "count", 10 );

		$this->setData( $this->model->selectAdvList( $keyword, $page, $count ) );
		$this->setCount( $this->model->selectAdvListCount( $keyword ) );
	}

	public function modify(){
		$adv_id 	= $this->parseParam( "adv_id", -1 );
		$adv_title 	= $this->parseParam( "adv_title", "" );
		$adv_type 	= $this->parseParam( "adv_type", "0" );
		$adv_use 	= $this->parseParam( "adv_use", "N" );
		$url 		= $this->parseParam( "url", "" );
		$adv_desc 	= $this->parseParam( "adv_desc", "" );
		$duration 	= $this->parseParam( "duration", 0 );
		$mInfo 		= array();

		if ($adv_id < 0){
			$mInfo["insert_count"] = $this->model->insertAdv( $adv_title, $adv_type, $url, $adv_desc, $duration );
		}
		else{
			$mInfo["update_count"] = $this->model->updateAdv( $adv_id, $adv_title, $adv_type, $adv_use, $url, $adv_desc, $duration );
		}

		$this->setInfo($mInfo);
	}

	public function detail(){
		$adv_id	= $this->parseParam( "adv_id", -1 );

		$this->setData( $this->toUTF8Fields( $this->model->selectOneAdv( $adv_id ), "adv_title", "adv_desc" ) );
	}
}
?>