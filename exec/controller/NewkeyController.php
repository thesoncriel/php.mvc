<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class NewkeyController extends BaseController{
	private $type = "comic";

	public function __construct(){
		parent::__construct();

		$this->applyModel( "Newkey" );
        $this->applyService( "Newkey" );
        $this->service->setModel( $this->model );
	}

	public function __destruct(){
        parent::__destruct();
    }

	public function comicList(){
		$type = $this->parseParam( "type", "comic" );
		$genre = $this->parseParam( "genre", "0" );
		$search = $this->parseParam( "search", "" );
		$page = $this->parseParam( "page", 1 );
		$count = $this->parseParam( "count", 32 );
		$adult = "";
		$data = null;
		$dataCount = 0;

		if ($genre === "99"){
			$genre = "";
			$adult = "1";
		}
		if ($genre === "0"){
			$genre = "";
		}

		$data = $this->service->type( $type )->getComicList( $genre, $adult, $search, $page, $count );
		$dataCount = $this->service->getComicListCount( $genre, $adult, $search );
        
        $this->setInfo( $genre . $adult . $search . $page . $count );
        $this->setCount( $dataCount );
        $this->setData( $data );
	}

	public function comicDetail(){
		$type = $this->parseParam( "type", "comic" );
		$serial = $this->parseParam( "serial", "" );
		$data = $this->service->type( $type )->getComicDetail( $serial );

		unset( $data["contents_server_path"] );

		$this->setData( $data );
	}

	// 세션에 저장한 type 과 serial 값을 이용해 만화 상세 정보를 가져 온다.
	public function getComicDetail(){
		$serial = $_SESSION["cv_serial"];
		$type = $_SESSION["cv_type"];
		$bookno = $_SESSION["cv_bookno"];
		$idcust = $_SESSION["cv_idcust"];

		if (!isset($serial) || !isset($type) || !isset($bookno) ||
			!$this->service->isRegistredIP($idcust, $_SERVER["REMOTE_ADDR"])){
			$this->send404();

			return;
		}

		$mInfo = $this->service->type( $type )->getComicDetail( $serial );

		$mInfo["fsp"] = "/CE/js/";// swf 플래시 파일 경로.
		$mInfo["cai"] = "/CE/css/img/page_alt.png";// 대체 이미지 경로
		$mInfo["cei"] = "/CE/css/img/page_empty.png";// 빈 이미지 경로
		$mInfo["cd"] = "";// 만화 이미지를 받아올 도메인
		$mInfo["send_bill_interval"] = 60;//빌로그 요청 간격(초)
		$mInfo["bookno"] = $bookno;
		$mInfo["type"] = $type;
		$mInfo["time_to_absent"] = 20; // 부재중으로로 바뀌는 시간(초)

		// 코믹 뷰어에선 필요 없으므로 제거 함.
		unset($mInfo["thumb_path"]);
		unset($mInfo["keyword"]);
		unset($mInfo["summary"]);

		
		return $mInfo;
	}

	public function comicBill(){

	}


	// 와우TV 임시 업무용.
	// 끝나면 삭제 할 것
	public function comicListWowtvtmp(){
		$type = $this->parseParam( "type", "comic" );
		$genre = $this->parseParam( "genre", "0" );
		$search = $this->parseParam( "search", "" );
		$page = $this->parseParam( "page", 1 );
		$count = $this->parseParam( "count", 32 );
		$custId = $this->parseParam( "custId", "" );
		$adult = "";
		$data = null;
		$dataCount = 0;
		$author = "";
		$cp = "";

		$author = $this->getRotationAuthor();
		$cp = $this->getFixedCP();

		if ($genre === "99"){
			$genre = "";
			$adult = "1";
		}
		if ($genre === "0"){
			$genre = "";
		}

		$data = $this->service->type( $type )->getComicList( $genre, $adult, $search, $page, $count, true, $author, $cp );
		$dataCount = $this->service->getComicListCount( $genre, $adult, $search, true, $author, $cp );
        
        $this->setInfo( $genre . $adult . $search . $page . $count . $author . $cp );
        $this->setCount( $dataCount );
        $this->setData( $data );
	}
	// 날짜별로 로테이션 도는 작가를 가져 온다.
	protected function getRotationAuthor(){
		$arr = array(
			 "923', '6', '889"
			,"923', '6', '886"
		);
		$day = (time() / (60 * 60 * 24)) + 5;
		$iMod = $day % count($arr);

		return $arr[ 0 ];
	}

	// 모든 컨텐츠를 제공할 제공사 코드
	protected function getFixedCP(){
		return "59";
	}
}