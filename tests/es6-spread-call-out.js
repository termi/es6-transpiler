function test() {function ITER$0(v){if(v){if(Array.isArray(v))return v;if(typeof v==='object'&&typeof v['iterator']==='function')return Array['from'](v);}throw new Error(v+' is not iterable')};var $D$0;


	function test() {var a = arguments[0];if(a === void 0)a = 0;var b = arguments[1];if(b === void 0)b = 0;var c = arguments[2];if(c === void 0)c = 0;var d = arguments[3];if(d === void 0)d = "";
		return (this && this.TEST ? "THIS|" : "") + a + "|" + b + "|" + c + d;
	}

	var arr = [6].concat([3]);

	{
		var T = test.apply(null, [8, 6, 4].concat([]));
		console.log( T === "8|6|4" )
	}

	{
		var arr$0 = [66].concat([33]);
		var T$0 = test.apply(null, ITER$0(arr$0));
		console.log( T$0 === "66|33|0" )
	}

	{
		var T$1 = test.apply(null, [9].concat(ITER$0(arr)));
		console.log( T$1 === "9|6|3" )
	}

	{
		var obj = {
			test: test
			, TEST: true
		};
		var T$2 = obj.test.apply(obj, [18].concat(ITER$0(arr)));
		console.log( T$2 === "THIS|18|6|3" )
		console.log( obj.test.apply(obj, [19].concat(ITER$0(arr))) === "THIS|19|6|3" )
	}

	{
		var obj$0 = {
			obj: {
				test: test
				, TEST: true
			}
		};
		var T$3 = ($D$0 = obj$0.obj).test.apply($D$0, [27].concat(ITER$0(arr)));
		console.log( T$3 === "THIS|27|6|3" )
		console.log( ($D$0 = obj$0.obj).test.apply($D$0, [28].concat(ITER$0(arr))) === "THIS|28|6|3" )
	}

	{
		var T$4 = test.apply(null, ITER$0([].concat(ITER$0((function(){ var a = 0; {var b = 1; a+=b;} {var b$0 = 2; a+=b$0;} return [a] })()), ITER$0(arr))));
		console.log( T$4 === "3|6|3" )
	}

}

test();
