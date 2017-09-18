<?php
// 프로젝트 경로. 폴더를 옮기거나 그러면 이 걸 바꿔준다.
$__root = "/exec";

$__path = $_SERVER["DOCUMENT_ROOT"] . $__root;
$__model = $__path . "/model";
$__service = $__path . "/service";
$__controller = $__path . "/controller";
$__view = $__path . "/view";

$GLOBALS["__mvcRoot"] = $__root;
$GLOBALS["__dev"] = false; // 개발서버일 경우 true로 준다.

include_once $__path . "/_inc/config.php";
include_once $__path . "/_inc/common.php";
include_once $__path . "/_inc/model.php";
include_once $__path . "/_inc/service.php";
include_once $__path . "/_inc/controller.php";
include_once $__model . "/_factory.php";
include_once $__service . "/_factory.php";
include_once $__controller . "/_factory.php";