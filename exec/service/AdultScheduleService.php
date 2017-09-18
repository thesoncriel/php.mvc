<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class AdultScheduleService extends BaseService{
	protected $hist = null;
	protected $modelAdv = null;
	protected $epgChanged = false;
	protected $currEPG = "";
	protected $cdn = false;

	public function __construct(&$config = null){
		parent::__construct($config);
	}

	public function __destruct(){
		parent::__destruct();

		unset( $this->hist );
		unset( $this->modelAdv );
	}

	public function useLog($use){
        parent::useLog($use);

        if (isset($this->hist)){
            $this->hist->useLog($use);
        }
        if (isset($this->model)){
            $this->model->useLog($use);
        }
        if (isset($this->modelAdv)){
        	$this->modelAdv->useLog($use);
        }
    }

	public function setModel($model){
		parent::setModel($model);

		$this->hist = ModelFactory::create( "AdultReqHist", $this->config );
		$this->modelAdv = ModelFactory::create( "Advertise", $this->config );
	}

	public function getMoviePath(){
		return Config::$CDNStreamUrl;
	}

	/*

	*/
	public function convertForSTB(&$data, $errorCode = 0, $retryCount = 0){
		$mNext = $this->model->selectOneNextSchedule( $data["dt_bc_start"] );
		$mPrev = null;
		$aAd = $this->modelAdv->selectAdvUseListForSTB();
		$mMovie = array();
		$mRet = array();

		if ($errorCode > 0){
			$mPrev = $this->model->selectOnePrevScheduleForSTB( $data["dt_bc_start"] );
			$mMovie["duration"] = intval($mPrev["running_time"]);
			$mMovie["pos"] = 0;
			$mMovie["url"] = $this->getMoviePath() . $this->encPath( $mPrev["content_path"] );
		}
		else{
			$mMovie["duration"] = intval($data["running_time"]);
			$mMovie["pos"] = intval($data["pos"]);
			$mMovie["url"] = $this->getMoviePath() . $this->encPath( $data["content_path"] );
		}

		
		$mMovie["notice"] = $this->getNoticeByErrorCode( $errorCode, $retryCount );
		$mMovie["next_time"] = $mNext["dt_bc_start"];
		$mMovie["next_url"] = $this->getMoviePath() . $this->encPath( $mNext["content_path"] );

		if ($errorCode === 100 && $retryCount >= 3){
			$mRet["ERRORCODE"] = 200;
		}
		else{
			$mRet["ERRORCODE"] = $errorCode;
		}

		$mRet["TIME"] = date("Y-m-d H:i:s");
		$mRet["movie"] = $mMovie;
		$mRet["ad"] = $this->toIntFields( $aAd, "duration" );

		return $mRet;
	}

	public function encPath($path){
		return $this->encript4cdn( time() . "|" . $_SERVER["REMOTE_ADDR"] . "|/" . $path);
	}

	public function requestForSTB($reqIP, $reqMAC, $channel, $errCode = 0, $retryCount = 0){
		$data = $this->model->selectOneScheduleForSTB();
		$mResult = $this->convertForSTB( $data, $errCode, $retryCount );

		$scheduleId = $mResult["schedule_id"];
		$pos 		= $mReturn["movie"]["pos"];

		$this->appendHist( $scheduleId, $reqIP, $reqMAC, $pos, $channel );

		return $mResult;
	}

	public function getNoticeByErrorCode($errorCode, $retryCount = 0){
		if ($retryCount < 3){
			return "";
		}

		switch($errorCode){
			case 0:
				return "";
			default:
				return "지금 서비스가 원활하지 않습니다. 프런트로 문의해 주세요.";
		}
	}

	/*
	현재 시간 이후로 설정된 모든 스케줄 내용을 가져온다.
	*/
	public function getScheduleByDateNow(){
		$date = date_format( date_create(), "Y-m-d H:i:s" );
		
		return $this->model->selectScheduleByDateGT( $date );
	}

	/*
	데이터를 스케줄 마지막에 추가 한다.
	*/
	public function appendSchedule($contentId, $runningTime){
		$mLast = $this->model->selectOneLastSchedule();
		$date = $this->calcSnappedNextDatetime( $mLast["dt_bc_start"], $mLast["running_time"] );

		return $this->model->insertSchedule( $contentId, $date );
	}
	public function appendScheduleAll(&$arr){
		$iCnt = 0;
		$mLast = $this->model->selectOneLastSchedule();
		$date = null;
		$contentId = "";

		// 최근 스케줄이 없을 경우 (처음 만들 경우)
		// 현재 날짜를 대신 넣어 준다.
		if (!$mLast || (strlen($mLast["dt_bc_start"]) < 10)){
			$date = date("Y-m-d H:i" . ":00");
		}
		else{
			$date = $this->calcSnappedNextDatetime( $mLast["dt_bc_start"], $mLast["running_time"] );
		}

		foreach($arr as $key => $val){
			$contentId = $val["content_id"];

			if ( $this->model->insertSchedule( $date, $contentId ) == true ){
				$iCnt++;
			}

			$date = $this->calcSnappedNextDatetime( $date, $val["running_time"] );
		}

		return $iCnt;
	}

	public function checkEPGAndAppendAuto($channel = 1){
		$this->model->setChannel( $channel );

		$mRet1 = $this->checkEPGAndAppendAuto_step1( $channel );
		$mRet2 = $this->checkEPGAndAppendAuto_step2( $channel );
		$mRet = array();

		$mRet["step1"] = $mRet1;
		$mRet["step2"] = $mRet2;

		$this->refreshBeforeEPG();

		return $mRet;
	}

	/*
	자동으로 EPG를 체크하고 컨텐츠가 모자랄 경우 컨텐츠를 삽입 한다.
	이 때 사용되는 형식은 지그재그. (각 채널별로 번갈아가며 10개씩 채우기)
	*/
	public function checkEPGAndAppendAutoAsZigzag(){
		$iCheckCnt1 = 0;
		$iCheckCnt2 = 0;
		$mInsertResult = null;
		$mRet = array();
		$mRet["ch1"] = array();
		$mRet["ch2"] = array();
		$mRet["ch1"]["step1"] = $this->checkEPGAndAppendAuto_step1(1);
		$mRet["ch2"]["step1"] = $this->checkEPGAndAppendAuto_step1(2);
		$mRet["ch1"]["step2"] = $this->checkEPGAndAppendAuto_step2(1, true);
		$mRet["ch2"]["step2"] = $this->checkEPGAndAppendAuto_step2(2, true);

		$iCheckCnt1 = $mRet["ch1"]["step2"]["check_count"];
		$iCheckCnt2 = $mRet["ch2"]["step2"]["check_count"];

		// 둘 다 현재 3개 이상 남아 있다면 추가하지 않는다.
		if (($iCheckCnt1 > 3) && ($iCheckCnt2 > 3)){
			return $mRet;
		}

		$mInsertResult = $this->appendAutoAsZigzag($iCheckCnt1, $iCheckCnt2);
		$mRet["ch1"]["step2"]["insert_count"] = $mInsertResult["ch1"];
		$mRet["ch2"]["step2"]["insert_count"] = $mInsertResult["ch2"];

		$this->refreshBeforeEPG();
		$manyChannel = $this->model->whoManySchedule();
		$chSrc = "CH1";
		$chDest = "CH2";

		if ($manyChannel === "CH1"){
			$chSrc = "CH2";
			$chDest = "CH1";
		}

		$this->model->truncateSchedule($chSrc, $chDest);

		return $mRet;
	}
	/*
	STEP 1. 
	현재 EPG가 기존에 쓰이던 EPG와 다른지 체크 하여 
	다르다면 EPG 설정 내용을 업데이트 하고
	스케줄 내용을 최신 EPG를 이용하여 삭제/변경 한다.
	그리고 중간에 비게 된 스케줄을 다시 정리(refresh) 한다.
	*/
	protected function checkEPGAndAppendAuto_step1($channel = 1){
		$mRet = array();
		$sCurrEPG = $this->model->getMaxEPG();
		$sBeforeEPG = $this->config->getBeforeEPG();
		$iDelCnt = 0;
		$iUpdCnt = 0;
		$iRefCnt = 0;

		if ((strlen( $sCurrEPG ) > 5) && ($sCurrEPG !== $sBeforeEPG)){
			$this->currEPG = $sCurrEPG;// 여기에 등록되면 해당 작업이 다 끝나고 이전 EPG 값을 갱신 한다.
			$this->model->setChannel( $channel );

			$iDelCnt = $this->model->deleteByCurrEPG( $sBeforeEPG, $sCurrEPG );
			$iUpdCnt = $this->model->updateEPGByCurrEPG( $sCurrEPG );
			$iRefCnt = $this->refreshScheduleDateUsingSnapTime();
		}

		$mRet["curr_epg"] = $sCurrEPG;
		$mRet["before_epg"] = $sBeforeEPG;
		$mRet["delete_count"] = $iDelCnt;
		$mRet["update_count"] = $iUpdCnt;
		$mRet["refresh_count"] = $iRefCnt;

		return $mRet;
	}
	/*
	STEP 2.
	현재 시간을 기준으로 3시간 이후 부터 스케줄이 부족할 경우
	자동으로 스케줄을 생성 한다.
	@param
		resultOnly = true면 자동으로 삽입은 하지 않고 스케줄 현황 데이터만 전달 한다. (기본 false)
	*/
	protected function checkEPGAndAppendAuto_step2($channel = 1, $resultOnly = false){
		$mRet = array();
		$sDate = $this->dateAddHour( date("Y-m-d H:i:s"), 3 );
		$iCheckCnt = $this->model->setChannel( $channel )->selectScheduleByDateGTECount( $sDate );

		$this->log("checkEPGAndAppendAuto_step2 = " . $sDate);
		$this->log($iCheckCnt);

		$mRet["check_date"] = $sDate;
		$mRet["check_count"] = $iCheckCnt;
		$mRet["insert_count"] = 0;

		if (($resultOnly === true) || ($iCheckCnt > 3)){
			return $mRet;
		}

		$iInsCnt = $this->appendAuto( $channel );

		if ($iInsCnt < $this->config->getAutoCount()){
			$iInsCnt += $this->appendAuto( $channel );
		}

		$mRet["insert_count"] = $iInsCnt;

		return $mRet;
	}

	/*
	스케줄 적용 날짜의 기준: 통칭 스냅타임을 현재 시간 이후의 모든 데이터에 일괄 적용한다.
	*/
    public function refreshScheduleDateUsingSnapTime($channel = 1){
    	$this->model->setChannel( $channel );

        $aTarget = $this->getScheduleByDateNow();
        $mCurr = $this->model->selectOneScheduleByNow();
        $iRunningTime = 0;
        $sDate = "";
        $iLen = count($aTarget);

        if (!$mCurr || $iLen < 1){
        	return 0;
        }

        // 현재 진행되는 영상 내용을 기준으로 후속 편성 스케줄의 시간을 재편성 한다.
        $sDate = $mCurr["dt_bc_start"];
        $iRunningTime = intval($mCurr["running_time"]);

        foreach($aTarget as $key => $row){
        	$sDate = $this->calcSnappedNextDatetime($sDate, $iRunningTime, true);
        	$this->model->updateScheduleDate( $row["schedule_id"], $sDate );

        	$this->log( "refreshScheduleDateUsingSnapTime" );
        	$this->log( "scheduleId=" . $row["schedule_id"] );
        	$this->log( "date=" . $sDate );

        	$iRunningTime = intval( $row["running_time"] );
        }

        return $iLen;
    }

    /*
	Config 테이블에 설정된 Snap Time 과 지정된 날짜, 영상 수행 시간을 이용하여
	다음 영상 스케줄의 시작 일시를 계산한다.
	sStartDate = 계산 할 대상 날짜
	runningTime = 더할 시간 (초)
	useDateSnap = 계산하기 전, 대상 날짜에 대하여 미리 Snap Time을 적용 시킬 지의 여부
	*/
	public function calcSnappedNextDatetime($sStartDate, $runningTime, $useDateSnap = false){
    	$iRunningTimeSnapped = $this->calcSnappedRunningTime( $runningTime );

    	if ($useDateSnap && ($this->endsWith( $sStartDate, "00" ) == false)){
    		$sStartDate = $this->calcSnappedDatetime( $sStartDate );
    	}

    	$sRet = $this->dateAddSecond( $sStartDate, $iRunningTimeSnapped );

    	return $sRet;
	}

	public function calcSnappedDatetime($sDate){
		$iSnapTime = $this->config->getSnapTime();
		$iTime = strtotime( $sDate );
		$iMod = $iTime % $iSnapTime;
		$iRet = $iTime;

		if ($iMod > 0){
			$iRet += ( $iSnapTime - $iMod );
		}

		return date("Y-m-d H:i:s", $iRet);
	}

	/*
	특정 컨텐츠 재생 시간(Running Time)을 Snap Time을 적용하여 잘라낸 값을 계산 한다.
	*/
	public function calcSnappedRunningTime($runningTime){
		$iRunningTime = intval( $runningTime );
		$iAdTerm = $this->config->getAdTerm();
		$iSnapTime = $this->config->getSnapTime(); // 스냅타임 고정
		$iRunningTime += $iAdTerm;
		$iTimeMod = ($iRunningTime % $iSnapTime);
		$iTimeAdd = 0;

		if ($iTimeMod > 0){
			$iTimeAdd = $iSnapTime - $iTimeMod;
		}

		// 다음 시간 = 컨텐츠 시간 + 스냅으로 맞춘 시간 + 광고 시간
		$iRunningTimeSnapped = $iRunningTime + $iTimeAdd;

		// echo "iRunningTime = " . $iRunningTime . "<br>";
		// echo "iSnapTime = " . $iSnapTime . "<br>";
		// echo "iRunningTimeSnapped = " . $iRunningTimeSnapped . "<br>";

		return $iRunningTimeSnapped;
	}

	/*
	해당 날짜&시간을 변경하려 할 때 그 변경이 유효한지를 확인한다.
	*/
	public function checkValidModify($posDatetime){
		if ((isset($posDatetime) === false) ||
			(strlen($posDatetime) < 10)){
			return false;
		}

		$mSchedule = $this->model->selectOneScheduleByNow();
		$dateTarget = date_create( $posDatetime );
		$dateNow = date_create( $mSchedule["dt_bc_start"] );

		if (($dateTarget <= $dateNow)){
			return false;
		}

		return true;
	}

	/*
	특정 스케줄 ID에 대한 수정/삭제 유효성 여부를 확인한다.
	*/
	public function checkValidModifyById($scheduleId){
		$mSchedule = $this->model->selectOneSchedule( $scheduleId );

		return $this->checkValidModify( $mSchedule["dt_bc_start"] );
	}

	/*
	지정된 개수만큼 랜덤한 컨텐트ID 목록을 가져온다.
	*/
	public function getContentIdByRandom($channel = 1, $count = -1){
		$sDuplicated = $this->getDuplicatedContentId( $channel );
		$aContents = $this->model->selectAvailableContents( 1, 1000, "", $sDuplicated );
		$aRet = null;

		if ($count < 0){
			$count = $this->config->getAutoCount();
		}

		if (shuffle( $aContents ) == false){
			return array();
		}

		$this
		->log("getContentIdByRandom")
		->log("shuffle OK.");

		$aRet = array_slice( $aContents, 0, $count );

		$this
		->log("aRet length = " . count($aRet))
		->log("slice OK.");

		return $aRet;
	}

	public function getDuplicatedContentId($channel = 1){
		$otherChannel = ($channel === 1) ? 2 : 1;
		$noDupCount = $this->config->getNoDupCount();
		$arr1 = $this->model->selectDuplicateWarning( $noDupCount, $channel );
		$arr2 = $this->model->selectDuplicateWarning( $noDupCount, $otherChannel );
		$arr = array_merge( $arr1, $arr2 );
		//$arr = array_unique( $arr );
		$sRet = "'";

		foreach($arr as $index => $item){
			if ($index > 0){
				$sRet .= "','";
			}

			$sRet .= $item["content_id"];
		}

		$sRet .= "'";

		$this->log("getDuplicatedContentId result = " . $sRet);

		return $sRet;
	}

	public function appendAuto($channel = 1){
		$this->model->setChannel( $channel );
		$aTargets = $this->getContentIdByRandom( $channel );

		return $this->appendScheduleAll( $aTargets );
	}

	/*
	각 채널별로 최대 10개씩 나누어 번갈아서 삽입한다.
	*/
	public function appendAutoAsZigzag($chCount1 = 0, $chCount2 = 0){
		$iTotalCnt = $this->config->getAutoCount();
		$iSumCh1 = 0;
		$iSumCh2 = 0;
		$iAppdCnt = 0;
		$iAccu = $iTotalCnt;
		$aTargets = null;
		$i = 0;
		$mRet = array();
		$iDiffCnt1 = 0;
		$iDiffCnt2 = 0;

		// 첫 입력 때 각 채널별 개수 차이가 있으면
		// 그 차이를 미리 없애 준다.
		if ($chCount1 > $chCount2){
			$iDiffCnt1 = $chCount1 - $chCount2;
		}
		else if ($chCount1 < $chCount2){
			$iDiffCnt2 = $chCount2 - $chCount1;
		}

		while ($i++ < 100) {
			if ($iAccu <= 10){
				$i = 100;
				$iAppdCnt = $iAccu;
			}
			else{
				$iAppdCnt = 10;
			}

			$iAccu -= 10;

			if ($i > 1){
				$iDiffCnt1 = 0;
				$iDiffCnt2 = 0;
			}

			$this->model->setChannel( 1 );
			$aTargets = $this->getContentIdByRandom( 1, $iAppdCnt - $iDiffCnt1 );
			$iSumCh1 += $this->appendScheduleAll( $aTargets );

			$this->model->setChannel( 2 );
			$aTargets = $this->getContentIdByRandom( 2, $iAppdCnt - $iDiffCnt2 );
			$iSumCh2 += $this->appendScheduleAll( $aTargets );
		}

		$mRet["ch1"] = $iSumCh1;
		$mRet["ch2"] = $iSumCh2;

		return $mRet;
	}

	public function insert($contentId, $dtBcStart, $runningTime){
		$mInfo = array();

		$runningTime = $this->calcSnappedRunningTime( $runningTime );
		$mInfo["update_count"] = $this->model->updateAndPushScheduleDate( $dtBcStart, $runningTime );
		$mInfo["insert_count"] = $this->model->insertSchedule( $dtBcStart, $contentId );

		return $mInfo;
	}

	public function delete($scheduleId){
		$dtBcStart = "";
		$mInfo = array();
		$schedule = $this->model->selectOneSchedule( $scheduleId );
		$runningTime = $this->calcSnappedRunningTime( $schedule["running_time"] ) * -1;
		$dtBcStart = $schedule["dt_bc_start"];
		$mInfo["delete_count"] = $this->model->deleteSchedule( $scheduleId );
		$mInfo["update_count"] = $this->model->updateAndPushScheduleDate( $dtBcStart, $runningTime );

		return $mInfo;
	}

	public function appendHist($scheduleId, $reqIP, $reqMAC, $pos, $channel = false){
		if ($channel !== false){
			$this->hist->setChannel( $channel );
		}

		$this->hist->insertHistory( $scheduleId, $reqIP, $reqMAC, $pos );
	}

	public function refreshBeforeEPG(){
		if (strlen($this->currEPG) > 0){
			$this->config->setBeforeEPG( $this->currEPG );
		}
	}

	public function enableCdn($use){
		$this->cdn = $use;
	}
}