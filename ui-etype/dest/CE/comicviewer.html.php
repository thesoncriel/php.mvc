<?php
/**
※ 아래 변수는 /comicviewer/index.php 에서 가져옴.
$flashShimPath = IE9 이하에서 플래시 모드로 동작할 때 필요한 swf 파일이 존재하는 경로
$comicAltImg = 뷰어의 대체 이미지 경로. 만화 이미지를 못찾았을 때 보여주는 것.
$comicEmptyImg = 뷰어의 빈 이미지 경로. 페이지가 홀수여서 한 쪽 페이지를 비게 만들 때 쓰임.
$mInfo = 만화 정보
$ver = 웹 클라이언트 버전. Config::$Version 참조.

*/
?><!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<title>Newkey Comic Viewer</title>
	<link rel="stylesheet" href="/CE/css/index.min.css?v=<?=$ver?>">
	<!--[if lte IE 9]>
	<link rel="stylesheet" href="/CE/css/ie.min.css?v=<?=$ver?>">
	<![endif]-->
	<script>var __comic__=<?=json_encode($mInfo)?>;</script>
	<script src="/CE/js/libs.min.js?v=<?=$ver?>"></script>
	<script src="/CE/js/index.min.js?v=<?=$ver?>"></script>
</head>
<body>
<div id="comicviewer" class="comicviewer">
	<div class="page-header">
		<h1 class="title"><i class="icon-caret-lg"></i> <!-- ko text: title --><!-- /ko --> <small data-bind="text: author"></small>
		</h1>
	</div>
	<div class="comicviewer-container">
		<div class="viewport">
			<div id="bookImg0" data-auto-size="true" data-aside-bottom=".aside-bottom" data-aside-top=".page-header">
				<div class="flash-download">
                    <h1>FlashImageComponent</h1>
                    <p><a href="http://www.adobe.com/go/getflashplayer">Get Adobe Flash player</a></p>
                </div>
			</div><div id="bookImg1" data-auto-size="true" data-aside-bottom=".aside-bottom" data-aside-top=".page-header"></div>
			<!--[if lte IE 6]>
			<img src="/CE/css/img/page_ratio_cover.png" class="page-cover-left" data-bind="click: onPrevClick"><img src="/CE/css/img/page_ratio_cover.png" class="page-cover-right" data-bind="click: onNextClick">
			<![endif]-->
			<div id="panel_err" class="hidden">감상할 만화 정보가 존재하지 않습니다.</div>
		</div>
		<div class="viewport viewport-page-cover">
			<img src="/CE/css/img/page_ratio_cover.png" class="page-cover-left" data-bind="click: onPrevClick"><img src="/CE/css/img/page_ratio_cover.png" class="page-cover-right" data-bind="click: onNextClick">
		</div>
	</div>
	
	<div class="page-ctrl">
		<h2 class="logo-newkey">뉴키</h2>

		<form id="form_comicViewerCtrl" action="#/goto" method="post">
			<div class="input-group">
				<label for=""><i class="icon-caret-gray"></i> 다른 권 보기</label>
				<select name="books" class="form-control" data-bind="options: each_books, optionsText: bookOptText, optionsValue: 'bookno', value: bookno, event: {change: onBookSelect}"></select>
			</div>
			
			<div class="input-group">
				<label for=""><i class="icon-caret-gray"></i> 페이지 이동</label>
				<input type="text" name="page" class="input-goto-page" autocomplete="off" data-bind="value: page, disable: preventAction, event: {focus: onGotoPageFocus, click: onGotoPageFocus}"> / <span data-bind="text: max"></span>
				<a href="#" class="btn-page-goto" data-bind="click: onGotoClick">Go</a>
				<button type="submit" class="btn-hidden" data-bind="disable: preventAction">Go</button>
			</div>
			
			<div class="input-group">
				<label for=""><i class="icon-caret-gray"></i> 자동 넘기기</label>
				<select name="auto_read" class="form-control" data-bind="value: autoRead, disable: disable, event: {change: onAutoReadChange}">
					<option value="0">수동</option>
					<option value="5">5초</option>
					<option value="10">10초</option>
					<option value="15">15초</option>
					<option value="20">20초</option>
				</select>
				<label class="input-checkbox"><input type="checkbox" name="auto_book" data-bind="checked: autoBook, disable: disable"> 권 자동</label>
			</div>
			
			<div class="input-group">
				<label for=""><i class="icon-caret-gray"></i> 보기 모드</label>
				<select name="view_mode" class="form-control" data-bind="value: viewMode, disable: preventAction, event: {change: onViewModeChange}">
					<option value="2">두장씩 보기</option>
					<option value="1">한장씩 보기</option>
				</select>
			</div>

			<div class="input-group">
				<label for=""><i class="icon-caret-gray"></i> 넘기기 방향</label>
				<select name="read_dir" class="form-control" data-bind="value: readDir, disable: disable, event: {change: onReadDirChange}">
					<option value="0">왼쪽▶오른쪽</option>
					<option value="1">왼쪽◀오른쪽</option>
				</select>
				<strong class="attention" data-bind="visible: readDir() == 1">다음: 왼쪽 클릭</strong>
			</div>
		</form>
		

		<div class="btn-group">
			<a href="#" class="btn-book-prev" data-bind="click: onPrevClick">이전</a><a href="#" class="btn-book-next" data-bind="click: onNextClick">다음</a>
			<div class="clear-fix"></div>
			<strong class="attention" data-bind="visible: autoRead() > 0">이전/다음 수동 기능 사용 불가</strong>
		</div>
	</div>
	<div class="loading">
		<div class="img"></div>
	</div>
	<div class="aside-bottom w728"><!-- 원래사이즈:970x90 -->
		<iframe src="http://b2b.newkey.co.kr/adLink/ad_728x90_Under.php" frameborder="0" scrolling="no" allowTransparency="true"></iframe>
		<!-- <iframe src="../CE/viewer_ad.html" frameborder="0"></iframe> -->
	</div>
</div>
</body>
</html>