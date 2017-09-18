<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

$ctrl = ControllerFactory::create("CustInfo", true);
$ctrl->run("cacheTest");
?>