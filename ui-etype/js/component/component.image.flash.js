;define("component.image.flash", ["jquery", "component.image", "swfobject", "config", "util"], 
    function($, ImageComponent, swfobject, config, util){
    var FlashImageComponent = function(elem){
            this._index = imgIndex;
            this._src = "";
            this._altSrc = "";
            this._emptySrc = "";
            this._width = "";
            this._height = "";
            this._flashImg = null;
            this._jqParent = null;
            this._jqAsideBottom = null;
            this._jqAsideTop = null;
            this.imgInfo = undefined;
            this.isReady = false;
            this.isLoaded = true;
            this.resizeInterval = -1;
            this._resizeFirst = true;

            this.init(elem);

            imgIndex++;
        }
    ,   cp
    ,   imgIndex = 0
    ;
    
    FlashImageComponent.prototype = new ImageComponent();
    
    cp = FlashImageComponent.prototype;
    
    cp.constructor = FlashImageComponent;
    cp.init = function(elem){
    	ImageComponent.prototype.init.call(this, elem);
    	
        var iCompIndex = this._index
        , sPrefix = "FlashImageComponent"
        , compId = sPrefix + iCompIndex
        
        
        , self = this
        , jqElem = $(elem)
        , isAutoSize = jqElem.data("auto-size") === true
        , jqParent = (isAutoSize)? jqElem.parent() : undefined
        , sGlobalEventLoaded = "__onImageComponentLoaded"
        , sGlobalEventFail = "__onImageComponentFail"
        , sGlobalEventComplete = "__onImageComplete"
        , initWidth = 0
        , buildTimeoutId = 0
        ;

        this._jqParent = jqParent;
        this._jqAsideBottom = $( jqElem.data("aside-bottom") );
        this._jqAsideTop = $( jqElem.data("aside-top") );
        
        window[sGlobalEventLoaded + iCompIndex] = function(){
            var img = document.getElementById(sPrefix + iCompIndex)
            , me = self
            ;
            
            try{
                me._flashImg = img;
                me.isReady = true;
                me._jqParent = $(img).parent();
                me.applyAltAndEmpty();
                me.onReady(me);
            }
            catch(e){
                me._throwError(3, e, me);
            }
        };
        
        window[sGlobalEventFail + iCompIndex] = function(errorCode){
            self._throwError(errorCode, {src: self.getSrc()}, self);
            self.isLoaded = true;
        };
        
        window[sGlobalEventComplete + iCompIndex] = function(_info){
            var info = _info;

            try{
                info.ratio = info.width / info.height;
                
                self.imgInfo = info;
                self.isLoaded = true;
                self.onLoaded(self, info);
            }
            catch(e){
                self.isLoaded = true;
                self._throwError(4, e, self);
            }
        };
        
        if (isAutoSize){
            $(window).on("resize", function(e){
                if (self.resizeInterval > -1){
                    clearTimeout(self.resizeInterval);
                }

                self.resizeInterval = setTimeout(function(){
                    self.resize();
                }, 50);
            });
        }

        this.destruct = function(){
            ImageComponent.prototype.destruct.call(this);
            
            this._flashImg = undefined;
            this._jqParent = undefined;
            this._jqAsideBottom = undefined;
            this._jqAsideTop = undefined;
            window[sGlobalEventLoaded + iCompIndex] = undefined;
            window[sGlobalEventFail + iCompIndex] = undefined;
            window[sGlobalEventComplete + iCompIndex] = undefined;
        };

        this.build = function(){
            var flashvars = {
                index: this._index
                ,debug: "false"
            }
            , initWidth = jqElem.innerWidth() / 2
            , sFlashPath = config.flashShimPath || "js/"
            , params = {
                menu: "false",
                scale: "noScale",
                allowFullscreen: "false",
                allowScriptAccess: "always",
                bgcolor: "",
                wmode: "Opaque"
                //wmode: "direct" // can cause issues with FP settings & webcam
            }
            , attributes = {
                id: compId
            }
            ;

            if (initWidth <= 0){
                initWidth = 1;
            }
            
            swfobject.embedSWF(
                sFlashPath + "FlashImageComponent.swf", 
                jqElem.attr("id"), initWidth, 1, "10.0.0", 
                sFlashPath + "expressInstall.swf", 
                flashvars, params, attributes);

            jqElem = undefined;
        };
        
        return this;
    };
    /**
    data-aside-bottom, 혹은 top 속성값의 선택자와 대응되는 요소의 높이를 가져 온다.
    없었다면 0을 반환.
    */
    cp.getAsideHeight = function(dir){
        var jqElem = this["_jqAside" + dir]
        , iHeight = 0
        //, iever
        ;

        if (jqElem.length === 0){
            return 0;
        }

        return jqElem.innerHeight();

        //iHeight = jqElem.innerHeight();

        //return iHeight;
    };
    cp.resize = function(noDuplicate){
        var h = 0
        ,   jqParent = this._jqParent
        ,   self = this
        ;

        if (this.isDisplay() === false){
            return;
        }
        
        if (!this.isReady || !jqParent || !self.imgInfo){
            return;
        }

        h = $(document).innerHeight() - this.getAsideHeight("Bottom") - this.getAsideHeight("Top");

        //console.log("h", h, $(document).innerHeight(), this.getAsideHeight("Bottom"), this.getAsideHeight("Top"));

        if (h > 1080){
            h = 1080;
        }

        
        self.setHeight( h );
        self.setWidth( h * self.imgInfo.ratio );

        if (noDuplicate){ 
            return;
        }

        setTimeout(function(){
            var docH = $(document).innerHeight()
            , imgH = self.getHeight() + self.getAsideHeight("Bottom") + self.getAsideHeight("Top")
            , selfH = self.getHeight()
            ;

            //console.log("docH=", docH, "imgH=", imgH, "selfH=", selfH);

            if (docH < imgH){
                self.resize();
            }
            else{
                self.resize(true);
            }

            
        }, 50);
    };
    
    cp.getSrc = function(){
        return this._src;
    };
    cp.setSrc = function(src){
        if (!this.isReady || 
            !this.isLoaded){
            return;
        }
        if (this._src === src){
            this.onLoaded(this, this.imgInfo);

            return;
        }
        this._src = src;
        this.isLoaded = false;
        this._flashImg.setSrc( src );
    };

    cp.getAltSrc = function(){
        return this._altSrc;
    };
    cp.setAltSrc = function(src){
        if (this._altSrc === src){
            return;
        }
        this._altSrc = src;

        if (!this.isReady){
            return;
        }
        this._flashImg.setAltSrc( src );
    };

    cp.getEmptySrc = function(){
        return this._emptySrc;
    };
    cp.setEmptySrc = function(src){
        if (this._emptySrc === src){
            return;
        }
        this._emptySrc = src;

        if (!this.isReady){
            return;
        }
        this._flashImg.setEmptySrc( src );
    };
    cp.empty = function(){
        if (!this.isReady || 
            !this.isLoaded ||
            !this._emptySrc){
            return;
        }

        this._src = "";
        this._flashImg.empty();
    };

    cp.applyAltAndEmpty = function(){
        var img = this._flashImg
        , altSrc = this._altSrc
        , emptySrc = this._emptySrc
        ;

        if (altSrc){
            img.setAltSrc(altSrc);
        }
        if (emptySrc){
            img.setEmptySrc(emptySrc);
        }
    };
    
    cp.getWidth = function(){
        return this._width;
    };
    cp.setWidth = function(width){
        this._width = width;
        this._flashImg.style.width = width + "px";
    };
    cp.getHeight = function(){
        return this._height;
    };
    cp.setHeight = function(height){
        this._height = height;
        this._flashImg.style.height = height + "px";
    };
    cp.show = function(){
        $(this._flashImg).css("width", "1px");
        this.resize();
    };
    cp.hide = function(){
        $(this._flashImg).css("width", "0px");
    };
    cp.isDisplay = function(){
        var sDisplay = $(this._flashImg).css("width");

        return (sDisplay === "" || (sDisplay !== "0" && sDisplay !== "0px"));
    };
    // @override
    cp.onLoaded = function(img, info){
        ImageComponent.prototype.onLoaded.apply(this, arguments);
        this.resize();
    };
    
    return FlashImageComponent;
});