<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

$ver = Config::$Version;
?><!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<title>플러그인 확인</title>
	<link rel="stylesheet" href="/CE/css/index.min.css?v=<?=$ver?>">
	<script>var __pluginCheck__=true;</script>
	<script src="/CE/js/libs.min.js?v=<?=$ver?>"></script>
	<script src="/CE/js/index.min.js?v=<?=$ver?>"></script>
</head>
<body class="plugin-check">
	<div id="panel_pluginCheck">
		<h1>구동 환경 및 플러그인 설치 확인</h1>
		<ul>
			<li>인터넷 익스플로러.. <b data-bind="css: {'done': ie, 'fail': !ie()}, text: (ie())? ieVer() : 'fail'"></b></li>
			<li>HTML5 지원.. <b data-bind="css: {'done': html5, 'fail': !html5()}, text: (html5())? 'ok' : 'fail'"></b></li>
			<li>Flash Plugin.. <b data-bind="css: {'done': flash, 'fail': !flash()}, text: (flashVer() > 0)? flashVer() : 'fail'"></b></li>
			<li>Webcube ActiveX.. <b data-bind="css: {'done': webcubeOld}, text: (webcubeOld())? 'ok' : 'missing'"></b></li>
		</ul>

		<div class="not-ie hidden">
			<h2>현재 웹브라우저는 인터넷 익스플로러가 아닙니다.</h2>
			<p class="notice">
				뉴키 코믹 뷰어는 <strong>인터넷 익스플로러</strong>만 지원 합니다.<br/>
				윈도10일 경우 웹브라우저앱 및 .html 과 .htm 파일에 대한 기본앱 설정을<br/>
				인터넷 익스플로러(Internet Explorer)로 설정하고 다시 시작하여 주십시오.
			</p>
		</div>
		
		<div class="low-ver-flash hidden">
			<h2>플래시가 설치되어 있지 않거나 버전이 너무 낮습니다.</h2>
			<p class="notice">
				권장 플래시 버전은 20 이상 입니다.<br/>
				<a href="http://www.adobe.com/go/getflashplayer">플래시 플레이어 다운로드 바로가기</a>
			</p>
		</div>

		<div class="not-webcube hidden">
			<h2>웹큐브 보안 프로그램이 설치되지 않았습니다.</h2>
			<p class="notice">
				WindowsXP 및 IE8 이하는 아래의 보안 프로그램을 별도로 설치한 뒤<br/>
				<strong>F5</strong>를 눌러 주시길 바랍니다.<br/>
				<a href="./webcube4176/WebCubeSetup.exe">보안 프로그램 다운로드</a>
			</p>
		</div>
	</div>
	<div class="loading hidden"><div class="img"></div><br/>만화 뷰어를 불러오는 중입니다...</div>
</body>
</html>