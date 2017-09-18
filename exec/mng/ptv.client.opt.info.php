<?php
// error_reporting(E_ALL);
// ini_set("display_errors", 1);

include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

$ctrl = ControllerFactory::create("PtvManager", $_GET["__debug"] === "1");
$ctrl->run("clientOptInfo");
?>