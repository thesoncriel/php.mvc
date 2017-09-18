<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class AdultScheduleController extends BaseController{
	private $channel = 1;

	public function __construct(){
		parent::__construct( "STBConfig" );

		$this->applyModel( "AdultSchedule" );
		$this->applyService( "AdultSchedule" );
		$this->service->setModel( $this->model );
	}

	public function __destruct(){
		parent::__destruct();
	}

	// 날짜에 따른 스케줄 목록 출력
	// ※ list 라는 건 예약어로 그냥 못쓴다 -_-...
	public function _list(){
		$date = $this->parseParam( "date", $this->getNowDate() );

		$this->setData( $this->model->selectScheduleByDate( $date ) );
		$this->setInfo( $this->config->getAll() );
	}

	// 자동으로 설정된 개수만큼 랜덤하게 컨텐츠를 뽑아서 스케줄에 추가 한다.
	public function appendAuto(){
		$mInfo = $this->service->appendAutoAsZigzag();

		$this->setInfo( $mInfo );
	}

	/* 
	서버 내 자동 스케줄링에 의해 수행됨.
	1. 현재 EPG를 자동 비교하여 내용을 갱신함.
	2. 방송 스케줄이 부족할 경우 스스로 채움.
	*/
	public function checkEPGAndAppendAuto(){
		$mInfo = $this->service->checkEPGAndAppendAutoAsZigzag();

		$this->setInfo( $mInfo );
	}

	// 특정 위치에 스케줄을 삽입한다.
	public function insert(){
		$dtBcStart = $this->parseParam( "dt_bc_start" );
		$contentId = $this->parseParam( "content_id" );
		$runningTime = $this->parseParam( "running_time" );

		$mInfo = array();

		if ($this->service->checkValidModify( $dtBcStart ) === false){
			$this->setValid(false)
			->setMsg("현재 시간 이전의 스케줄에 대한 삽입은 불가 합니다.");
		}
		else{
			$mInfo = $this->service->insert($contentId, $dtBcStart, $runningTime);
		}

		$this->setInfo( $mInfo );
	}

	// 특정 스케줄을 삭제 한다.
	public function delete(){
		$scheduleId = $this->parseParam( "schedule_id" );
		$dtBcStart = "";
		//$runningTime = $this->parseParam( "running_time" );

		$mInfo = array();

		if ($this->service->checkValidModifyById( $scheduleId ) === false){
			$this->setValid(false)
			->setMsg("현재 시간 이전의 스케줄에 대한 삭제는 불가 합니다.");
		}
		else{
			$mInfo = $this->service->delete( $scheduleId );
		}

		$this->setInfo( $mInfo );
	}

	// 특정 스케줄에 대하여 광고를 변경 한다.
	public function updateAdv(){
		$scheduleId 	= $this->parseParam( "schedule_id" );
		$advId 		= $this->parseParam( "adv_id" );

		$mInfo = array();

		if ($this->service->checkValidModifyById( $scheduleId ) === false){
			$this->setValid(false)
			->setMsg("현재 시간 이전의 스케줄에 대한 변경은 불가 합니다.");
		}
		else{
			$mInfo = $this->model->updateAdvertise( $scheduleId, $advId );
		}

		$this->setInfo( $mInfo );
	}

	public function getAdvertise($advId){
		//$this->model.
	}

	public function getNowSchedule(){
		$mRet = $this->model->selectOneScheduleByNow();
	}

	// 지금 방영해야 할 스케줄 내용 출력
	public function now(){
		$this->setData( $this->getNowSchedule() );
	}

	// 지금 방영해야 할 스케줄 내용 출력 (실사용)
	public function stb(){
		//$this->useLog( false );

		$this->preventAutoPrint = true;
		$iErrorCode = intval( $this->parseParam( "ERRORCODE", 0 ) );
		$iRetryCount = intval( $this->parseParam( "RETRY_COUNT", 0 ) );

		$reqIP 		= $this->getClientIP();
		$reqMAC 	= $this->parseParam( "STBMAC", "" );
		//$pos 		= $mReturn["movie"]["pos"];

		if ($reqMAC == ""){
			$reqMAC = $this->parseParam( "stbmac", "" );
		}

		$reqMAC = str_replace(":", "", $reqMAC);
		$reqMAC = str_replace("-", "", $reqMAC);

		$mReturn = $this->service->requestForSTB($reqIP, $reqMAC, $this->channel, $iErrorCode, $iRetryCount);

		// tail -n 10000 /var/log/httpd/PlayTV-error_log | grep movielist
		// unset( $mResult );

		// 외부 업체에서 요청한 특정 JSON 포멧으로 주어야 하기에 별도로 출력 한다.
		echo json_encode( $mReturn );
	}


	public function updateAdterm(){
		$iCnt = 0;
		$adTerm = $this->parseParam( "ad_term" );
		//$mInfo = array();

		if ($adTerm === ""){
			$this->setValid(false)
			->setMsg("유효하지 않은 설정 입니다.");

			//$this->setInfo( $mInfo );

			return;
		}

		$this->config->setAdTerm( $adTerm );
		// 1, 2 채널을 동시에 업데이트 한다.
		$iCnt += $this->service->refreshScheduleDateUsingSnapTime( 1 );
		$iCnt += $this->service->refreshScheduleDateUsingSnapTime( 2 );
		$this->setCount( $iCnt );
		$this->setInfo( $this->config->getAll() );

		//$this->setInfo( $mInfo );
	}

	public function ch($ch = false){
		if ($ch === false){
			$channel = $this->parseParam( "channel", 1 );
			$channel = $this->parseParam( "ch", $channel );
			$iChannel = ( (is_numeric($channel))? intval($channel) : 1 );
		}
		else{
			$iChannel = ( (is_numeric($ch))? intval($ch) : 1 );
		}

		$this->channel = $iChannel;

		$this->model->setChannel( $iChannel );

		return $this;
	}

	public function cdn(){
		$this->service->enableCdn(true);

		return $this;
	}

	/*
	채널에 따라 모델측 처리가 공통으로 처리 되므로
	해당 메서드를 Override 함.
	*/
	// @Override
	public function run($cmd){
		

		parent::run($cmd);

		return $this;
	}
}