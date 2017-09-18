<?php
	$result_cd  = $_POST["allat_result_cd"];
	$result_msg = $_POST["allat_result_msg"];
	$enc_data   = $_POST["allat_enc_data"];

	$result_msg = iconv("EUC-KR", "UTF-8", $result_msg);
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Allat Receive</title>
<script>
	var __allatResult = [
		"<?=$result_cd?>",
		"<?=$result_msg?>",
		"<?=$enc_data?>"
	];
		
	if (window.opener != undefined){
		if (opener.result_submit){
			try{
				opener.result_submit.apply(opener, __allatResult);
			}
			catch(e){
				alert("잘못된 호출 입니다.(0)");
			}
			
		}
		else{
			alert("잘못된 호출 입니다.(1)");
		}
		
		window.close();
	}
	else{
		alert("잘못된 호출 입니다.(2)");
	}
</script>
</head>
<body>
	
</body>
</html>