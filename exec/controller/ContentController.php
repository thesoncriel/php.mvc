<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class ContentController extends BaseController{
	public function __construct(){
		parent::__construct();

		if (true/*조건*/){
            $this->applyModel( "WowContent" );
        }
        else{
            $this->applyModel( "Content" );
        }

		$this->applyService( "Content" );
		$this->service->setModel( $this->model );
	}

	public function movieList(){
		$category = $this->parseParam( "category", 1 );
		$adult = $this->parseParam( "adult", 1 );
		$page = $this->parseParam( "page", 1 );
		$count = $this->parseParam( "count", 500 );
		$custId = $this->parseParam( "custId", "" );
		$iCategory = intval( $category );
		$parser = ServiceFactory::create( "CustOptionParser" );
		$priceCategory = $parser->toPriceCategory( $iCategory );
		$custService = null;
		$custModel = null;
		$data = null;
		$mCustInfo = null;
		$iGroupInfo = 0;
		$modelName = "CustInfo";

		if ($custId !== "" && (strlen($custId) === 11)){
			if (true/*조건*/){
				$modelName = "WowCustInfo";
			}

			$custModel = ModelFactory::create( $modelName, $this->model );
			$custService = ServiceFactory::create( "CustInfo" );
			$custService->setModel( $custModel );
			$mCustInfo = $custService->getCustOptionById( $custId, "1", "", true );
			$iGroupInfo = intval( $mCustInfo["id_group_info"] );
		}
		
		$data = $this->service->getMovieList( $priceCategory, $iCategory, $adult, $iGroupInfo );

		$this->setInfo( $priceCategory . $iCategory . $adult );
		$this->setCount( count( $data ) );
		$this->setData( $data );
	}

	public function movieDetail(){
		$contentId = $this->parseParam( "contentId", "" );
		$data = $this->service->getMovieDetail( $contentId );

		$this->setData( $data );
	}
}