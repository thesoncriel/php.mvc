<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

$ctrl = ControllerFactory::create("PageCache");
$ctrl->useLog(true)->run("moviePathCreate");
?>