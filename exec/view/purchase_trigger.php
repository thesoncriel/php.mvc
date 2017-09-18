<?php
// error_reporting(E_ALL);
// ini_set("display_errors", 1);
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";
include_once $__path . "/lib/allatutil.php";

$ctrl = ControllerFactory::create("Purchase", false);
$info = $ctrl->getPurchaseInfo();

// 사용자IP
$NO_ROOM = $info["ip"];
// 주문번호. 아래와 같은 조합으로 이뤄짐
// 가맹점ID + 계약ID + 일자(YmdHis) + 컨텐츠ID + 맥주소
$NO_ORDER = $info["order_no"];
// 컨텐츠ID
$CONTENT_ID = $info["content_id"];
// 시리즈ID. 보통 컨텐츠 정보에 포함되어 있다.
$SERIES_ID = $info["series_id"];
// 구매가격
$AMT_PURCHASE = $info["amt"];
// 핸드폰구매=1, 카드=2, 쿠폰=3
$CD_PURCHASE = $info["cd_purchase"];
// AL000200002763 고정 (예전 서버형 시절의 것이 남겨진 것이라 함.)
$NO_EQUIP = $info["no_equip"];
// VODS_MASTER_INFO->SERVICE_TYPE과 동일.
$TP_SERVICE = $info["tp_service"];
// 사용자 MAC 정보
$ID_MAC = $info["mac"];
// 가맹점ID
$ID_SITE = $info["id_cust"];
// 계약ID
$ID_CUST_SVC = $info["id_cust_svc"];
// 영상제목
$TITLE = $info["title"];
// 결제자 성명 (가맹점명)
$NM_SITE = $info["name"];
// 주소. 셀런에스엔'으로 고정
$ADDR = $info["addr"];

?><html lang="ko">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Expires" content="-1">
	<meta http-equiv="Pragma" content="no-cache">
	<meta http-equiv="Cache-Control" content="No-Cache">
	<title>PPV결제</title>
	<script charset="euc-kr" src="https://tx.allatpay.com/common/NonAllatPayRE.js?v=99"></script>
	<script>
		function onLoaded(){
			var elemForm = document.getElementById( "form_purchaseInfo" )
			, port = "<?=$_SERVER["SERVER_PORT"]?>" || 80
			, domain = location.hostname
			, ret
			, path = elemForm.shop_receive_url.value
			;

			elemForm.shop_receive_url.value = "http://" + domain + ":" + port + path;

			ret = AllatPay_Approval( elemForm );

			AllatPay_Closechk_Start();
		}

		/*결과값 반환( receive 페이지에서 호출 )*/
		function result_submit(result_cd, result_msg, enc_data){
			var fm = document.getElementById( "form_purchaseInfo" );
			// 결제창 자동종료 체크 종료
			AllatPay_Closechk_End();
			
			if( result_cd != '0000' ){
				window.setTimeout(function(){alert(result_cd + " : " + result_msg);},1000);
			} else {
				fm.allat_enc_data.value = enc_data;

				fm.action = "/exec/purchase_approval.php";
				fm.method = "post";
				fm.target = "_self";

				try{
					fm.submit();
				}
				catch(e){
					alert("최종 결제 정보 전달에 실패 했습니다.");
				}
			}
		}

		if (document.attachEvent){
			document.attachEvent("onreadystatechange", onLoaded);
		}
		else{
			document.addEventListener("DOMContentLoaded", onLoaded);
		}
		
	</script>
</head>
<body>
	<form id="form_purchaseInfo" name="formPurchaseInfo" action="/exec/purchase_approval.php" method="post" target="_self">
		<input type="hidden" name="ord_name" value="<?=$NM_SITE?>">
		<input type="hidden" name="ord_add" value="<?=$ADDR?>">
		<input type="hidden" name="ord_email" value="">

		<input TYPE="hidden" NAME="NO_ROOM" value="<?=$NO_ROOM?>">
		<input TYPE="hidden" NAME="NO_ORDER" value="<?=$NO_ORDER?>">
		<input TYPE="hidden" NAME="CONTENT_ID" value="<?=$CONTENT_ID?>">
		<input TYPE="hidden" NAME="SERIES_ID" value="<?=$SERIES_ID?>">
		<input TYPE="hidden" NAME="AMT_PURCHASE" value="<?=$AMT_PURCHASE?>">
		<input TYPE="hidden" NAME="CD_PURCHASE" value="<?=$CD_PURCHASE?>">
		<input TYPE="hidden" NAME="NO_EQUIP" value="<?=$NO_EQUIP?>">
		<input TYPE="hidden" NAME="TP_SERVICE" value="<?=$TP_SERVICE?>">
		<input TYPE="hidden" NAME="ID_MAC" value="<?=$ID_MAC?>">
		<input TYPE="hidden" NAME="ID_SITE" value="<?=$ID_SITE?>">
		<input TYPE="hidden" NAME="ID_CUST_SVC" value="<?=$ID_CUST_SVC?>">
		<!-- =========================================== 올앳결제 stsrt ========================================== -->

		<!-- 올앳결제 파라멘타값 -->
		<!-- 필수 -->
		<input TYPE="hidden" NAME="allat_shop_id" value="celrunsn"><!-- 상점 ID -->
		<input TYPE="hidden" NAME="allat_order_no" value="<?=$NO_ORDER?>"><!-- 주문번호 -->
		<input TYPE="hidden" NAME="allat_amt" value="<?=$AMT_PURCHASE?>"><!-- 승인금액 -->
		<input TYPE="hidden" NAME="allat_pmember_id" value="<?=$NO_ROOM?>"><!-- 회원ID -->
		<input TYPE="hidden" NAME="allat_product_cd" value="<?=$CONTENT_ID?>"><!-- 상품코드 -->
		<input TYPE="hidden" NAME="allat_product_nm" value="<?=$TITLE?>"><!-- 상품명 -->
		<input TYPE="hidden" NAME="allat_buyer_nm" value="<?=$NM_SITE?>"><!-- 결제자성명 -->
		<input TYPE="hidden" NAME="allat_recp_nm" value="<?=$NM_SITE?>"><!-- 수취인성명 -->
		<input TYPE="hidden" NAME="allat_recp_addr" value="<?=$ADDR?>"><!-- 수취인주소 -->
		<input TYPE="hidden" NAME="allat_enc_data" value=""><!-- 주문정보암호화필드 --><BR>
		<!-- 옵션 -->
		<input TYPE="hidden" NAME="allat_card_yn" value="N"><!-- 신용카드 결제 사용 여부 -->
		<input TYPE="hidden" NAME="allat_bank_yn" value="N"><!-- 계좌이체 결제 사용 여부 -->
		<input TYPE="hidden" NAME="allat_vbank_yn" value="N"><!-- 무통장(가상계좌) 사용 여부 -->
		<input TYPE="hidden" NAME="allat_hp_yn" value="Y"><!-- 휴대폰 결제 사용 여부 -->
		<input TYPE="hidden" NAME="allat_ticket_yn" value="N"><!-- 상품권 결제 사용 여부 -->

		<input TYPE="hidden" NAME="allat_account_key" value="Y"><!-- 무통장(가상계좌) 인증 Key -->
		<input TYPE="hidden" name="allat_tax_yn" value="Y" maxlength=1><!-- 과세여부 -->
		<input TYPE="hidden" name="allat_sell_yn" value="Y" maxlength=1><!-- 할부 사용여부 -->
		<input TYPE="hidden" name="allat_zerofee_yn" value="Y" maxlength=1><!-- 일반/무이자 할부 사용여부 -->
		<input TYPE="hidden" name="allat_cardcert_yn" value="N" maxlength=1><!-- 카드 인증 여부 -->
		<input TYPE="hidden" name="allat_bonus_yn" value="N" maxlength=1><!-- 포인트 사용 여부 -->
		<input TYPE="hidden" name="allat_cash_yn" value="" maxlength=1><!-- 현금 영수증 발급 여부 -->
		<input TYPE="hidden" name="allat_product_img" value="http://" maxlength=256><!-- 상품이미지 URL -->
		<input TYPE="hidden" name="allat_email_addr" value="" maxlength=50><!-- 결제 정보 수신 E-mail -->
		<input TYPE="hidden" name="allat_test_yn" value="N" maxlength=1><!-- 테스트 여부. 테스트 할 때는 'Y'로.. -->
		<input TYPE="hidden" name="allat_real_yn" value="N" maxlength=1><!-- 상품 실물 여부 -->
		<input TYPE="hidden" name="allat_cardes_yn" value="" maxlength=1><!-- 카드 에스크로<br>적용여부 -->
		<input TYPE="hidden" name="allat_bankes_yn" value="" maxlength=1><!-- 계좌이체 에스크로<br>적용여부 -->
		<input TYPE="hidden" name="allat_vbankes_yn" value="" maxlength=1><!-- 무통장(가상계좌) 에스<br>크로 적용여부 -->
		<input TYPE="hidden" name="allat_hpes_yn" value="" maxlength=1><!-- 휴대폰 에스크로<br>적용여부 -->
		<input TYPE="hidden" name="allat_ticketes_yn" value="" maxlength=1><!-- 상품권 에스크로<br>적용여부 -->
		<input TYPE="hidden" name="allat_registry_no" value="" maxlength=13><!-- 주민번호 -->
		<input type="hidden" name="shop_receive_url" value="/exec/view/allat_receive.php">
		<input type="hidden" name="allat_encode_type" value="U">

		<!-- =========================================== 올앳결제 end ========================================== -->
	</form>
</body>
</html>