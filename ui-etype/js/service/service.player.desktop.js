;define("service.player.desktop", ["jquery", "util", "config", "service.purchase", "service.weblauncher.desktop"], 
	function($, util, config, purchase, weblauncher){

		return function(item){
			var contentId 	= util.mapValDef(item, "content_id")
			, mac = (config.custInfo)? config.custInfo.mac : ""
			;

			return {
				play: function(){
					var iPrice = 0
					;
					if (!contentId){
						alert(
							"재생 할 영상 정보가 부족합니다.\n" +
							"CONTENT_ID=" + contentId
							);

						return;
					}

					try{
						iPrice = parseInt( item.amt_price );
					}
					catch(e){}

					// 맥주소가 비었거나 가격이 비었거나 혹은 0원이라면
					// 곧바로 수행.
					if (!mac || !iPrice){
						weblauncher.play( item );

						return;
					}

					purchase(item)
					.done(function(){
						weblauncher.play( item );
					})
					.fail(function(error){
						if (error.msg){
							alert(error.msg);

							return;
						}

						alert("가격 정보에 오류가 있습니다.\n" + util.disassemble(error));
					})
					;
				},
				showTV: function(){
					weblauncher.showTV();
				}
			};
		};
	});