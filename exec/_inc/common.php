<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class MySqlConnectionInfo{
    protected $dbuser = "";
    protected $dbpass = "";
    protected $dbname = ""; 
    protected $dbhost = "";
    protected $charset = "";

    public function __construct($dbhost = false, $dbname = false){
        $this->dbuser = Config::$dbuser;
        $this->dbpass = Config::$dbpass;
        

        if ($dbhost === false){
            $this->dbhost = Config::$dbhost;
        }
        else{
            $this->dbhost = $dbhost;
        }

        if ($dbname === false){
            $this->dbname = Config::$dbname;
        }
        else{
            $this->dbname = $dbname;
        }
    }

    public function getUser(){
        return $this->dbuser;
    }
    public function getPass(){
        return $this->dbpass;
    }
    public function getName(){
        return $this->dbname;
    }
    public function getHost(){
        return $this->dbhost;
    }
    public function getCharset(){
        return $this->charset;
    }

    public function ping(){
        $errCode = "";
        $errStr = "";
        $waitTimeout = 3;
        $fp = fsockopen( $this->getHost(), 3306, $errCode, $errStr, $waitTimeout );
        $bRet = false;

        if ($fp){
            $bRet = true;
        }

        fclose($fp);

        return $bRet;
    }
}

class CustomConnectionInfo extends MySqlConnectionInfo{
    public function __construct($dbhost, $dbname, $dbuser, $dbpass){
        $this->dbuser = $dbuser;
        $this->dbpass = $dbpass;
        $this->dbname = $dbname;
        $this->dbhost = $dbhost;
    }
}

class NewkeyConnectionInfo extends MySqlConnectionInfo{
    public function __construct(){
        $this->dbuser = NewkeyConfig::$dbuser;
        $this->dbpass = NewkeyConfig::$dbpass;
        $this->dbname = NewkeyConfig::$dbname;
        $this->dbhost = ($GLOBALS["__dev"])? NewkeyConfig::$dbhostTest : NewkeyConfig::$dbhost;
        $this->charset = "utf8";
    }
}

class Logger{
    public static function useLog($use){
        $GLOBALS["echoLog"] = $use;

        if ($use){
            error_reporting(E_ALL);
            ini_set("display_errors", 1);
        }
        else{
            error_reporting(0);
            ini_set("display_errors", 0);   
        }
    }
    public static function isUseLog(){
        if (array_key_exists("echoLog", $GLOBALS) === false){
            $GLOBALS["echoLog"] = false;

            return false;
        }

        return $GLOBALS["echoLog"] === true;
    }
    public static function log($name, $msg, $printTime = false){
        if (Logger::isUseLog()){
            $time = "";
            $str = "";

            if ($printTime){
                $time = " # " . date("Y-m-d H:i:s");
            }

            if (Config::$weblog){
                $str = '<strong style="color: #88C;">'
                . $name
                . '</strong>'
                . " : " . $msg . $time . "<br/>";
            }
            else{
                $str = "[" . $name . "]"
                . " : " . $msg . $time . "\n";
            }

            echo $str;
            //error_log( $str );
        }
    }
    public static function boxlog($name, $msg, $printTime = false){
        if (Logger::isUseLog()){
            $time = "";
            $str = "";

            if ($printTime){
                $time = " # " . date("Y-m-d H:i:s");
            }

            if (Config::$weblog){
                $str = '<pre style="border: 1px solid #333; padding: 1em">'
                . '<strong style="color: #88C;">'
                . $name
                . '</strong>'  . $time . "\n"
                . $msg
                . '</pre>';
            }
            else{
                $str = "┌─────────────────────────────────────────────────────────────────────────────┐\n"
                . "│ [" . $name . "]"  . $time . "\n"
                . "│ " . $msg . "\n"
                . "└─────────────────────────────────────────────────────────────────────────────┘\n\n";
            }

            echo $str;
            //error_log( $str );
        }
    }
}

class Util{
    //protected $echoLog = false;

    public function log($msg, $printTime = false){
        Logger::log(get_class( $this ), $msg, $printTime);

        return $this;
    }

    public function boxlog($msg, $printTime = false){
        Logger::boxlog(get_class( $this ), $msg, $printTime);

        return $this;
    }

    public function useLog($use = true){
        //echo get_class( $this ) . "=" . (($use)? "true" : "false"); 
        Logger::useLog($use);

        return $this;
    }

    public function isUseLog(){
        return Logger::isUseLog();
    }

    public function toEuckr($val){
        return iconv("UTF-8", "EUC-KR", $val);
    }
    public function toUTF8($val){
        return iconv("EUC-KR", "UTF-8", $val);
    }

    

    public function dateAddSecond($sDate, $sec){
        $date = null;

        if (is_string( $sDate )){
            $date = date_create($sDate);
        }
        else{
            $date = $sDate;
        }
        
        $date = date_add($date, date_interval_create_from_date_string("$sec seconds"));
        $sRet = date_format($date, "Y-m-d H:i:s");

        unset($date);

        return $sRet;
    }

    public function dateAddHour($sDate, $hour){
        $date = null;

        if (is_string( $sDate )){
            $date = date_create($sDate);
        }
        else{
            $date = $sDate;
        }
        
        $date = date_add($date, date_interval_create_from_date_string("$hour hours"));
        $sRet = date_format($date, "Y-m-d H:i:s");

        unset($date);

        return $sRet;
    }

    // 출처: http://stackoverflow.com/questions/173400/how-to-check-if-php-array-is-associative-or-sequential
    public function isAssoc(&$arr){
        return array_keys($arr) !== range(0, count($arr) - 1);
    }

    // 출처: http://stackoverflow.com/questions/15699101/get-the-client-ip-address-using-php
    // Function to get the client IP address
    public function getClientIP() {
        $ipaddress = '';
        if (isset($_SERVER['HTTP_CLIENT_IP']))
            $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
        else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        else if(isset($_SERVER['HTTP_X_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
        else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
        else if(isset($_SERVER['HTTP_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_FORWARDED'];
        else if(isset($_SERVER['REMOTE_ADDR']))
            $ipaddress = $_SERVER['REMOTE_ADDR'];
        else
            $ipaddress = 'UNKNOWN';
        return $ipaddress;
    }

    public function serializeParams(&$params){
        $sRet = "";

        if ($params === null){
            return "";
        }

        foreach ($params as $key => $value) {
            if ($sRet !== ""){
                $sRet .= "&";
            }

            $sRet .= $key . "=" . $value;
        }

        return $sRet;
    }

    public function parseValue($val, $def){
        if (isset($val) == false){
            return $def;
        }

        return $val;
    }

    public function parseInt($val, $def = 0){
        if (is_numeric( $val ) === false){
            return $def;
        }

        return intval( $val );
    }

    // public function shareValue(&$map, 
    //     $key0 = null, $key1 = null, $key2 = null, $key3 = null, $key4 = null, 
    //     $key5 = null, $key6 = null, $key7 = null, $key8 = null, $key9 = null){
        
    //     $args = $this->__getArgs( $key0, $key1, $key2, $key3, $key4, $key5, $key6, $key7, $key8, $key9 );
    //     $iLen = count( $args );
    //     $defVal = "";
    // }

    public function toUTF8Fields(&$data, 
            $key0 = null, $key1 = null, $key2 = null, $key3 = null, $key4 = null, 
            $key5 = null, $key6 = null, $key7 = null, $key8 = null, $key9 = null){
        $args = $this->__getArgs( $key0, $key1, $key2, $key3, $key4, $key5, $key6, $key7, $key8, $key9 );
        $iLen = count( $args );
        $iDataLen = count( $data );
        $arr = null;
        $iDataCnt = 0;
        $i = 0;

        if (isset($data) && ($this->isAssoc($data) == false)){
            $iDataCnt = count($data);

            foreach($data as $index => $item){
                $data[ $index ] = $this->__toUTF8Fields( $item, $args, $iLen );
            }

            return $data;
        }
        else if ($iDataLen > 0){
            return $this->__toUTF8Fields( $data, $args, $iLen );
        }
        else{
            return null;
        }
    }

    private function __toUTF8Fields(&$data, &$args, $iLen){
        $key = "";
        $i = -1;

        while(++$i < $iLen){
            $key = $args[ $i ];
            //$this->log($key);
            //$this->log($data[ $key ]);
            $data[ $key ] = $this->toUTF8( $data[ $key ] );
            //$this->log($data[ $key ]);
        }

        return $data;
    }

    private function __getArgs(){
        $args = func_get_args();
        $iLen = func_num_args();
        $aRet = array();

        foreach($args as $index => $val){
            if (isset($val)){
                $aRet[] = $val;
            }
            else{
                break;
            }
        }

        return $aRet;
    }

    public function toIntFields(&$data, $key0 = null, $key1 = null, $key2 = null){
        $i = -1;
        $iLen = count( $data );
        $item = null;

        if ($key0 === null){
            return $data;
        }

        while( ++$i < $iLen ){
            $item = &$data[ $i ];

            $item[ $key0 ] = intval( $item[ $key0 ] );

            if ($key1 !== null){
                $item[ $key1 ] = intval( $item[ $key1 ] );

                if ($key2 !== null){
                    $item[ $key2 ] = intval( $item[ $key2 ] );
                }
            }
        }

        return $data;
    }

    public function removeBOM(&$str){
        return str_replace(chr(239) . chr(187) . chr(191), "", $str);
    }

    public function isOldIE(){
        $ua = $_SERVER["HTTP_USER_AGENT"];

        return (strpos($ua, "MSIE 7") || strpos($ua, "MSIE 6") || strpos($ua, "MSIE 5"));
    }

    // 출처
    // http://stackoverflow.com/questions/834303/startswith-and-endswith-functions-in-php
    public function startsWith($haystack, $needle) {
        // search backwards starting from haystack length characters from the end
        return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== false;
    }

    public function endsWith($haystack, $needle) {
        // search forward starting from end minus needle length characters
        return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
    }


    /*@deprecated*/
    public function utf8ToEuckr($val){
        return $this->toEuckr($val);
    }
    /*@deprecated*/
    public function euckrToUtf8($val){
        return $this->toUTF8($val);
    }

    // CDN용 암호화
    public function encrypt4cdn($val){
        $encrypted = base64_encode(
            openssl_encrypt(
                $val, 
                Config::$cdnEncMethod, 
                Config::$cdnEncKey, 
                OPENSSL_RAW_DATA, 
                Config::$cdnEnvIv)
        );
        
        return bin2hex($encrypted);
    }
    // @deprecated
    public function encript4cdn($val){
        return $this->encrypt4cdn($val);
    }
}