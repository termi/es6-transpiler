function test() {var BIND$0 = Function.prototype.bind;

	function test(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	{
		var T = new (BIND$0.apply(test, [null, 11, 22, 33]))();
		console.log( T.a === 11, T.b === 22, T.c === 33 )
	}

	function test1(_arr) {var SLICE$0 = Array.prototype.slice;var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol.iterator||'@@iterator';function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){i=f.call(v);r=[];}else if((v+'')==='[object Generator]'){i=v;r=[];};if(r) {while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};var rest = SLICE$0.call(arguments, 1);

		var arr = [6].concat(ITER$0(_arr), ITER$0(rest));

		console.log(arr.join("|") === "6|3|34|35|36|37")

		{
			var T = new (BIND$0.apply(test, [null].concat(ITER$0(arr))))();
			console.log( T.a === 6, T.b === 3 )
		}

		{
			var arr$0 = void 0;
			var T$0 = new (BIND$0.apply(test, [null].concat(ITER$0((arr$0 || [1, 2])))))();
			console.log( T$0.a === 1, T$0.b === 2 )
		}

		{
			var arr$1 = void 0;
			var T$1 = new (BIND$0.apply(test, [null, 1].concat(ITER$0(( arr$1 || [2, 3 ] )) )))();
			console.log( T$1.a === 1, T$1.b === 2 )
		}

		{
			var T$2 = new (BIND$0.apply(test, [null, 1].concat(ITER$0((0 ? '' : [2, 3] )) )))();
			console.log( T$2.a === 1, T$2.b === 2 )
		}

		{
			var T$3 = new (BIND$0.apply(test, [null, 9].concat(ITER$0(arr))))();
			console.log( T$3.a === 9, T$3.b === 6, T$3.c === 3 )
		}

		{
			var obj = {
				test: test
			};
			var T$4 = new (BIND$0.apply(obj.test, [null, 18].concat(ITER$0(arr))))();
			console.log( T$4.a === 18, T$4.b === 6, T$4.c === 3 )
		}

		{
			var obj$0 = {
				obj: {
					test: test
				}
			};
			var T$5 = new (BIND$0.apply(obj$0.obj.test, [null, 27].concat(ITER$0(arr))))();
			console.log( T$5.a === 27, T$5.b === 6, T$5.c === 3 )
		}

		{
			var T$6 = new (BIND$0.apply(test, [null, ].concat(ITER$0((function(){ var a = 0; {var b = 1; a+=b;} {var b$0 = 2; a+=b$0;} return [a] })()), ITER$0(arr))))();
			console.log( T$6.a === 3, T$6.b === 6, T$6.c === 3 )
		}

		{
			var arr$2 = [1, 2, 3];
			var T$7 = new (BIND$0.apply(test, [null, ].concat(ITER$0(arr$2))))();
			console.log( T$7.a === 1, T$7.b === 2, T$7.c === 3 )
		}

		{
			var arr$3 = [1, 2, 3];
			var T$8 = new (BIND$0.apply(test, [null, ].concat(ITER$0((arr$3)))))();
			console.log( T$8.a === 1, T$8.b === 2, T$8.c === 3 )
		}

		{
			var arr$4 = [1, 2];
			var T$9 = new (BIND$0.apply(test, [null, ].concat(ITER$0(arr$4), ITER$0(arr$4))))();
			console.log( T$9.a === 1, T$9.b === 2, T$9.c === 1 )
		}

		{
			var arr$5 = [1, 2];
			var T$10 = new (BIND$0.apply(test, [null, ].concat(ITER$0((arr$5)), ITER$0((arr$5)))))();
			console.log( T$10.a === 1, T$10.b === 2, T$10.c === 1 )
		}

	}
	test1([3], 34, 35, 36, 37);

}
test()
