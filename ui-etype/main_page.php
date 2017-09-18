<?php
// error_reporting(E_ALL);
// ini_set("display_errors", 1);
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

$ctrl = ControllerFactory::create("CustInfo", $_GET["__debug"] === "1");
$mInfo = $ctrl->atNew()->getCustInfo();
$aServerIP = explode(".", $_SERVER["SERVER_ADDR"]);
/*
$mInfo : Map (CustInfo)
		array ( 
            "name" => "제이웨이 임시", // 가맹점명
            "id_cust" => "",	// 가맹점ID (11자리)
            "id_prod" => "",	// 메뉴 활성화 여부 - 자릿수별 차이: 3-영화, 2-TV, 1-만화
            "svc_status" => "",	// 20 이면 사용중. 그 외는 이상.
            "adult_movie" => "0",	// 성인 카테고리 출력 여부
            "adult_verify" => "0",	// 성인 인증 기능 사용 여부
            "premium" => "0",		// 프리미엄 메뉴 사용 여부
            "service" => "",        // 서비스 형태. wow, ptv
            "service_name" => "",   // 서비스 명칭. 와우시네, 시네호텔
            "id_group_info" => 0,   // 컨텐츠 그룹 설정 여부. bit 연산으로 이뤄져 있음.
            "client_type" => "",    // 클라이언트 형태. E or D
            "mac" => "",			// 클라이언트 맥주소
            "room_no" => ""			// 클라이언트 방번호
        )
*/

//print_r( $mInfo );

$name = $mInfo["name"];
$id_cust = $mInfo["id_cust"];
$prd = bindec( $mInfo["id_prod"] );
$adt = intval( $mInfo["adult_movie"] );
$prm = intval( $mInfo["premium"] );
$adv = intval( $mInfo["adult_verify"] );
$srv = $mInfo["service"];
$snm = $mInfo["service_name"];
$clt = ($mInfo["client_type"] === "E")? "etype" : "dtype";
$sip = $aServerIP[3];
$cip = $_SERVER["REMOTE_ADDR"];
$ver = Config::$Version;
$debugInfo = $_GET["CUSTID"] . " | $id_cust | $clt | $srv | $cip ($sip)";
$newkeywowtv = "";

$bDoctypeEnable = !$ctrl->isOldIE();

if ($bDoctypeEnable){
?><!DOCTYPE html><?}

// 와우TV의 뉴키 임시 작가 보여주기 기능을 없앨 땐 아래 주석만 남기고 그 아래는 모두 삭제
include "main_page.html.php";

include "main_page.html.php";