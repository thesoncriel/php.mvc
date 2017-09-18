<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta http-equiv="Expires" content="-1">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Cache-Control" content="No-Cache">
	<title>가맹점 관리 페이지</title>
	<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="css/ng-sortable.min.css" />
    <link rel="stylesheet" type="text/css" href="css/ng-sortable.style.min.css" />
    <link rel="stylesheet" type="text/css" href="css/mng.css" />
    <script src="lib/jquery-2.2.3.min.js"></script>
    <script src="lib/bootstrap.min.js"></script>
    <script src="lib/lodash.min.js"></script>
    <script src="lib/angular.min.js"></script>
    <script src="lib/angular-animate.min.js"></script>
    <script src="lib/angular-sanitize.min.js"></script>
    <script src="lib/angular-ui-router.min.js"></script>
    <script src="lib/ui-bootstrap-tpls-1.3.3.min.js"></script>
    <script src="lib/ng-sortable.min.js"></script>
    <script src="lib/ng-asyncform.js?v=1"></script>
    <script src="lib/angular-simple-dayselector.js"></script>
    <script src="js/service/common.service.js?v=2"></script>
    <script src="js/service/mng.service.js?v=2"></script>
    <script src="js/directive/common.directive.js"></script>
    <script src="js/controller/ptv.mng.controller.js?v=2"></script>
    <script src="js/route/mng.route.js?v=2"></script>
    <script src="js/app.js?v=2"></script>
</head>
<body ng-app="ptv" ng-controller="base">
    <!-- 공통으로 데이터를 가져올 VODS 서버의 IP 를 나열 해 주세요~ -->
    <var ng-init="IP = []"></var>
    <!-- 'PlayTV (시네호텔, 온타운)'만 가져올 서버 IP -->
    <var ng-init="PTV_ONLY = []"></var>
    <!-- '와우시네'만 가져올 서버 IP -->
    <var ng-init="WOW_ONLY = []"></var>
    <!-- 캐시를 지울 서버 IP -->
    <var ng-init="CACHE_IP = []"></var>
    <section class="container">
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#nav_mng" aria-expanded="false">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <div class="navbar-brand">VOD System Management</div>
                </div>

                <div id="nav_mng" class="collapse navbar-collapse">
                    <ul class="nav navbar-nav">
                        <li class="dropdown">
                            <a type="button" href="" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Play TV <i class="caret"></i></a>
                            <ul class="dropdown-menu">
                                <li ui-sref-active="active"><a ui-sref="ptv.custlist">가맹점 검색</a></li>
                                <li ui-sref-active="active"><a ui-sref="ptv.clientlist">클라이언트 검색</a></li>
                                <li ui-sref-active="active"><a ui-sref="ptv.clientopt">옵션 설정</a></li>
                                <li ui-sref-active="active"><a ui-sref="ptv.billlog">영화상영내역</a></li>
                                <li ui-sref-active="active"><a ui-sref="ptv.content">컨텐츠 목록</a></li>
                            </ul>
                            
                        </li>
                        <li class="dropdown">
                            <a type="button" href="" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">WOW Cine <i class="caret"></i></a>
                            <ul class="dropdown-menu">
                                <li ui-sref-active="active"><a ui-sref="wow.custlist">가맹점 검색</a></li>
                                <li ui-sref-active="active"><a ui-sref="wow.clientopt">옵션 설정</a></li>
                                <li ui-sref-active="active"><a ui-sref="wow.billlog">영화상영내역</a></li>
                                <li ui-sref-active="active"><a ui-sref="wow.content">컨텐츠 목록</a></li>
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a type="button" href="" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">공통 기능 <i class="caret"></i></a>
                            <ul class="dropdown-menu">
                                <li ui-sref-active="active"><a ui-sref="cache">캐시 관리</a></li>
                                <li><a href="log-url" target="_blank">EPG 오류 로그</a></li>
                                <li ui-sref-active="active"><a ui-sref="dbdate">서버별 DB 시간</a></li>
                            </ul>
                        </li>
                    </ul>

                    <ul class="nav navbar-nav navbar-right">
                        <li><a ui-sref="logout"><i class="glyphicon glyphicon-off"></i> Logout</a></li>
                    </ul>
                </div>
                
            </div> 
        </nav>
        <div ng-controller="WithSession">
        <article data-ui-view="" data-autoscroll="false" ng-class="view-ani"></article>    
        </div>
    </section>
</body>
</html>