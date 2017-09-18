<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class JwayService extends BaseService{
    protected $useWow = false;

	public function __construct(&$config = null){
		parent::__construct($config);

        $this->useWow = true/*조건*/;
	}

    // PlayTV 사용여부 확인.
    // PTV가 아니면 방번호(Room Number) 를 사용하지 않는다.
    public function isPlayTv(){
        return !$this->useWow;
    }
    public function isWowCine(){
        return $this->useWow;
    }

    public function getServiceType(){
        if ($this->useWow){
            return "wow";
        }

        return "ptv";
    }

    public function getServiceName(){
        if ($this->useWow){
            return "와우시네";
        }

        return "시네호텔";
    }
}