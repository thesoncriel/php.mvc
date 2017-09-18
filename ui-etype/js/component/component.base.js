;define("component.base", ["jquery"],
    function($){
	var BaseComponent = function(){
		
	},	cp
	;
	
	cp = BaseComponent.prototype;
	
	cp.init = function(elem){
        this._events = {};
        this._eventsOwner = {};

		return this;
	};

    cp.destruct = function(){
        var key
        ;
        if (this._events === undefined){
            return;
        }

        for(key in this._events){
            this._events[key] = undefined;
            this._eventsOwner[key] = undefined;
        }

        this._events = undefined;
        this._eventsOwner = undefined;
    };

    // TODO: 만들어볼랬는데, 보류..
    // BaseComponent.property = function(){
    //     var i = 0
    //     , iLen = arguments.length
    //     , self = arguments[0]
    //     , name
    //     , _name
    //     ;
        
    //     while(++i < iLen){
    //         name = arguments[i];
    //         _name = "_" + name;
            
    //         self[ name ] = new Function('if (arguments[0] === undefined){return this._' + name + ';} this._' + name + '=arguments[0];');
    //         self[ _name ] = 
    //     }
    // };
	
	BaseComponent.regEvent = function(){
        var i = 0
        , iLen = arguments.length
        , self = arguments[0]
        , name
        , nameLower
        ;
        
        while(++i < iLen){
            name = arguments[i];
            nameLower = name.toLowerCase();
            
            self[ nameLower ] = new Function(
'this._events.' + name + '=arguments[0];\
if (arguments[1] !== undefined)\
{this._eventsOwner.'+name+'=arguments[1];}\
else\
{this._eventsOwner.'+name+'=this;}\
return this;');
            self[ name ] = new Function(
'if (typeof this._events.' + name + ' === "function")\
{this._events.' + name + '.apply(this._eventsOwner.'+name+',arguments);}');
        }
    };

    return BaseComponent;
});