<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

$ctrl = ControllerFactory::create("CustInfo");
$ctrl->run("cacheDelete", false);