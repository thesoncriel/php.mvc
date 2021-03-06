<?php
/*
variables from 'main_page.php'

$mInfo 			| 가맹점 정보 모음(Map)
$name 			| 가맹점명
$id_cust		| 가맹점ID
$prd = 0~7 		| 메뉴 활성화 여부 - 비트별 차이: 4-영화, 2-TV, 1-만화
$adt = 0 or 1	| 성인 카테고리 출력 여부
$prm = 0 or 1	| 프리미엄 메뉴 사용 여부
$adv = 0 or 1	| 성인 인증 기능 사용 여부
$srv 			| 서비스 형태. wow, ptv
$snm 			| 서비스 명칭. 와우시네, 시네호텔
$clt 			| 클라이언트 형태. etype, dtype
$sip 			| 서버IP (뒷자리만)
$cip 			| 클라이언트IP
$ver 			| 웹 클라이언트 버전. Config::$Version 참조.
$newkeywowtv	| 와우TV 뉴키 목록 URL. 와우 TV일 경우 값일 들어 옴.
$debugInfo 		| 디버깅 정보

*/

?><html lang="ko">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Expires" content="-1">
	<meta http-equiv="Pragma" content="no-cache">
	<meta http-equiv="Cache-Control" content="No-Cache">
	<title><?=$snm?> 런처</title>
	<link rel="stylesheet" href="css/index.min.css?v=<?=$ver?>">
	<!--[if lte IE 7]>
	<link rel="stylesheet" href="css/ie.min.css?v=<?=$ver?>">
	<![endif]-->
	<script>var __info__=<?=json_encode($mInfo)?>;</script>
	<script src="js/libs.min.js?v=<?=$ver?>"></script>
	<script src="js/index.min.js?v=<?=$ver?>"></script>
</head>
<body class="<?=$clt?> <?=$srv?> <?=$clt.$srv?>">
<div class="container">
	<div id="weblauncher_header" class="header">
		<h1 class="logo-main"><?=$snm?>
		</h1><ul class="menu">
			<?if ($prd & 4):?><li class="menu-item">
			<a class="icon-best" href="#/movie/1/0" data-bind="css: {'icon-best-active': category() == 1}">추천영화</a>
			</li><li class="menu-item">
			<a class="icon-korean" href="#/movie/2/0" data-bind="css: {'icon-korean-active': category() == 2}">한국영화</a>
			</li><li class="menu-item">
			<a class="icon-foregin" href="#/movie/3/0" data-bind="css: {'icon-foregin-active': category() == 3}">외국영화</a>
			</li><?if ($adt):?><li class="menu-item">
			<a class="icon-adult" href="#/movie/4/1" data-bind="css: {'icon-adult-active': category() == 4}">성인영화</a>
			</li><?endif; if ($prm):?><li class="menu-item">
			<a class="icon-premium" href="#/movie/6/<?=$adt?>" data-bind="css: {'icon-premium-active': category() == 6}">프리미엄</a>
			</li><?endif; endif; if ($prd & 2):?><li class="menu-item">
			<a class="icon-tv" href="#/tv" data-bind="css: {'icon-tv-active': tv}, click: onTv">TV다시보기</a>
			</li><?endif; if ($prd & 1):?><li class="menu-item">
			<a class="icon-comics" href="#/newkey/comic/0" data-bind="css: {'icon-comics-active': comics}">만화</a></li><?endif;?>
		</ul>
		<div class="close-section clear-fix">
			<a href="#" class="btn-close" data-bind="click: onClose">닫기</a><br/>
			<strong class="cust-name"><?=$name?></strong>
		</div>
	</div>

	<div class="section-comic hidden">
		<div id="comic_menu" class="sub-header">
			<div class="sub-header-inner">
				<ul class="sub-category-first">
					<li class="sub-item"><a href="#/newkey/comic/0" data-bind="css: {active: type() == 'comic'}">만화</a></li>
					<li class="sub-item"><a href="#/newkey/novel/0" data-bind="css: {active: type() == 'novel'}">소설</a></li>
				</ul>
				<ul class="sub-category" data-bind="if: type() == 'comic'">
					<li class="sub-item-first"><a href="#/newkey/comic/0" data-bind="css: {active: genre() == 0}">전체보기</a></li>
					<li class="sub-item"><a href="#/newkey/comic/1" data-bind="css: {active: genre() == 1}">순정</a></li>
					<li class="sub-item"><a href="#/newkey/comic/2" data-bind="css: {active: genre() == 2}">무협</a></li>
					<li class="sub-item"><a href="#/newkey/comic/5" data-bind="css: {active: genre() == 5}">드라마</a></li>
					<li class="sub-item"><a href="#/newkey/comic/8" data-bind="css: {active: genre() == 8}">액션</a></li>
					<li class="sub-item"><a href="#/newkey/comic/3" data-bind="css: {active: genre() == 3}">코믹</a></li>
					<li class="sub-item"><a href="#/newkey/comic/99" data-bind="css: {active: genre() == 99}">성인</a></li>
				</ul>
				<ul class="sub-category" data-bind="if: type() == 'novel'">
					<li class="sub-item-first"><a href="#/newkey/novel/0" data-bind="css: {active: genre() == 0}">전체보기</a></li>
					<li class="sub-item"><a href="#/newkey/novel/36" data-bind="css: {active: genre() == 36}">로맨스</a></li>
					<li class="sub-item"><a href="#/newkey/novel/47" data-bind="css: {active: genre() == 47}">SF/판타지</a></li>
					<li class="sub-item"><a href="#/newkey/novel/38" data-bind="css: {active: genre() == 38}">무협</a></li>
				</ul>
			</div>
			<form action="#/newkey/search" method="post" class="search-panel">
				<select name="type" class="hidden" data-bind="value: type">
					<option value="comic">만화</option>
					<option value="novel">소설</option>
				</select>
				<input type="text" name="genre" class="hidden" data-bind="value: genre">
				<input type="text" name="search" data-bind="value: search">
				<i class="icon-33-search btn-search" data-bind="click: onSearchClick"></i>
				<button type="submit" class="btn-hidden">검색</button>
			</form>
			<div class="clear-fix"></div>
		</div>
		<div class="detail detail-comic">
			<div id="comic_detail" class="detail-inner scrollable">
				<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>
				<div class="viewport">
					<div class="overview" data-bind="with: detail">
						<h2 class="detail-title" data-bind="text: title"></h2>
						<div id="detail-figure" class="detail-figure">
							<div class="no-poster">
								<img alt="" class="poster" data-bind="attr: {src: 'http://www.newkey.co.kr/' + thumb_path}">
							</div>
							<i class="pos-rt icon-63-19" data-bind="visible: grade > 0"></i>
							<em class="pos-rm-63 mark-new" data-bind="visible: $parent.isNew(regdate)">NEW</em>
						</div>
						<dl class="detail-desc">
							<dt>• 그림작가</dt>
							<dd>: <span data-bind="text: am_name"></span></dd>
							<dt>• 글작가</dt>
							<dd>: <span data-bind="text: as_name"></span></dd>
							<dt>• 장르</dt>
							<dd>: <span data-bind="text: genre_name"></span></dd>
							<dt>• 이용등급</dt>
							<dd>: 
								<span data-bind="if: grade == 0">전체이용가</span>
								<span data-bind="if: grade > 0">성인(19+)</span>
							</dd>
							<dt>• 출판사</dt>
							<dd>: <span data-bind="text: pub_name"></span></dd>
							<dt>• 제공사</dt>
							<dd>: <span data-bind="text: cp_name"></span></dd>
							<dt>• 업데이트</dt>
							<dd>: <span data-bind="text: regdate"></span></dd>
							<dt>• 발행정보</dt>
							<dd>: 
								<span data-bind="if: books > 0"><!-- ko text: books + '권' --><!-- /ko --></span>
								<b data-bind="if: books & series"> / </b>
								<span data-bind="if: series > 0"><!-- ko text: series + '회' --><!-- /ko --></span>
							</dd>
							<dt>• 키워드</dt>
							<dd>: <span data-bind="text: keyword"></span></dd>
							<dd class="each-books">
								<!-- ko foreach: each_books -->
								<a href="#" class="btn-sm-book" data-bind="click: $parents[1].play, css: {'btn-sm-many': bookno > 99}"><i class="icon-caret"></i><!-- ko if: state == 1 --><!-- ko text: bookno + '권' --><!-- /ko --><!-- /ko --><!-- ko if: state == 2 --><!-- ko text: bookno + '회' --><!-- /ko --><!-- /ko --></a>
								<!-- /ko -->
								<!-- ko if: finish == 1 || finish -->
								<i class="btn-sm-finish">완결</i>
								<!-- /ko -->
							</dd>
							<dt>• 작품 줄거리</dt>
							<dd class="synopsis" data-bind="text: summary"></dd>
						</dl>
						<iframe src="css/img/no_poster.jpg" frameborder="0" class="outer-trigger comicviewer-trigger"></iframe>
					</div>
					<div class="loading loading-covered">
						<div class="img"></div>
					</div>
				</div>
			</div>
		</div><div class="list">
			<div id="comic_list" class="list-inner scrollable" data-listUrl="<?=$newkeywowtv?>">
				<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>
				<div class="viewport">
					<div class="overview">
						<!-- ko foreach: list -->
						<div class="list-item" data-bind="css: {active: active, hover: hover}, event: {mouseover: $parent.onItemOver, mouseout: $parent.onItemOut, click: $parent.onItemClick}">
							<div class="no-poster">
								<img alt="" class="poster" data-bind="attr: {src: 'http://www.newkey.co.kr/' + thumb_path}">
							</div>
							<i class="pos-rt icon-55-19" data-bind="visible: grade > 0"></i>
							<em class="pos-rm-55 mark-new" data-bind="visible: $parent.isNew(regdate)">NEW</em>
							<strong class="hover-info">
								<span data-bind="text: $parent.cut(title)"></span>/<span data-bind="text: am_name"></span>
							</strong>
						</div>
						<!-- /ko -->
						<!-- ko if: (loaded() && list().length == 0) -->
						<div class="text-center">
							<strong>목록이 없습니다.</strong>
						</div>
						<!-- /ko -->
					</div>
					<div class="loading">
						<div class="img"></div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="section-movie hidden">
		<div class="detail">
			<div id="movie_detail" class="detail-inner" data-bind="with: detail">
				<h2 class="detail-title" data-bind="text: title"></h2>
				<div id="detail-figure" class="detail-figure">
					<div class="no-poster">
						<img alt="" class="poster" data-bind="attr: {src: poster_path}">
					</div>
					<i data-bind="attr: {'class': 'pos-rt icon-63-' + grade}"></i>
					<i class="icon-63-troffy pos-rm-63" data-bind="visible: premium == 1"></i>
					<a href="#" class="btn-63-play pos-rb" data-bind="click: $parent.play">재생</a>
				</div>
				<dl class="detail-desc">
					<dt>• 감독</dt>
					<dd>: <span data-bind="text: director"></span></dd>
					<dt>• 출연</dt>
					<dd>: <span data-bind="text: starring"></span></dd>
					<dt>• 장르</dt>
					<dd>: <span data-bind="text: genre"></span></dd>
					<dt>• 가격</dt>
					<dd>: 
						<span data-bind="if: amt_price == 0">무료</span>
						<span data-bind="if: amt_price > 0">
							<!-- ko text: amt_price --><!-- /ko -->원
						</span>
					</dd>
					<dt>• 상영시간</dt>
					<dd>: <span data-bind="text: $parent.timeFmt(running_time)"></span></dd>
					<dt>• 상영등급</dt>
					<dd>: 
						<span data-bind="if: grade == 0">전체</span>
						<span data-bind="if: grade > 0">
							<!-- ko text: grade --><!-- /ko -->세 이상
						</span>
					</dd>
					<dt>• 시놉시스</dt>
					<dd class="synopsis" data-bind="text: $parent.textOverflow(story)"></dd>
				</dl>
			</div>
		</div><div class="list">
			<div id="movie_list" class="list-inner scrollable">
				<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>
				<div class="viewport">
					<div class="overview">
						<!-- ko foreach: list -->
						<div class="list-item" data-bind="css: {active: active, hover: hover}, event: {mouseover: $parent.onItemOver, mouseout: $parent.onItemOut, click: $parent.onItemClick}">
							<div class="no-poster">
								<img alt="" class="poster" data-bind="attr: {src: poster_path}">
							</div>
							<i data-bind="attr: {'class': 'pos-rt icon-55-' + grade}"></i>
							<i class="icon-55-troffy pos-rm-55" data-bind="visible: premium == 1"></i>
							<a href="#" class="btn-55-play pos-rb" data-bind="click: $parent.play">재생</a>
						</div>
						<!-- /ko -->
						<!-- ko if: (loaded() && list().length == 0) -->
						<div class="text-center">
							<strong>목록이 없습니다.</strong>
						</div>
						<!-- /ko -->
					</div>
					<div class="loading">
						<div class="img"></div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="section-tv hidden">
		<img src="img/tv_bg.<?=$srv?>.jpg" width="100%" alt="">
	</div>

	<div class="ad-bottom">
		<iframe src="/CE/adBanner.php" class="ad-frame" scrolling="no" frameborder="0" allowTransparency="true">
		</iframe>
	</div>

	<div id="modal_adultVerify" class="modal adult-verify">
		<h2 class="modal-header header-adult-verify">성인인증</h2>
		<div class="modal-body">
			<form id="form_adultVerify" action="#/adultVerify" method="post">
				<ul class="form-horizontal">
					<li class="form-group-row">
						<label for="">• 이름 :</label>
						<div class="input-col">
							<input type="text" name="name" autocomplete="off">
						</div>
					</li>
					<li class="form-group-row">
						<label for="">• 생년월일 :</label>
						<div class="input-col">
							<input type="text" name="birth" autocomplete="off" placeholder="예: 19800101">
						</div>
					</li>
					<li class="form-group-row">
						<label for="">• 핸드폰 번호 :</label>
						<div class="input-col">
							<input type="text" name="telnum" autocomplete="off" placeholder="예: 01012345678">
						</div>
					</li>
				</ul>
				<em class="advice">핸드폰 번호 입력시 하이픈(-)은 입력하지 않으셔도 됩니다.</em>
				<blockquote class="caution">
					본 서비스는 청소년 유해 매체물이 포함되므로, 정보통신망이용 촉진 및 정보보호 등에 관란 법률 및 청소년 보호법 규정에 의하여 성인인증을 받으셔야만 됩니다.
				</blockquote>
				<div class="button-group text-center">
					<span class="btn"><button type="submit" class="btn btn-verify-apply" data-result="apply">확인</button></span>
					<span class="btn"><button type="button" class="btn btn-verify-cancel" data-result="cancel" data-role="close">취소</button></span>
				</div>
			</form>
			<div class="loading loading-covered">
				<div class="img"></div>
			</div>
		</div>
	</div>

	<div id="modal_purchase" class="modal modal-purchase" data-bind="with: detail">
		<h2 class="hidden">결제 방법 선택</h2>
		<div class="modal-header" data-bind="text: $parent.textOverflow(title, 10)"></div>
		<div class="modal-body">
			<div class="no-poster pull-left">
				<img alt="" class="poster" data-bind="attr: {src: poster_path}">
			</div>
			<dl class="desc pull-left">
				<dt>감독 : </dt>
				<dd data-bind="text: $parent.textOverflow(director, 8)"></dd>
				<dt>출연 : </dt>
				<dd data-bind="text: $parent.textOverflow(starring, 8)"></dd>
				<dt>장르 : </dt>
				<dd data-bind="text: genre"></dd>
				<dt>등급 : </dt>
				<dd>
					<span data-bind="if: grade == 0">전체</span>
					<span data-bind="if: grade > 0">
						<!-- ko text: grade --><!-- /ko -->세 이상
					</span>
				</dd>
				<dt>상영시간 : </dt>
				<dd><span data-bind="text: $parent.timeFmt(running_time)"></span></dd>
				<dt>가격 : </dt>
				<dd><!-- ko text: amt_price --><!-- /ko -->원</dd>
			</dl>
			<p class="notice text-center clear-fix">
				선택하신 영화는 프리미엄 상품이므로 유료결제가 필요합니다.
			</p>
			<strong class="notice-lesser text-center">
				유료 결제는 휴대폰 결제만 가능합니다.
			</strong>

			<form action="">
				<a href="#" class="btn-purchase-cancel" data-result="cancel" data-role="close" data-bind="click: $parent.cancel">취소</a>
				<a href="#" target="frame_purchase" class="btn-purchase-progress" data-bind="attr: {'href': $parent.purchaseUrl()}">결제진행</a>
				<a href="#" class="btn-purchase-coupon" data-bind="click: $parent.coupon">쿠폰사용</a>
			</form>
		</div>
		<div class="modal-footer">
			<a href="#" data-bind="click: $parent.coupon">
			<img src="css/img/no_poster.jpg" alt="씨네호텔 상품권으로 프리미엄 최신 영화를 즐기자!" width="308" height="100" data-bind="attr: {'src': $parent.bannerUrl()}">
			</a>
		</div>
	</div>

	<div id="modal_coupon" class="modal modal-coupon">
		<h2 class="hidden">쿠폰 결제</h2>
		<div class="modal-body">
			<img src="css/img/no_poster.jpg" alt="여기야 별난 회원 혜택" width="346" data-bind="attr: {'src': bannerUrl()}">
			
			<p class="hidden">
				프론트에서 씨네호텔 자유이용권을 챙기세요!
			</p>
			<strong class="hidden">
				쿠폰번호 16자리를 입력해 주세요
			</strong>
			<form action="#/couponUse" method="post">
				<div data-bind="with: detail">
					<input type="hidden" name="contentId" data-bind="value: content_id">
				</div>
				<div class="text-center">
					<input type="text" name="coupon0" class="input-number" autocomplete="off" maxlength="4" data-bind="value: num0, event: {'keyup': onChange}">
					<span class="dash">-</span>
					<input type="text" name="coupon1" class="input-number" autocomplete="off" maxlength="4" data-bind="value: num1, event: {'keyup': onChange}">
					<span class="dash">-</span>
					<input type="text" name="coupon2" class="input-number" autocomplete="off" maxlength="4" data-bind="value: num2, event: {'keyup': onChange}">
					<span class="dash">-</span>
					<input type="text" name="coupon3" class="input-number" autocomplete="off" maxlength="4" data-bind="value: num3, event: {'keyup': onChange}">
				</div>
				<div class="text-center btn-group">
					<a href="#" class="btn-coupon-back" data-bind="click: cancel">뒤로</a>
					<a href="#" class="btn-coupon-use" data-bind="click: submit">사용하기</a>
				</div>
				<button type="submit" class="btn-hidden">보내기</button>
			</form>
			<div class="loading loading-covered">
				<div class="img"></div>
			</div>
		</div>
	</div>

	<iframe src="css/img/no_poster.jpg" name="frame_purchase" frameborder="0" class="outer-trigger"></iframe>

	<div id="panel_err" class="hidden">
		<h2>가맹점 정보를 가져오는데 실패 했습니다.</h2>
		<h3>다음의 내용이 원인이 될 수 있습니다.</h3>
		<ul>
			<li>- 가맹점 정보가 등록 되지 않음</li>
			<li>- 클라이언트 IP가 등록 되지 않음</li>
			<li>- 서버 캐시가 잘못됨</li>
		</ul>
		<h3>관련 정보 : <?=$debugInfo?></h3>
	</div>
	
	<?/*<style>
		#panel_debug{
			display: none;
			position: absolute;
			width: 200px;
			height: 200px;
			right: 0;
			bottom: 0;
			background: #fff;
			filter: alpha(opacity=75);
		}
	</style>
	<div id="panel_debug">
		<textarea name="" id="txtDebug" cols="30" rows="10" style="width: 100%;"></textarea>
	</div>*/?>
</div>
</body>
</html>