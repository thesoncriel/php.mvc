<?php

//error_reporting(E_ALL);
//ini_set("display_errors", 1);
include_once $_SERVER["DOCUMENT_ROOT"] . "/__mvc.php";

$ctrl = ControllerFactory::create("Newkey", false);
$mInfo = $ctrl->getComicDetail();
$ver = Config::$Version;
/*
 * ※ 주석(//)으로 된 것은 불필요한 항목이기에 Controller 에서 unset 으로 제거 한 것.
$mInfo : Map (Comic Info.)
    {
        "serial": 작품ID (INDESK.comic_contents_books->serial 혹은 novel_contents_books->serial)
        "title": 작품명
        "grade": 0=일반, 1=성인
        //"thumb_path": 썸네일 포스터 경로 (ex: "/data/contents/27/2017051708354910027.jpg")
        "finish": 0=미완, 1=완결
        "regdate": 등록 날짜
        "books": 총 권수
        "series": 총 회수
        //"keyword": 검색 키워드
        //"summary": 줄거리
        "genre": 장르 코드
        "genre_name": 장르명
        "pub_name": 출판사명
        "cp_name": 제공사명
        "am_name": 그림작가
        "as_name": 글작가
        "bookno": 요청한 책 번호
        "type": 형태 (카테고리). comic=만화, novel=소설
        "contents_server_path": 컨텐츠 서버의 컨텐츠 폴더 경로. (권 번호는 빠짐)
        "send_bill_interval": 빌로그(Bill Log) 전달 간격 (초 단위)
        "fsp": flashShimePath -- swf 플래시 파일 경로
        "cai": Comic Alternate Image -- 만화 이미지 못불러 왔을 때 출력될 대체 이미지 경로
        "cei": Comic Empty Image -- 특정 상황에서 이미지를 빈(empty) 이미지로 출력될 대체 이미지 경로
        "cd": Contents Domain -- 만화 이미지를 불러올 도메인 정보
        "each_books":[ ----- 각 권별 정보
            {"book_serial": 책ID
            "bookno": 책(권) 번호
            "state": 출력 상태. 1=권, 2=회
            },

            ...
        ]
    }
*/

//print_r( $mInfo );


include "../CE/comicviewer.html.php";