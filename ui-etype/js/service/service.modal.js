;define("service.modal", ["jquery", "service", "util"],
	function($, service, util, undefined){
		function createOverlay(jqModal){
			var sId = jqModal[0].id
			, jqOverlay = jqModal.prevAll(".modal-overlay[data-from='" + sId + "']")
			;

			if (jqOverlay.length === 0){
				jqModal.before('<div class="modal-overlay" data-from="' + sId + '"></div>');
				jqOverlay = jqModal.prev();
			}

			jqOverlay.bind("click", onOverlayClick);

			return jqOverlay;
		}

		function bindMouseEventToButtons(jqModal){
			jqModal.find("button.btn").each(function(index){
				var jqBtn = $(this)
				,	sClass = jqBtn.attr("class")
				,	aClass = (sClass)? sClass.split(" ") : []
				,	sLastClass = (aClass.length > 0)? aClass[ aClass.length - 1 ] : ""
				;

				if (sLastClass === ""){
					return;
				}

				jqBtn.data("btnClass", sLastClass);
				jqBtn.mouseenter(onBtnHover)
					.mouseleave(onBtnLeave);
				
			});
		}

		function unbindMouseEventFromButtons(jqModal){
			jqModal.find("button.btn")
			.removeData()
			.unbind("mouseenter", onBtnHover)
			.unbind("mouseleave", onBtnLeave)
			;
		}

		function onOverlayClick(event){
			var jq = $(this)
			;

			event.stopPropagation();

			jq.hide();
			jq.next().fadeOut(200);
		}

		function onBtnHover(event){
			var jq = $(this)
			,	sClass = jq.data("btnClass") + "-hover"
			;

			if (jq.hasClass(sClass) === false){
				jq.addClass(sClass);
			}
		}

		function onBtnLeave(event){
			var jq = $(this)
			,	sClass = jq.data("btnClass") + "-hover"
			;

			jq.removeClass( sClass );
		}

		return function(selector){
			var jqModal = $(selector)
			,	jqOverlay = createOverlay( jqModal )
			,	mCallback = {result: undefined, show: undefined, hide: undefined}
			,	jqResultButtons
			,	api
			;

			function callback(name, arg0, arg1, arg2){
				var fn = mCallback[ name ]
				;

				if (typeof fn === "function"){
					fn.call(api, arg0, arg1, arg2);
				}
			}

			function getResultButtons(){
				if (!jqResultButtons){
					jqResultButtons = jqModal.find("[data-result][type!='submit']");
				}

				return jqResultButtons;
			}

			function onResultButton(event, a, b){
				var jqBtn = $(this)
				,	result = jqBtn.data("result")
				;


				event.preventDefault();

				callback("result", result, event, a );

				if (jqBtn.data("role") === "close"){
					api.hide();
				}

				return false;
			}

			bindMouseEventToButtons( jqModal );
			getResultButtons().on("click", onResultButton);

			api = {
				show: function(){
					jqOverlay.show();
					jqModal.fadeIn(350, function(event){
						setTimeout(function(){
							callback("show", event);
							jqModal.find("input").eq(0).focus();
						}, 150);
					});

					service("placeholder")(jqModal);

					return this;
				},
				hide: function(){
					// 끄려는 오버레이가 자기 것이 아니면 패스 한다.
					// if (jqOverlay.data("from") !== jqModal[0].id){
					// 	callback("hide", {});

					// 	return this;
					// }

					jqOverlay.hide();
					jqModal.fadeOut(200, function(event){
						callback("hide", event);
					});

					return this;
				},
				clear: function(){
					jqModal.find("input[type='text']").val("");

					return this;
				},
				destroy: function(){
					jqOverlay.remove();
					jqOverlay = undefined;

					unbindMouseEventFromButtons(jqModal);
					getResultButtons().unbind("click", onResultButton);
					this.unbindAll();

					jqModal = undefined;
					mCallback = undefined;
					jqResultButtons = undefined;
					api = undefined;
				},
				bind: function(name, callback){
					mCallback[name] = callback;

					return this;
				},
				unbind: function(name, callback){
					mCallback[name] = undefined;

					return this;
				},
				unbindAll: function(){
					var key
					,	mCallbacks = mCallback;

					for(key in mCallbacks){
						mCallbacks[key] = undefined;
					}

					return this;
				}
			};

			return api;
		};
	});