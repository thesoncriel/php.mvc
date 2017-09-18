<?php
// error_reporting(E_ALL);
// ini_set("display_errors", 1);
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";
include_once $__controller . "/PageCacheController.php";
include_once $__controller . "/CustInfoController.php";
include_once $__controller . "/ContentController.php";
include_once $__controller . "/PurchaseController.php";
include_once $__controller . "/AdultVerifyController.php";
include_once $__controller . "/NewkeyController.php";

include_once $__controller . "/AdultScheduleController.php";
include_once $__controller . "/AdultContentController.php";
include_once $__controller . "/AdvertiseController.php";

include_once $__controller . "/PtvManagerController.php";
include_once $__controller . "/WowManagerController.php";

class ControllerFactory{
	public static function create($name, $useLog = false){
		Logger::useLog($useLog); 

		switch($name){
			// PTV UI
			case "Base":
				return new BaseController();
			case "PageCache":
				return new PageCacheController();
			case "CustInfo":
				return new CustInfoController();
			case "Content":
				return new ContentController();
			case "Purchase":
				return new PurchaseController();
			case "AdultVerify":
				return new AdultVerifyController();
			case "Newkey":
			case "Comic":
				return new NewkeyController();

			// ASTB
			case "Schedule":
			case "AdultSchedule":
				return new AdultScheduleController();
			case "AdultContent":
				return new AdultContentController();
			case "Advertise":
				return new AdvertiseController();

			// Manager
			case "PtvManager":
				return new PtvManagerController();
			case "WowManager":
				return new WowManagerController();
			case "":
				return null;
			default:
				//include $__controller . "/" . $name . "Controller.php";
				return null;
		}
		//return new $name();
	}
}