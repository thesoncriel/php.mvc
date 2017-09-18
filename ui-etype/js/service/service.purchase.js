;define("service.purchase", 
	["util", "config", "viewmodel", "service", "service.modal"],
	function(util, config, viewmodel, service, modal, undefined){

	var vmPurchase
	, fnDestroy
	, fnInitFrame
	;

	fnDestroy = function(){
		if (vmPurchase){
			vmPurchase.destroy();
			vmPurchase = undefined;
		}
	};

	

	return function(item){
		if (item === "destroy"){
			fnDestroy();

			return;
		}

		if (!vmPurchase){
			vmPurchase = viewmodel("purchase").init().apply();
		}

		return util.promise(function(resolve, reject){
			var iPrice = 0
			, custInfo = config.custInfo
			, mac = (custInfo) ? custInfo.mac : ""
			;

			if (!mac){
				reject({msg: "MAC 주소가 비었습니다."});

				return;
			}

			try{
				iPrice = parseInt( item.amt_price );
			}
			catch(e){
				reject(e);

				return;
			}

			// 가격 정보가 유효하다면 Modal을 출력해서 process 를 진행
			if (iPrice > 0){
				service("backend")
				("/exec/purchase_info_check.php", {
					contentId: item.content_id,
					custId: custInfo.id_cust,
					mac: mac
				})
				.done(function(res){
					if (res.info){
						resolve(item);

						return;
					}

					vmPurchase.promise(item)
					.done(function(result){
						if (result && result.msg){
							alert(result.msg);
						}
						resolve(item);
					})
					.fail(function(err){
						reject(err);
					})
					.always(function(){

					});
				})
				.fail(function(){
					reject({msg: "결제 정보를 확인할 수 없었습니다."});
				});
			}
			else{
				reject({msg: "가격 정보가 없거나 0원 입니다."});
			}
		});
	}
});