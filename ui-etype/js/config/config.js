define("config", function(){
	var win = window
	, mComic = win.__comic__
	, _fsp = ""
	, _cai = ""
	, _cei = ""
	, _newkeyContentsDomain = ""
	;

	if (mComic){
		_fsp = mComic.fsp;
		_cai = mComic.cai;
		_cei = mComic.cei;
		_newkeyContentsDomain = mComic.cd;
	}

	return {
		// 플래시 파일 경로
		flashShimPath: _fsp || "./js/",
		// 코믹뷰어 대체 이미지 경로
		comicAltImg: _cai || "./css/img/page_alt.png",
		// 코믹뷰어 빈 이미지 경로
		comicEmptyImg: _cei || "./css/img/page_empty.png",
		// 코믹뷰어 컨텐츠 도메인
		comicContentsDomain: _newkeyContentsDomain || "http://contents1.newkey.co.kr",
		// 가맹점 정보 (웹런처 전용)
		custInfo: win.__info__,
		// 만화 정보 (코믹뷰어 전용)
		comicInfo: mComic,
		// 코믹뷰어 플러그인 체크
		pluginCheck: !!win.__pluginCheck__,
		// IE8 이하에서 Ajax 크로스 도메인 문제로 인한 대체 호출 경로
		crossDomainAlt: "/exec/http_call.php",
		// allat 관련 정보
		purchaseTrigger: "/exec/view/purchase_trigger.php",
		// 결제창 하단 배너
		purchaseBottomBanner: "/Coupon/Image/ban_01.png",
		// 쿠폰창 상단 배너
		couponTopBanner: "/Coupon/Image/img_01.png"
	};
});