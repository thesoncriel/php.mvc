;define("service", ["jquery", "knockout"], function($, ko){
	var m = {}
	;

	return function(name){
		var fullName,
			Service
		;

		if (m.hasOwnProperty(name) === false){
			fullName = "service." + name;
			Service = require(fullName);
			m[ name ] = Service;

			return Service;
		}

		return m[ name ];
	};
});

define("viewmodel", ["jquery", "knockout"], function($, ko){
	var m = {}, fn;

	fn = function(name){
		var fullName,
			ViewModel,
			vm
		;

		if (m.hasOwnProperty(name) === false){
			fullName = "viewmodel." + name;
			ViewModel = require(fullName);
			vm = new ViewModel();

			m[ name ] = vm;

			return vm;
		}

		return m[ name ];
	};

	fn.apply = function(){
		var mVm = m, name;

		for (name in mVm){
			mVm[ name ].apply();
		}
	};

	fn.destroy = function(){
		var mVm = m, name;

		for (name in mVm){
			mVm[ name ].destroy();
		}
	};

	// $( window ).unload( function() {
 //        fn.destroy();
 //    });

	return fn;
});