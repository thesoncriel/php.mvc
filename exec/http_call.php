<?php
// error_reporting(E_ALL);
// ini_set("display_errors", 1);
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

$service = new BaseService();
echo $service->remoteHttpGet($_POST["url"], null);