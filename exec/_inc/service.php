<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class BaseService extends Util{
    public $httpGetResCode = 0;
	protected $model = null;
	protected $config = null;

	public function __construct(&$config = null){
		if (isset($config)){
			$this->config = $config;
		}
	}

	public function __destruct(){
		unset( $this->model );
		$this->config = null;
        
        if (Config::$debugModelConstDest){
            $this->log("service destruct" . " ===", true);
        }
	}

    public function applyModel($modelName){
        $this->model = ModelFactory::create( $modelName );

        return $this;
    }

    public function getModel(){
        return $this->model;
    }

	public function setModel(&$model){
		if ($model instanceof BaseModel){
    		$this->model = $model;
    	}

        return $this;
	}

	public function remoteHttpGet($url, $params = null){
		$sParams = $this->serializeParams( $params );
		$url = (strlen($sParams) < 3)? $url : $url . "?" . $sParams;
    	$ch = curl_init();
        $iErr = 0;
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);


        $sRet = curl_exec( $ch );
        $iErr = curl_errno($ch);
        $iRes = curl_getinfo( $ch, CURLINFO_HTTP_CODE );

        $this->httpGetResCode = $iRes;

        curl_close($ch);

        return $sRet;
    }

    public function remoteHttpGetJSON($url){
        $sJson = $this->remoteHttpGet( $url );
        $mRet = null;
        $iRes = $this->httpGetResCode;

        if ($iRes == 0){
            $iRes = 400;
        }

        if ($iRes >= 400){
            $mRet = array();
            $mRet["data"] = null;
            $mRet["res_code"] = $iRes;
            $mResult["result"] = array();

            if ($iRes == 408){
                $mRet["res_msg"] = "timeout";
            }
            else if ($iRes >= 500){
                $mRet["res_msg"] = "error500";
            }
            else if ($iRes >= 400){
                $mRet["res_msg"] = "error400";
            }
        }
        else{
            $mRet = json_decode( $sJson, true );
            $mRet["res_code"] = $iRes;
            $mRet["res_msg"] = "ok";
        }

        return $mRet;
    }

    public function appendDataToCSV($path, &$data){
        if ( count($data) === 0 ){
            return false;
        }

        $aFieldName = null;
        $useInsertField = false;
        $mRow = null;

        if ( file_exists( $path ) === false || filesize( $path ) < 5 ){
            $useInsertField = true;
        }

        $file = fopen( $path, "a+" );

        if ($useInsertField){
            $aFieldName = array();
            $mRow = &$data[0];

            foreach ($mRow as $key => $value) {
                $aFieldName[] = $key;
            }

            fputcsv($file, $aFieldName);
        }

        foreach ($data as $index => $mRow) {
            fputcsv($file , $mRow);
        }

        fclose( $file );

        return true;
    }
}
?>