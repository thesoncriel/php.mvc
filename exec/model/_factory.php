<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";
include_once $__model . "/CustInfoModel.php";
include_once $__model . "/PageCacheModel.php";
include_once $__model . "/ContentModel.php";
include_once $__model . "/NewkeyModel.php";

include_once $__model . "/WowCustInfoModel.php";
include_once $__model . "/WowContentModel.php";

include_once $__model . "/STBConfigModel.php";
include_once $__model . "/AdvertiseModel.php";
include_once $__model . "/AdultReqHistModel.php";
include_once $__model . "/AdultScheduleModel.php";

include_once $__model . "/PtvManagerModel.php";
include_once $__model . "/WowManagerModel.php";

class ModelFactory{
	public static function create($name, &$connProvider = null){
		switch($name){
			// PTV UI
			case "Config":
				return new MySqlModel( $connProvider );
            case "CustInfo":
                return new CustInfoModel( $connProvider );
			case "PageCache":
				return new PageCacheModel( $connProvider );
			case "Content":
				return new ContentModel( $connProvider );
			case "Newkey":
				return new NewkeyModel( $connProvider );

			// WOW UI
			case "WowCustInfo":
                return new WowCustInfoModel( $connProvider );
            case "WowContent":
            	return new WowContentModel( $connProvider );


			// ASTB
			case "STBConfig":
				return new STBConfigModel( $connProvider );
			case "Schedule":
			case "AdultSchedule":
				return new AdultScheduleModel( $connProvider );
			case "Advertise":
				return new AdvertiseModel( $connProvider );
			case "AdultReqHist":
				return new AdultReqHistModel( $connProvider );

			// Manager
			case "PtvManager":
				return new PtvManagerModel( $connProvider );
			case "WowManager":
				return new WowManagerModel( $connProvider );
			default:
				return null;
		}
	}
}