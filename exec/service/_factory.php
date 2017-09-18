<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";
include_once $__service . "/JwayService.php";
include_once $__service . "/CacheWorker.php";
include_once $__service . "/PageCacheService.php";
include_once $__service . "/CustInfoCacheService.php";
include_once $__service . "/CustOptionParser.php";
include_once $__service . "/ContentService.php";
include_once $__service . "/NewkeyService.php";
include_once $__service . "/PurchaseService.php";

include_once $__service . "/AdultScheduleService.php";

include_once $__service . "/PtvManagerService.php";

class ServiceFactory{
	public static function create($name, &$config = null){
		switch($name){
			// PTV UI
			case "Base":
				return new BaseService($config);
		    case "CacheWorker":
                return new CacheWorker($config);
			case "PageCache":
				return new PageCacheService($config);
			case "CustInfo":
            case "CustInfoCache":
                return new CustInfoCacheService($config);
            case "CustOptionParser":
            	return new CustOptionParser($config);
            case "Content":
            	return new ContentService($config);
            case "Newkey":
            	return new NewkeyService($config);
            case "Purchase":
            	return new PurchaseService($config);

            // ASTB
            case "Schedule":
			case "AdultSchedule":
				return new AdultScheduleService($config);

			// Manager
			case "PtvManager":
				return new PtvManagerService($config);
			default:
				return null;
		}
	}
}