<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class AdultContentController extends BaseController{
	public function __construct(){
		parent::__construct( "STBConfig" );

		$this->applyModel( "AdultSchedule" );
	}

	// 사용 가능한 컨텐츠 목록을 페이징을 이용하여 가져 온다.
	// ※ list 라는 건 예약어로 그냥 못쓴다 -_-...
	public function _list(){
		$page = $this->parseParam( "page", 1 );
		$count = $this->parseParam( "count", 10 );
		$keyword = $this->parseParam( "keyword", "" );

		$this->setData( $this->model->selectAvailableContents( $page, $count, $keyword ) );
		$this->setCount( $this->model->selectAvailableContentsCount( $keyword ) );
	}

	
}