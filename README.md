# PHP MVC Library
2016년 제작.  
기존에 고객에게 제공되던 WebLauncher UI가 너무 무겁고 서버에 부담을 주고 트래픽도 많이 차지하여 가맹점, 고객, 그리고 상부에서도 여러가지로 말이 많았었다.  
때문에 최적화 작업이 논의가 되었는데, 그 작업을 함에 있어 함께 진행된 모듈화 및 리펙토링 작업의 결과물이다.

## 내용
CodeIgniter 같은 MVC Framework를 적용할 수 없는 PHP 5.3 버전을 운영중이었고, 자칫 버전을 잘 못 올리면 서비스가 잘 못될 우려가 제기되어 부득이하게 자체 MVC 패턴을 적용 하였다.  
크게 Controller, Service, Model 3가지로 구분하여 백엔드를 구성하고, Controller는 기본적으로 파라메터, 세션 처리와 Service 나 Model 호출을 하고 JSON을 출력하도록 구성 했다.  
Service는 보다 복잡한 외부 연결이나 자료 분석 및 APC를 통한 캐시 기능을 담당,  
Model은 오직 DB에 접근하여 SQL로 자료를 처리하는 역할만 담당토록 하였다.  
기존엔 클라이언트 버전별, 업무 종류별로 모두 따로 소스가 있었고, 그 내용 역시 비슷한 것들로 구성되어 있었기 때문에 관리가 매우 힘들었으나 이 MVC를 적용한 후엔 개별 업무들이 사용되는 공통 모듈을 두고 One Source로 사용되기에 한결 관리가 편해졌다.

## 적용 업무
* VODS
	- PC방 및 모텔 서비스 UI 출력부 (통칭 웹런처)
	- 컨텐츠 목록 및 상세 출력
	- 쿠폰 및 Allat 결제부
	- 만화 및 영화와 같은 컨텐츠 연결
	- 코믹뷰어
* MNG 관리자 사이트
	- 가맹점 정보 확인
	- 클라이언트 등록 확인
	- 가맹점별 옵션 설정 기능
	- 가맹점별 이용 컨텐츠 현황 출력
	- APC 캐시 관리
	- 등록 컨텐츠 확인
* 성인셋탑
	- STB 관리자 사이트
	- 셋탑박스 제어 통신 모듈
	- 방송 스케줄 생성기
	- 광고 설정
	
## 적용 기술
VODS는 수행되는 웹런처가 부득이하게 IE5로 동작되는 WebView를 가지고 있어서 신기술 및 레이아웃 적용에 어려움이 많았다.  
그래서 기존에 투명 이미지 및 일부 CSS3를 쓰기위한 라이브러리등은 속도 관계상 과감하게 제거하고 투명 이미지는 아예 배경 색깔에 맞춰진 불투명 이미지로 대신 하였다.  
아이콘및 디자인용 이미지가 몇십가지로 분할되어 있어서 Image Sprite를 적용 하였고 IE CSS hack 및 조건부 주석을 활용하여 클라이언트의 다양한 구동 환경을 고려 하였으며, 사내 직원이 웹뷰를 테스트 할 때 굳이 클라이언트 SW를 구동하지 않아도 되게끔 웹표준을 준수하여 작업 하였다.  
유지보수의 용의함과 속도의 두마리 토끼를 잡기 위하여 AMD를 적용, 각종 기능들을 모듈화 하였으며 Grunt를 활용하여 배포시 필요한 파일들만 별도로 복사하거나 watch 기능을 이용하여 테스트를 위한 수정 단계에서도 실시간으로 테스트 서버에 build 하고 업로드 할 수 있는 간이 빌드 시스템을 적용 하였다.
CSS는 SASS를 활용하였으며 컴파일러로 koala를 함께 이용 하였다.

* VODS
	- requireJS (AMD 적용 - 단, build 하면 js가 하나의 파일로 합쳐지기에 순수 모듈 관리 용으로 쓰임)
	- knockoutJS
	- sammyJS (클라이언트 측 RESTful 적용. 일부 확인된 버그 수정)
	- jQuery
		- tinyscrollbar (우측 스크롤 기능으로 사용. 일부 확인된 버그 수정)
	- placeholders (input 요소의 placeholder 기능을 IE8 이하에서 적용되도록 지원)
	- swfobject 
		- FLEX3 (코믹 뷰어의 Image Component 적용. IE9 이하 전용)
	- SASS (compiler: koala)
		- Background Image Sprite 적용
		- IE Hack 적용
	- Grunt (프로젝트 빌드 및 이용 파일 복사, 테스트 시 watch로 업로드 병행)
	- node.js (패키지 관리용)
* MNG, STB 관리자 사이트
	- AngularJS & UI-Router
	- jQuery
	- Bootstrap
	
### 코믹 뷰어
원래 이 서비스는 ActiveX 전용이었다.  
그러나 윈10이 출시되고 가맹점에 널리 퍼지면서 이게 문제가 되었다.  
그래서 웹표준 방법을 적용하기 위해 새로 만든 것이 바로 이 것.  
원래 코믹 뷰어는 DRM 적용된 이미지를 바이너리로 처리하여 해독한 뒤 출력해야 하는데, 기존에 ActiveX로 C++ 에서 처리하던 것을 html5로 바꾸고 Blob 및 FileAPI로 처리할 수 있도록 하였다.  
그러나 이를 지원 못하는 IE9 이하 웹브라우저를 위해 FLEX를 일부 사용 하였다. (FLEX는 Flash Develop 를 이용함)  
이 내용들은 브라우저 환경에 따라 Image Component Factory 측에서 알맞은 컴포넌트를 제공하도록 만들었다.

## 비고
사정상 보안에 민감한 내용과 하부 컨텐츠 및 SQL문, 백엔드 모듈 등은 제거 함.

## Caution
- 내용을 참고만 하되 복붙하심 안됩니다..

## Screen Shots
### VODS - Web Launcher
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/001.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/002.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/003.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/004.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/005.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/006.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/007.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/008.png)

### VODS - Comic Viewer
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/comicviewer.png)

### MNG - VODS 관리자 사이트
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/011.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/012.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/013.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/014.png)

### STB - 성인셋탑 관리자 사이트
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/021.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/022.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/023.png)
![](https://github.com/thesoncriel/php.mvc/blob/master/screenshots/024.png)
