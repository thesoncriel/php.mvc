<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<title>STB 관리자 페이지</title>
	<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="css/ng-sortable.min.css" />
    <link rel="stylesheet" type="text/css" href="css/ng-sortable.style.min.css" />
    <link rel="stylesheet" type="text/css" href="css/stb.css" />
    <script src="lib/jquery-2.2.3.min.js"></script>
    <script src="lib/bootstrap.min.js"></script>
    <script src="lib/angular.js"></script>
    <script src="lib/angular-animate.min.js"></script>
    <script src="lib/angular-sanitize.min.js"></script>
    <script src="lib/angular-ui-router.min.js"></script>
    <script src="lib/ui-bootstrap-tpls-1.3.3.min.js"></script>
    <script src="lib/ng-sortable.min.js"></script>
    <script src="lib/ng-asyncform.js?v=1"></script>
    <script src="lib/angular-simple-dayselector.js"></script>
    <script src="js/service/common.service.js"></script>
    <script src="js/service/schedule.service.js"></script>
    <script src="js/directive/common.directive.js"></script>
    <script src="js/directive/schedule.directive.js"></script>
    <script src="js/controller/adult.schedule.controller.js"></script>
    <script src="js/controller/adv.controller.js"></script>
    <script src="js/route/adult.schedule.route.js"></script>
    <script src="js/app.js?v=1"></script>
</head>
<body ng-app="stb" ng-controller="base">
    <section class="container stb">
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <div class="navbar-header">
                    <div class="navbar-brand">STB 방송스케줄 편성 (성인용)</div>
                </div>
                <ul class="nav navbar-nav">
                    <li ui-sref-active="active"><a ui-sref="adult.schedule({channel: 1})">채널1 스케줄 관리</a></li>
                    <li ui-sref-active="active"><a ui-sref="adult.schedule({channel: 2})">채널2 스케줄 관리</a></li>
                    <li ui-sref-active="active"><a ui-sref="adv">광고 관리</a></li>
                </ul>
            </div> 
        </nav>
        <article data-ui-view="" data-autoscroll="false" ng-class="view-ani"></article>
    </section>
</body>
</html>