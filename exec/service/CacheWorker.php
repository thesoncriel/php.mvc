<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class CacheWorker extends JwayService{
    protected $parser = null;

    public function __construct(&$config = null){
        parent::__construct($config);

        $this->parser = ServiceFactory::create("CustOptionParser", $config);
    }

    public function __destruct(){
        parent::__destruct();

        unset( $this->parser );
    }

    public function setModel($model){
        parent::setModel($model);
    }

    public function makeTmpDir($tmpPath){
        if (file_exists($tmpPath)){
            $this->log( "임시 폴더 - $tmpPath - 가 존재함. 삭제 시도." );
            $this->rmdirAll( $tmpPath );
            $this->log( "성공." );
        }

        $this->log( "임시 작업 장소 - $tmpPath 폴더 생성 시도." );
        
        if (mkdir( $tmpPath, 0777, true )){
            $this->log( "성공." );
        }
        else{
            $this->log( "실패." );
        }
    }

    public function moveDirWithBackup($pathDest, $pathSrc){
        if (file_exists($pathSrc)){
            // 더이상 백업을 남기지 않고 삭제 한다.
            $this->rmdirAll($pathSrc);
        }
        
        $this->log( "폴더명 변경 시도 === $pathDest -> $pathSrc " );
        
        if(rename( $pathDest, $pathSrc )){
            $this->log( "성공." );
        }
        else{
            $this->log( "실패." );
        }
    }

    // 출처: http://flystone.tistory.com/54
    protected function rmdirAll($dir) {
       $dirs = dir($dir);
       while(false !== ($entry = $dirs->read())) {
          if(($entry != '.') && ($entry != '..')) {
             if(is_dir($dir.'/'.$entry)) {
                $this->rmdirAll($dir.'/'.$entry);
             } else {
                @unlink($dir.'/'.$entry);
             }
           }
        }
        $dirs->close();
        @rmdir($dir);
    }
}

?>