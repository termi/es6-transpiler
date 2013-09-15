function test() {

	function test(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	function test1(_arr) {var SLICE$0 = Array.prototype.slice;var rest = SLICE$0.call(arguments, 1);function ITER$0(v){if(v){if(Array.isArray(v))return v;if(typeof v==='object'&&typeof v['iterator']==='function')return Array['from'](v);}throw new Error(v+' is not iterable')};var BIND$0 = Function.prototype.bind;

		var arr = [6].concat([].concat(ITER$0(_arr)), ITER$0(rest));

		console.log(arr.join("|") === "6|3|34|35|36|37")

		{
			var T = new (BIND$0.apply(test, [null].concat(ITER$0(arr))))();
			console.log( T.a === 6, T.b === 3 )
		}

		{
			var arr$0 = void 0;
			var T$0 = new (BIND$0.apply(test, [null].concat(ITER$0(arr$0 || [1, 2]))))();
			console.log( T$0.a === 1, T$0.b === 2 )
		}

		{
			var T$1 = new (BIND$0.apply(test, [null, 9].concat(ITER$0(arr))))();
			console.log( T$1.a === 9, T$1.b === 6, T$1.c === 3 )
		}

		{
			var obj = {
				test: test
			};
			var T$2 = new (BIND$0.apply(obj.test, [null, 18].concat(ITER$0(arr))))();
			console.log( T$2.a === 18, T$2.b === 6, T$2.c === 3 )
		}

		{
			var obj$0 = {
				obj: {
					test: test
				}
			};
			var T$3 = new (BIND$0.apply(obj$0.obj.test, [null, 27].concat(ITER$0(arr))))();
			console.log( T$3.a === 27, T$3.b === 6, T$3.c === 3 )
		}

		{
			var T$4 = new (BIND$0.apply(test, [null].concat([].concat(ITER$0((function(){ var a = 0; {var b = 1; a+=b;} {var b$0 = 2; a+=b$0;} return [a] })()), ITER$0(arr)))))();
			console.log( T$4.a === 3, T$4.b === 6, T$4.c === 3 )
		}

	}
	test1([3], 34, 35, 36, 37);

}
test()