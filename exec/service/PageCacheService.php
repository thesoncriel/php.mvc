<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

class PageCacheService extends CacheWorker{
    protected $movieListPath = "";
    protected $movieDetailPath = "";

	public function __construct(&$config = null){
		parent::__construct($config);
        
        $cacheRoot = $_SERVER["DOCUMENT_ROOT"] . Config::$CacheRoot;

        $this->movieListPath = $cacheRoot . Config::$MovieListPath;
        $this->movieDetailPath = $cacheRoot . Config::$MovieDetailPath;
	}

	public function __destruct(){
		parent::__destruct();
	}

	public function setModel(&$model){
		parent::setModel($model);
	}

    protected function getCacheRootPath($sub = null){
        if (strlen($sub) > 0){
            return $_SERVER["DOCUMENT_ROOT"] . Config::$CacheRoot . $sub . "/";
        }
        return $_SERVER["DOCUMENT_ROOT"] . Config::$CacheRoot;
    }

    public function getMovieListCachePath($sub = null){
        return $this->getCacheRootPath($sub) . Config::$MovieListPath;
    }

    public function getMovieDetailCachePath($sub = null){
        return $this->getCacheRootPath($sub) . Config::$MovieDetailPath;
    }

    public function getBestChoiceCachePath($sub = null){
        return $this->getCacheRootPath($sub) . "best_choice";
    }

    public function getBoxOfficeCachePath($sub = null){
        return $this->getCacheRootPath($sub) . "box_office";
    }
    
    public function getLatestMovieCachePath($sub = null){
        return $this->getCacheRootPath($sub) . "latest_movie";
    }

    public function getSTBKeyboardCachePath($sub = null){
        return $this->getCacheRootPath($sub) . "main_page_keyboard";
    }
    
    public function getSTBMouseCachePath($sub = null){
        return $this->getCacheRootPath($sub) . "main_page_mouse";
    }
    


    public function movieDetailCreate($subName = ""){
        $maxEPG = $this->model->getMaxEPGID();
        $aList = $this->model->selectAvailableMovieList();
        $parentPath = $this->getMovieDetailCachePath( $subName );
        $tmpPath = $parentPath . "_tmp_";
        $filePath = "";
        $iFileSize = 0;
        $posterUrl = Config::$VodStreamPoster;
        $uiPath = Config::$PTVUIPath;
        $checkLocalPoster = $this->startsWith( $posterUrl, "http" ) === false;
        $contentId = "";
        $sTitle = "";
        $sContentPath = "";
        $item = null;
        $index = -1;
        $iLen = count($aList);

        $this->log( "Movie Detail Cache 파일 생성 시작.", true );
        $this->log( "대상 EPG = $maxEPG | 대상 컨텐츠 개수 = $iLen" );

        $this->makeTmpDir( $tmpPath );

        while(++$index < $iLen){
            $item = &$aList[ $index ];
            $contentId = $item[ "CONTENT_ID" ];
            $sTitle = $item[ "TITLE" ];
            $sContentPath = $item[ "CONTENT_PATH" ];
            $filePath = $tmpPath . "/" . $contentId . ".html";
            
            $this->log( "=== 대상 컨텐츠 ===" );
            $this->log( "CONTENT_ID = " . $contentId );
            $this->log( "TITLE = " . $sTitle );
            $this->log( "CONTENT_PATH = " . $sContentPath );
            $this->log( "HTML 내용 수집 시작." );
            
            ob_start();
            
            // 실제 사용하여 출력해야 할 php 파일
            @include("_movie_detail.php");
            
            $iFileSize = file_put_contents( $filePath, $this->removeBOM(ob_get_contents())  );
                
            ob_end_clean();
            
            $this->log( "수집 종료." );
            $this->log( "$filePath 로 HTML 파일 저장 시도." );
            
            if ($iFileSize !== false){
                $this->log( "파일 저장 완료 ($iFileSize bytes)", true );
            }
            else{
                $this->log( "파일 저장 실패", true );
            }
        }

        unset( $item );
        unset( $aList );

        $this->moveDirWithBackup( $tmpPath, $parentPath );

        $this->log( "작업 종료", true );
    }

    /*
     * - movie list 캐시 파일을 생성 한다.
     * 이 때 아래의 파일들을 /CE/ 에서 include 해야 한다.
     * 
        include_once "inc/common.php";
        include_once "inc/common_db.php";
        include_once "inc/common_function.php";
     * 
     * 본 기능을 수행하는 컨트롤러 역시 run 할 때는 /CE/ 에서 수행 되어야 한다.
     * html을 만들 대상인 _movie_list.php 파일이 /CE/ 에서 수행 되어야 하기 때문이다.
     * 안그러면 include 가 꼬여서 수행이 안될 것이다...
     */
    
    public function movieListCreate($subName = "sub"){
        $codeList = CustOption::getOptionCodeList();
        $optList = $this->parser->getOptionList( $codeList );

        $this->createCacheFiles(
            $codeList,
            $optList,
            "_movie_list.php",
            $this->getMovieListCachePath( $subName ),
            Config::$VodStreamPoster,
            Config::$PTVUIPath,
            $subName,
            "Movie List 캐시"
        );
    }


    /*
    - PlayTV Best Choice 캐시를 만든다.
    - D-Type 의 메인페이지에서 쓰이는 것
    */
    public function bestChoiceCreate($subName = "sub"){
        $codeList = CustOption::getBinaryCodeList();
        $optList = $this->parser->getBestChoiceOptionList();

        //echo print_r( $codeList );
        //echo print_r( $optList );

        $this->createCacheFiles(
            $codeList,
            $optList,
            "_best_choice.php",
            $this->getBestChoiceCachePath( $subName ),
            Config::$VodStreamPoster,
            Config::$PTVUIPath,
            $subName,
            "PlayTV Best Choice 캐시"
        );
    }

    /*
    - PlayTV Box Office 캐시를 만든다.
    - D-Type 의 메인페이지에서 쓰이는 것
    */
    public function boxOfficeCreate($subName = "sub"){
        $codeList = array(0, 1);
        $optList = &$codeList;

        $this->createCacheFiles(
            $codeList,
            $optList,
            "_box_office.php",
            $this->getBoxOfficeCachePath( $subName ),
            Config::$VodStreamPoster,
            Config::$PTVUIPath,
            $subName,
            "PlayTV Box Office 캐시"
        );
    }

    /*
    - PlayTV Latest Movie 캐시를 만든다.
    - D-Type 의 메인페이지에서 쓰이는 것
    */
    public function latestMovieCreate($subName = "sub"){
        $codeList = array(0);
        $optList = &$codeList;

        $this->createCacheFiles(
            $codeList,
            $optList,
            "_latest_movie.php",
            $this->getLatestMovieCachePath( $subName ),
            Config::$VodStreamPoster,
            Config::$PTVUIPath,
            $subName,
            "PlayTV Latest Movie 캐시"
        );
    }

    public function stbKeyboardCreate($subName = "sub"){
        $codeList = CustOption::getBinaryCodeList( 1 << 7, 7 );
        $optList = $this->parser->getSTBOptionList( $codeList );

        //print_r( $codeList );

        $this->createCacheFiles(
            $codeList,
            $optList,
            "_main_page_keyboard.php",
            $this->getSTBKeyboardCachePath( $subName ),
            Config::$VodStreamPoster,
            Config::$PTVUIPath,
            $subName,
            "STB Keyboard 사용 - 영상 목록 캐시"
        );
    }
    public function stbMouseCreate($subName = "sub"){
        $codeList = CustOption::getBinaryCodeList( 1 << 7, 7 );
        $optList = $this->parser->getSTBOptionList( $codeList );

        //print_r( $codeList );

        $this->createCacheFiles(
            $codeList,
            $optList,
            "_main_page_mouse.php",
            $this->getSTBMouseCachePath( $subName ),
            Config::$VodStreamPoster,
            Config::$PTVUIPath,
            $subName,
            "STB Mouse 사용 - 영상 목록 캐시"
        );
    }


    protected function createCacheFiles(
        &$codeList, 
        &$optList, 
        $includeFile = "",
        $cachePath = "/tmp/_caches",
        $posterUrl = "posters",
        $uiPath = "/htdocs",
        $subName = "sub",
        $workName = "",
        $startMsg = "")
    {
        $parentPath = $cachePath;
        $tmpPath = $parentPath . "_tmp_";
        $filePath = "";
        $iFileSize = 0;
        $sCode = "";
        //$moviePath = $this->getMoviePath(); // 로컬 내 posters 에서 불러오는 것으로 결정됨.

        $opt = null;
        $checkLocalPoster = $this->startsWith( $posterUrl, "http" ) === false;
        
        $index = -1;
        $iLen = count( $optList );
        
        $this->log( "$workName 파일 생성 시작. 총 패턴 개수 = $iLen .", true );
        if (strlen($startMsg) > 0){
            $this->log( $startMsg );
        }
        
        $this->makeTmpDir( $tmpPath );
        
        while(++$index < $iLen){
            $opt = $optList[ $index ];
            $sCode = $codeList[ $index ];
            $filePath = $tmpPath . "/" . $sCode . ".html";
            
            $this->log( "HTML 내용 수집 시작. (CODE = $sCode)" );
            $this->log( var_export( $opt ) );
            
            ob_start();
            
            // 실제 사용하여 출력해야 할 php 파일
            @include( $includeFile );

            
            $iFileSize = file_put_contents( $filePath, $this->removeBOM(ob_get_contents()) );
                
            ob_end_clean();
            
            $this->log( "수집 종료." );
            $this->log( "$filePath 로 HTML 파일 저장 시도" );
            
            if ($iFileSize !== false){
                $this->log( "파일 저장 완료 ($iFileSize bytes)", true );
            }
            else{
                $this->log( "파일 저장 실패", true );
            }
        }

        $this->moveDirWithBackup( $tmpPath, $parentPath );
        
        unset( $codeList );
        unset( $optList );
        unset( $opt );
        
        $this->log( "작업 종료", true );
    }

}

?>