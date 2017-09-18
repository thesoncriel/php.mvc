<?php
//error_reporting(E_ALL);
//ini_set("display_errors", 1);
include_once $_SERVER["DOCUMENT_ROOT"] . "/ASTB/_controller/_factory.php";

$ctrl = ControllerFactory::create("AdultSchedule");
$ctrl->ch()->run("stb");
/*
[{"pos":1800,"URL":"http:\/\/211.43.189.155:8070\/movies\/O8257NOR_PS.mpg","After_AD":"http:\/\/211.43.189.155:8070\/ASTB\/AD\/170.png","AD_Type":"html","After_AD_delay":40}]
*/
/*
{"movie":{"pos":1019,"url":"http:\/\/211.43.189.155:8070\/movies\/O7468KER_PS.mpg","next_time":"2016-07-22 17:42:00"},"ad":[{"url":"http:\/\/cfile28.uf.tistory.com\/image\/250B9F3552C621F81264CE","type":"vod","duration":10},{"url":"http:\/\/www.dog-zzang.co.kr\/dog_sale\/photo\/201602\/1456462489_18673100.jpg","type":"html","duration":10},{"url":"http:\/\/www.gangaji.co.kr\/data\/file\/luxury_01\/1028182018_ashMWAZT_7.jpg","type":"html","duration":10},{"url":"https:\/\/i.ytimg.com\/vi\/N65InGvVIvo\/maxresdefault.jpg","type":"html","duration":10},{"url":"http:\/\/211.43.189.155:8070\/ASTB\/AD\/adv_pome.mp4","type":"vod","duration":10},{"url":"http:\/\/211.43.189.155:8070\/ASTB\/AD\/170.png","type":"html","duration":10},{"url":"http:\/\/my-puppy.net\/assets\/contents\/posts\/p_201607_11_195400_195400.JPG","type":"html","duration":10}]}

*/