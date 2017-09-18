<?php
$mParam = array();
$mParam["c_id"] = $_GET["c_id"];
$mParam["cat"] = $_GET["cat"];
$mParam["b_id"] = $_GET["b_id"];

$sParam = json_encode($mParam);

?><!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<title></title>
</head>
<body>
	<button id="btn_trigger"></button>
<script>
var params = <?=$sParam?>
,	url = /*activeX 뷰어 수행 url*/"?pid=" + params.c_id + "&cat=" + params.cat + "&flip=Y&sound=Y&pre=Y&mode=2&se=" + params.b_id + "&page=2&cboAutoFlip=0&isSample=" + params.cat
;
window.open(url, "newkey_mypopup","width=1024,height=768,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,left=0,top=0");
</script>
</body>
</html>