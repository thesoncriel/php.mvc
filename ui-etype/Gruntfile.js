/*
cygwin 접근
cd  /cygdrive/d/git-repository/001__Projects/81__mvc/ui-etype
*/
module.exports = function(grunt){
	var sSrcPath = "lib/src/"
	,	sBowerPath = "bower_components/"
	,	sJsPath = "js/"
	//,	sFTPHost = "211.43.189.155"
	//,	sAuthKey = "root(155)"
	,	sFTPHost = "211.239.121.22"
	,	sAuthKey = "root"
	,	aLib
	,	aDebugLib
	,	aModules
	,	aDebugModules
	,	aDebugModuleExcept
	,	aUploadExclusions
	,	aBuildFolders
	,	aBuildFiles
	,	aWebcubeFiles
	;

	//grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-yui-compressor");
	grunt.loadNpmTasks("grunt-sftp-deploy");
	grunt.loadNpmTasks("grunt-mkdir");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");

	// 서버용
	aLib = [
		sSrcPath + "require.min.js",
		sSrcPath + "require.no.amd.js",
		sSrcPath + "jquery-1.11.0.min.js",
		//sSrcPath + "tinyscrollbar/lib/jquery.tinyscrollbar.min.js",
		sSrcPath + "jquery.tinyscrollbar.fix.min.js",
		sSrcPath + "knockout-3.4.2.js",
		sSrcPath + "sammy.fix.min.js",
		sSrcPath + "placeholders.min.js",
		sSrcPath + "swfobject.js",
	];

	aModules = [
		"js/config/dependencies.js",
		"js/config/provider.js",
		"js/config/config.js",

		"js/service/*.js",
		"js/component/*.js",
		"js/factory/*.js",
		"js/controller/*.js",
		"js/route/*.js",
		"js/viewmodel/*.js",

		"js/app.js"
	];

	// 로컬 테스트용
	aDebugLib = [
		sSrcPath + "require.js",
		sSrcPath + "require.no.amd.js",
		sSrcPath + "jquery-1.11.0.min.js",
		//sSrcPath + "tinyscrollbar/lib/jquery.tinyscrollbar.js",
		sSrcPath + "jquery.tinyscrollbar.fix.js",
		sSrcPath + "knockout-3.4.2.js",
		sSrcPath + "sammy.fix.js",
		sSrcPath + "placeholders.js",
		sSrcPath + "swfobject.js",
	];

	aDebugModules = [
		"js/config/dependencies.js",
		"js/config/provider.js",
		"js/config/config.js",

		"js/service/*.js",
		"js/component/*.js",
		"js/factory/*.js",
		"js/controller/*.js",
		"js/route/*.js",
		"js/viewmodel/*.js",

		"js/app.js"
	];

	// 테스트 시 제외 할 모듈 파일명들
	aDebugModuleExcept = [
		"service.backend.js"
	];

	aUploadExclusions = [
		"node_modules",
		"lib", "posters",
		".ftppass", ".git*",
		"bower.json",
		"koala-config.json",
		"main_page.ori.html",
		"package.json",
		"sftp-config.json",
		"*.scss", "*.psd"
	];

	// 빌드 시 생성할 폴더
	aBuildFolders = [
		//"dest",
		"dest/CE",
		//"dest/CE/js", 
		//"dest/CE/css", 
		//"dest/CE/css/img", 
		//"dest/CE/img",
		"dest/comicviewer"
	];

	// 빌드 시 복사 할 파일
	aBuildFiles = [
		// 메인페이지 및 코믹뷰어 php 소스
		{expand: true, src: ["main_page.php", "main_page.html.php", "comicviewer.php","comicviewer.html.php"], dest: "dest/CE/"},
		// 코믹뷰어 수행 인덱스
		{expand: false, src: "comicviewer_index.php", dest: "dest/comicviewer/index.php"},
		// 코믹뷰어 플러그인 체크
		{expand: false, src: "comicviewer_plugin_check.php", dest: "dest/comicviewer/plugin_check.php"},
		// css 및 js
		{expend: true, src: [
			"js/index.min.js", "js/libs.min.js",
			"js/FlashImageComponent.swf", "js/expressInstall.swf",
			"css/index.min.css", "css/ie.min.css", 
			"css/img/*.cur", "css/img/cur_*.png",
			"css/img/icons.png", "css/img/icons.wow.png",
			"css/img/loader_3.gif",
			"css/img/no_poster.jpg",
			"css/img/page_alt.png",
			"css/img/page_empty.png",
			"css/img/page_ratio_cover.png",
			"img/tv_bg.ptv.jpg", "img/tv_bg.wow.jpg", "img/ban_01.jpg"
			], dest: "dest/CE/"}
	];

	// 웹큐브 복사 파일
	aWebcubeFiles = [
		{expand: true, src: ["WebCube/**", "webcube4176/**"], dest: "dest/comicviewer/"}
	];

		

	function isExceptModule(arr, filepath){
		var i = -1
		,	iLen = 0
		;

		iLen = arr.length;

		while(++i < iLen){
			if (filepath.indexOf( arr[i] ) >= 0){
				return true;
			}
		}

		return false;
	};

	grunt.initConfig({
		// 어글리파이는 IE8 이하에서 제대로 적용이 안된다.
		// 따라서 YUI-Compressor를 사용 한다.
		uglify: {
			// etypeLibs: {
			// 	files: {
			// 		"lib/src/require.min.js": [ sBowerPath + "requirejs/require.js" ],
			// 		"lib/src/sammy.fix.min.js": [ sSrcPath + "sammy.fix.js" ]
			// 	}
			// },
			// etypeModules: {
			// 	files: {
			// 		"js/index.min.js": [ "js/index.js" ]
			// 	}
			// }
			options: {
				ie8: true
			},
			build: {
				files: {
					"./js/index.min.js": [ "./js/index.js" ]
				}
			}
		},
		concat: {
			etypeLibs: {
				src: aLib,
				dest: "js/libs.min.js"
			},
			etypeModules: {
				src: aModules,
				dest: "js/index.js",
				filter: function(filepath){
					var regex = /test|debug/ig;

					return regex.test(filepath) === false;
				}
			},
			etypeBundle: {
				src: ["lib/libs.min.js", "js/index.min.js"],
				dest: "js/bundle.js"
			},

			etypeDebugLibs: {
				options: {
					sourceMap: true
				},
				src: aDebugLib,
				dest: "js/libs.min.js"
			},
			etypeDebugModules: {
				options: {
					sourceMap: true
				},
				src: aDebugModules,
				dest: "js/index.js",
				filter: function(filepath){
					return isExceptModule(aDebugModuleExcept, filepath) === false;
				}
			}
		},
		min: {
			dist: {
				src: "./js/index.js",
				dest: "./js/index.min.js"
			}
		},
		cssmin: {
			index: {
				src: "./css/index.css",
				dest: "./css/index.min.css"
			},
			ie: {
				src: "./css/ie.css",
				dest: "./css/ie.min.css"
			}
		},
		// sass: {
		// 	dist: {
		// 		options: {
		// 			compass: true,
		// 			style: "expanded"
		// 		},
		// 		// files: [{
		// 		// 	expand: true,
		// 		// 	cwd: ["css/"],
		// 		// 	src: ["**/*.scss"],
		// 		// 	dest: "css/",
		// 		// 	ext: ".css"
		// 		// }]
		// 		files: {
		// 			"./css/index.css": "./css/index.scss"
		// 		}
		// 	}
		// },
		"sftp-deploy":{
			build: {
				auth: {
					host: sFTPHost,
					port: 22,
					authKey: sAuthKey
				},
				src: "js",
				dest: "/usr/local/vods_ptv/httpd/htdocs/CE/js",
				exclusions: aUploadExclusions
			},
			css: {
				auth: {
					host: sFTPHost,
					port: 22,
					authKey: sAuthKey
				},
				src: "css",
				dest: "/usr/local/vods_ptv/httpd/htdocs/CE/css",
				exclusions: aUploadExclusions
			},
			buildwow:{
				auth: {
					host: sFTPHost,
					port: 22,
					authKey: sAuthKey
				},
				src: "js",
				dest: "/usr/local/vods_wow/httpd/htdocs/CE/js",
				exclusions: aUploadExclusions
			},
			csswow: {
				auth: {
					host: sFTPHost,
					port: 22,
					authKey: sAuthKey
				},
				src: "css",
				dest: "/usr/local/vods_wow/httpd/htdocs/CE/css",
				exclusions: aUploadExclusions
			}
		},
		watch:{
			js: {
				files: aModules,
				tasks: ["etype", "uploadjs"]
			},
			css: {
				files: ["css/index.css", "css/ie.css"],
				tasks: ["cssmin:index", "cssmin:ie", "uploadcss"]
			}
			// sass: {
			// 	files: ["css/*.scss"],
			// 	tasks: ["sass"]
			// }
		},
		clean: {
			build:{
				options: {
					"force": true
				},
				src: ["./dest"]
			}
		},
		mkdir: {
			build: {
				options: {
					mode: 0777,
					create: aBuildFolders
				}
			}
		},
		copy: {
			build: {
				files: aBuildFiles
			},
			webcube: {
				files: aWebcubeFiles
			}
		}
	});

	grunt.registerTask("etype", ["concat:etypeLibs", "concat:etypeModules", "min:dist"/*"uglify:build"*/, "cssmin:index", "cssmin:ie"]);
	grunt.registerTask("etyped", ["concat:etypeDebugLibs", "concat:etypeDebugModules"]);
	grunt.registerTask("uploadjs", ["sftp-deploy:build"
		, "sftp-deploy:buildwow"
		]);
	grunt.registerTask("uploadcss", ["sftp-deploy:css"
		, "sftp-deploy:csswow"
		]);
	//grunt.registerTask("build", ["sftp-deploy:css"]);
	grunt.registerTask("build", ["etype", "clean:build", "mkdir:build", "copy:build"]);
	grunt.registerTask("webcube", ["copy:webcube"]);
	//grunt.registerTask("sasscompile", ["sass:dist"]);
	//grunt.registerTask("min", ["uglify:build"]);
};