<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

$ctrl = ControllerFactory::create("PtvManager");
$ctrl->run("cacheDeleteCustInfo");