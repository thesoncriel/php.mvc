<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class CustInfoModel extends MySqlModel{
	public function __construct(&$model = null){
		parent::__construct($model);
        
        // 옵션 사용할 때 KEY를 다들 대문자만 써서 아예 기본 대문자로 출력하게 함.
        $this->keyCase = false;
	}

	public function __destruct(){
		parent::__destruct();
	}
    
    public function selectCustInfoList($page = 1, $count = 100){
        $query = "
        ";
        
        return $this->toUTF8Fields( $this->selectPaging( $query, $page, $count ), "NM_SITE" );
    }

    public function selectCustInfoListCount(){
        $query = "
        ";
        
        return $this->selectCount( $query );
    }
    
    public function selectOneCustInfoById($idCust){
        $query = "
        ";

        return $this->toUTF8Fields( $this->selectOne( $query ), "NM_SITE" );
    }

    // 시네호텔은 IP로 가맹점 검색이 불가 하다.
    public function getIdCustByIP($ip){
        return null;
    }

    
    public function selectCustClientInfoById($idCust){
        $query = "
        ";
        
        return $this->toUTF8Fields( $this->select( $query ), "ROOM_NO" );
    }

    

    public function insertCustInfoCreateHistory($idCust, $type){
        $query = "
        ";

        return $this->execute( $query );
    }
}
?>