<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class BaseController extends Util{
    private $ran = false;
    protected $preventAutoPrint = false;
    protected $model = null;
    protected $config = null;
    protected $service = null;
    protected $param;
    protected $json;

    public function __construct($configModelName = "Config"){
        if (Config::$debugModelConstDest){
            $this->log("controller construct", true);
        }
        //$this->log("controller construct" . " === #" . date("Y-m-d H:i:s"));
        $this->config = ModelFactory::create( $configModelName );
        $json = array();
        $result = array();

        $result["err"] = array();
        $result["valid"] = true;
        $result["auth"] = true;
        $result["state"] = true;
        $result["debug"] = null;
        $result["redirect"] = "";
        $result["msg"] = "";

        $json["data"] = null;
        $json["count"] = 0;
        $json["info"] = null;
        $json["etc"] = null;
        $json["dtServer"] = $this->getNow();
        $json["result"] = $result;

        $this->json = $json;
    }

    public function __destruct(){
        unset( $this->service );
        unset( $this->model );
        unset( $this->config );
        unset( $this->json );

        if (Config::$debugModelConstDest){
            $this->log("controller destructed", true);
        }
    }
    
    public function applyModel($modelName){
        $isFirst = isset($this->model) == false;

        $this->model = ModelFactory::create( $modelName, $this->config );

        if ($isFirst){
            $this->parameterEscape();
        }
        
        if (isset($this->model)){
            $this->model->useLog( $this->isUseLog() );
        }

        return $this;
    }
    
    public function setModel(&$model){
    	$isFirst = isset($this->model) == false;

    	if ($model instanceof BaseModel){
    		$this->model = $model;
    	}
        
        if (isset($this->model)){
            $this->model->useLog( $this->isUseLog() );
        }

        if ($isFirst){
        	$this->parameterEscape();
        }

        return $this;
    }

    public function applyService($serviceName){
        $this->service = ServiceFactory::create( $serviceName, $this->config );
        
        if (isset($this->service)){
            $this->service->useLog( $this->isUseLog() );
        }

        return $this;
    }

    public function setService(&$service){
    	$this->service = $service;
        
        if (isset($this->service)){
            $this->service->useLog( $this->isUseLog() );
        }

    	return $this;
    }

    public function getNowDate(){
        return date_format( date_create(), "Y-m-d");
    }

    public function getNow(){
        return date_format( date_create(), "Y-m-d H:i:s" );
    }

    protected function parameterEscape(){
        $iGetCnt = count($_GET);
        $iPostCnt = count($_POST);
        $mLegacy = null;
        $mParam = null;
        $conn = null;

        if ($iGetCnt > 0){
            $mLegacy = $_GET;
        }
        else if ($iPostCnt > 0){
            $mLegacy = $_POST;
        }
        else{
            $mLegacy = array();
        }

        if ($this->model != null){
            $conn = $this->model->getConnection();
            $mParam = array();
            foreach($mLegacy as $key => $val){
                $mParam[ $key ] = mysqli_real_escape_string( $conn, $val );
            }
        }
        else{
            $mParam = $mLegacy;
        }

        if (isset($mParam)){
            $this->param = $mParam;
        }
        else{
            $this->param = array();
        }

        $conn = null;
    }

    protected function parseParam($key, $def = ""){
        if (isset($this->param[ $key ])){
            return $this->parseValue( $this->param[ $key ], $def );
        }
        else{
            return $def;
        }
    }

    protected function parseParams(){
        $mParam = array();
        $args = func_get_args();

        foreach($args as $index => $key){
            $mParam[ $key ] = $this->parseParam( $key, "" );
        }

        return $mParam;
    }

    public function attachmentByPath($path, $fileName = "untitled.txt", $contentType = "text/plain"){
        $iFileSize = filesize( $path );
        $sFileName = "";

        if ($this->isOldIE()){
            $sFileName = urlencode( $fileName );
        }
        else{
            $sFileName = $fileName;
        }

        $this->preventAutoPrint = true;

        header("Content-type: " . $contentType);
        header("Content-Disposition: attachment;filename=" . $sFileName);
        header("Content-Length: " . $iFileSize);
        header("Content-Description: File Data");
        header("Pragma: no-cache");
        header("Expires: 0");

        $file = fopen($path, "rb");

        fpassthru($file);

        fclose($file);
    }

    public function setConfig($key, $val){
        $this->config->set($key, $val);
    }
    public function getConfig($key){
        return $this->config->get($key);
    }

    public function setData($data){
        $this->json["data"] = $data;

        return $this;
    }
    public function setCount($count){
        $this->json["count"] = $count;

        return $this;
    }
    public function setInfo($info){
        $this->json["info"] = $info;

        return $this;
    }
    public function setEtc($etc){
        $this->json["etc"] = $etc;

        return $this;
    }
    public function setAuth($auth){
        $this->json["result"]["auth"] = $auth;

        return $this;
    }
    public function setValid($valid){
        $this->json["result"]["valid"] = $valid;

        return $this;
    }
    public function setState($state){
        $this->json["result"]["state"] = $state;

        return $this;
    }
    public function setDebug($debug){
        $this->json["result"]["debug"] = $debug;

        return $this;
    }
    public function setMsg($msg){
        $this->json["result"]["msg"] = $msg;

        return $this;
    }
    public function setRedirect($redirect){
        $this->json["result"]["redirect"] = $redirect;

        return $this;
    }
    public function addErr($err){
        $this->json["result"]["err"][] = $err;

        return $this;
    }

    // 설정값을 수정하는 기본 명령.
    // public function config(){
    //     $this->parameterEscape();
    //     $key = $this->parseParam( "key", "" );
    //     $val = $this->parseParam( "val", "" );

    //     if (!isset($key) || ($key === "") ||
    //         !isset($val) || ($val === "")
    //         ){

    //         $this->setValid(false)
    //         ->setMsg("key=$key,val=$val" . "설정 값이 잘 못 되었습니다.");

    //         return;
    //     }

    //     $this->setConfig( $key, $val );
    // }

    protected function checkSession($cmd){
        return true;
    }

    public function run($cmd){
        if ($this->ran){
            return $this;
        }

        if ($this->checkSession($cmd) !== true){
            $this->setAuth( false );
        }
        else{
            $this->ran = true;
            $refMethod = new ReflectionMethod( get_class( $this ), $cmd );
            $refMethod->invoke( $this );
        }

        if ($this->preventAutoPrint == false){
            if (Config::$debug){
                $this->log( "@@ JSON Result @@" );
                echo json_encode( $this->json );
                echo "\n";
            }
            else{
                echo json_encode( $this->json );
            }
        }

        return $this;
    }

    protected function send404(){
        header("HTTP/1.0 404 Not Found");
        //http_response_code(404);
        

        include_once $_SERVER["DOCUMENT_ROOT"] . $GLOBALS["__mvcRoot"] . "/view_error/error.404.php";
        exit();
    }
}
?>