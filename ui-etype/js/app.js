;define("main", ["jquery", "knockout", "config", "service.route", "viewmodel", "util"], 
	function($, ko, config, route, viewmodel, util, undefined){
		function runWebLauncher(mInfo){
			var iIdProd = 0
			,	args = {custId: mInfo.id_cust};
			;

			viewmodel("movielist").init(args).apply();
			viewmodel("moviedetail").init(args).apply();
			viewmodel("comiclist").init(args).apply();
			viewmodel("comicdetail").init(args).apply();
			viewmodel("comicmenu").init().apply();
			viewmodel("weblauncher").init({actionPrevent: true}).apply();

			if (mInfo && mInfo.svc_status == 20){
				iIdProd = parseInt(mInfo.id_prod, 2);

				if (iIdProd & 4){
					route("#/movie/1/0");
				}
				else{
					route("#/tv");
				}

				return;
			}

			$("#panel_err").show();
		}
		function runComicViewer(mComicInfo){
			var args = {
				altImg: config.comicAltImg,
				emptyImg: config.comicEmptyImg,
				contentsDomain: config.comicContentsDomain,
				actionPrevent: true,
				info: mComicInfo
			};

			viewmodel("comicviewer").init(args).apply();

			route("#/");

			if (!mComicInfo.serial){
				$("#panel_err").show();
				$(".flash-download").hide();
			}
		}
		function runPluginCheck(){
			viewmodel("plugincheck").init().apply();
		}

		$(function(){
			var mCustInfo = config.custInfo
			,	mComicInfo = config.comicInfo
			,	bPlugincheck = config.pluginCheck
			;

			if (mCustInfo){
				runWebLauncher(mCustInfo);
			}
			else if (mComicInfo){
				runComicViewer(mComicInfo);
			}
			else if (bPlugincheck){
				runPluginCheck();
			}
		});
	});

require(["main"]);