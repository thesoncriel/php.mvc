<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class BaseModel extends Util{
    
}

class MySqlModel extends BaseModel{
    private $conn = null;
    private $err = array();
    private $affected = 0;
    private $connProvider = null;
    private $cacheKey = "";
    protected $keyCase = true;
    //protected $isOpend = false;

    
    public function __construct(&$model = null, &$connInfo = null){
        $sCharset = "";
        $dbinfo = null;

        if (Config::$debugModelConstDest){
            $this->log("model construct" . " === ", true);
        }

        if (($model instanceof BaseModel) && ($connInfo === null)){
            $this->connProvider = $model;
        }
        else{
            if ($model instanceof MySqlConnectionInfo){
                $this->log("model is MySqlConnectionInfo." . " === ", true);
                $dbinfo = $model;
            }
            else if ($connInfo instanceof MySqlConnectionInfo){
                $dbinfo = $connInfo;
            }

        	$this->open( $dbinfo );
        }
    }
    
    public function __destruct(){
        $this->connProvider = null;

        if (Config::$debugModelConstDest){
            $this->log("=========== destruct", true );
        }

        $this->close();        
    }

    public function open($connInfo = null){
        $dbinfo = null;
        $sCharset = "";
        $sHost = "";

        if ($connInfo instanceof MySqlConnectionInfo){
            $dbinfo = $connInfo;
        }
        else{
            $dbinfo = new MySqlConnectionInfo();
        }

        $sHost = $dbinfo->getHost();

        $this->conn = mysqli_connect( $dbinfo->getHost(), $dbinfo->getUser(), $dbinfo->getPass() );

        $sCharset = $dbinfo->getCharset();

        if ($sCharset !== ""){
            mysqli_set_charset( $this->conn, $sCharset );
            $this->log("===========mysql charset: " . $sCharset);
        }

        if (Config::$debugModelConstDest){
            $this->log("===========mysql opened :::: $sHost");
        }

        if (!$this->getConnection()){
            $this->err[] = "connection fail !";
            return false;
        }
        if(!mysqli_select_db( $this->getConnection(), $dbinfo->getName() )){
            $this->err[] = "DB Select Fail !";
            return false;
        }

        //$this->log("===mysql dbname=" . $dbinfo->getName());

        unset( $dbinfo );

        return true;
    }

    public function close(){
        if ($this->conn){
            @mysqli_close( $this->conn );

            if (Config::$debugModelConstDest){
                $this->log("===========mysql closed");
            }
        }
    }

    public function getConnection(){
    	if (isset($this->connProvider)){
    		return $this->connProvider->getConnection();
    	}
    	else{
    		return $this->conn;
    	}
    }
    
    public function select($query){
        $hasCacheKey = $this->cacheKey !== "";
        $sCacheName = "";
        $aRet = null;

        if ($hasCacheKey){
            $sCacheName = $this->cacheKey;
            //한번 쓰고나면 초기화 한다. 다른 곳에서는 캐시를 안쓸 수도 있기 때문
            $this->cacheKey = "";
            $this->log("cache name found : " . $sCacheName);
            $aRet = apc_fetch( $sCacheName );

            if (is_array( $aRet )){
                return $aRet;
            }

            $this->log("but cache data is null.");
        }

        $result = mysqli_query( $this->getConnection(), $query);
        $iRows = mysqli_num_rows($result);
        $aRet = array();

        $this
        ->log("[select begin]")
        ->boxlog($query);

        if ($this->keyCase){
            for($i = 0; $i < $iRows; $i++){
                $aRet[] = array_change_key_case( mysqli_fetch_assoc($result) );
            }
        }
        else{
            for($i = 0; $i < $iRows; $i++){
                $aRet[] = mysqli_fetch_assoc($result);
            }
        }
        
        $this->affected = 0;

        $this
        ->log("length = " . count($aRet))
        ->log("[select end]");

        if ($hasCacheKey){
            apc_add($sCacheName, $aRet, Config::$apcTimeLimit);
            $this->log("cache '" . $sCacheName . "' is now availiable. timelimit(sec) = " . Config::$apcTimeLimit);
        }
        
        return $aRet;
    }
    
    public function selectOne($query){
        $result = $this->select($query);

        $this->log("[selectOne end]");
        
        if (count($result) > 0){
            return $result[0];
        }

        $this->log("## not exist rows ##");
        
        return null;
    }

    public function selectOneValue($query, $field, $def = null){
        $mRes = $this->selectOne($query);

        if ($mRes !== null){
            return $mRes[ $field ];
        }

        return $def;
    }

    public function selectCount($query){
        $result = $this->select($query);

        $this->log("[selectCount end]");

        if (count($result) > 0){
            return intval( $result[0]["cnt"] );
        }

        $this->log("## not exist rows ##");

        return 0;
    }
    
    public function selectPaging($query, $page, $count){
        $page = $this->parseValue( $page, 1 );
        $count = $this->parseValue( $count, 10 );

        if ($page < 1){
            $page = 1;
        }
        
        $sQuery = $query . " LIMIT " . (($page - 1) * $count) . ", " . $count;
        
        return $this->select($sQuery);
    }
    
    public function execute($query){
        $this->log("[execute begin]");

        $bResult = mysqli_query( $this->getConnection(), $query);
        
        if ($bResult){
            $this->affected = mysqli_affected_rows( $this->getConnection() );
        }
        else{
            $this->affected = 0;
        }

        $this
        ->boxlog($query)
        ->log("## affected = " . $this->affected . " ##")
        ->log("[execute end]");
        
        return $this->affected;
    }
    
    public function getAffected(){
        return $this->affected;
    }
    
    public function getErr(){
        return $this->err;
    }
    
    public function hasErr(){
        return sizeof($this->err) > 0;
    }

    public function cache($name){
        $this->cacheKey = $name;
    }

    public function deleteCache($name){
        $this->log("try delete cache : " . $name);

        return apc_delete($name);
    }
}
?>