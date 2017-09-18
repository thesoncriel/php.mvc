<?php
// error_reporting(E_ALL);
// ini_set("display_errors", 1);
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";
include_once $__path . "/lib/allatutil.php"; // 올앳을 쓰기위해선 포함 시킨다.

$ctrl = ControllerFactory::create("Purchase", false);
$ctrl->run("purchaseApproval");
