<?php

session_start();

$_SESSION["cv_serial"] = $_GET["serial"];
$_SESSION["cv_type"] = $_GET["type"];
$_SESSION["cv_bookno"] = $_GET["bookno"];
$_SESSION["cv_idcust"] = $_GET["idcust"];

header("Location: /comicviewer/plugin_check.php");
?>