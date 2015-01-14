var ARRAY$0 = Array;var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol.iterator||'@@iterator';var S_MARK$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol["__setObjectSetter__"];function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(S_MARK$0)S_MARK$0(v);if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){i=f.call(v);r=[];}else if((v+'')==='[object Generator]'){i=v;r=[];};if(S_MARK$0)S_MARK$0(void 0);if(r) {while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};
{
	var test11 = function(a) {var a = a.a;for (var l$0 = arguments.length, rest = ARRAY$0(l$0 > 1 ? l$0 - 1 : 0),  i$0 = 1; i$0 < l$0; i$0++) rest[i$0 - 1] = arguments[i$0];return [a, rest[0]]} 
	console.log(test11({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test12 = function(a)  {var a = a.a;for (var l$1 = arguments.length, rest = ARRAY$0(l$1 > 1 ? l$1 - 1 : 0),  i$1 = 1; i$1 < l$1; i$1++) rest[i$1 - 1] = arguments[i$1];return [a, rest[0]]} 
	console.log(test12({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test13 = function(a) {var a = a.a;for (var l$2 = arguments.length, rest = ARRAY$0(l$2 > 1 ? l$2 - 1 : 0),  i$2 = 1; i$2 < l$2; i$2++) rest[i$2 - 1] = arguments[i$2];return [a, rest[0]]}
	console.log(test13({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test14 = function(a)  {var a = a.a;for (var l$3 = arguments.length, rest = ARRAY$0(l$3 > 1 ? l$3 - 1 : 0),  i$3 = 1; i$3 < l$3; i$3++) rest[i$3 - 1] = arguments[i$3];return [a, rest[0]]}
	console.log(test14({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test15 = function(a) 
		{var a = a.a;for (var l$4 = arguments.length, rest = ARRAY$0(l$4 > 1 ? l$4 - 1 : 0),  i$4 = 1; i$4 < l$4; i$4++) rest[i$4 - 1] = arguments[i$4];return [a, rest[0]]}
	console.log(test15({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test16 = function(a)  {var a = a.a;for (var l$5 = arguments.length, rest = ARRAY$0(l$5 > 1 ? l$5 - 1 : 0),  i$5 = 1; i$5 < l$5; i$5++) rest[i$5 - 1] = arguments[i$5];return [
		a, rest[0]
	]}
	console.log(test16({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test17 = function(a)  //some comments 1
		{var a = a.a;for (var l$6 = arguments.length, rest = ARRAY$0(l$6 > 1 ? l$6 - 1 : 0),  i$6 = 1; i$6 < l$6; i$6++) rest[i$6 - 1] = arguments[i$6];return [a, rest[0]]}
	/*some comments 2*/ 
	console.log(test17({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))
}

{
	var test21 = function(a) {var a = a.a;for (var l$7 = arguments.length, rest = ARRAY$0(l$7 > 1 ? l$7 - 1 : 0),  i$7 = 1; i$7 < l$7; i$7++) rest[i$7 - 1] = arguments[i$7];return (1, [a, rest[0]])}
	console.log(test21({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test22 = function(a)  {var a = a.a;for (var l$8 = arguments.length, rest = ARRAY$0(l$8 > 1 ? l$8 - 1 : 0),  i$8 = 1; i$8 < l$8; i$8++) rest[i$8 - 1] = arguments[i$8];return (2, [a, rest[0]])}
	console.log(test22({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test23 = function(a) {var a = a.a;for (var l$9 = arguments.length, rest = ARRAY$0(l$9 > 1 ? l$9 - 1 : 0),  i$9 = 1; i$9 < l$9; i$9++) rest[i$9 - 1] = arguments[i$9];return 3+a+rest[0]+rest[1]},a3 = (b3 = [3, 4])[0], b3 = b3[1]
	console.log(test23({a: 1}, 2, 3, 4) === 9, a3 === 3, b3 === 4)

	var test24 = function(a)  {var a = a.a;for (var l$10 = arguments.length, rest = ARRAY$0(l$10 > 1 ? l$10 - 1 : 0),  i$10 = 1; i$10 < l$10; i$10++) rest[i$10 - 1] = arguments[i$10];return 4},a4 = (b4 = [3, 4])[0], b4 = b4[1]
	console.log(test24({a: 1}, 2, 3, 4) === 4, a4 === 3, b4 === 4)

	var test25 = function(a)  {var a = a.a;for (var l$11 = arguments.length, rest = ARRAY$0(l$11 > 1 ? l$11 - 1 : 0),  i$11 = 1; i$11 < l$11; i$11++) rest[i$11 - 1] = arguments[i$11];return 4},a5 = (b5 = [3, 4])[0], b5 = b5[1]
	console.log(test25({a: 1}, 2, 3, 4) === 4, a5 === 3, b5 === 4)

	var test26 = function(a) 
		{var a = a.a;for (var l$12 = arguments.length, rest = ARRAY$0(l$12 > 1 ? l$12 - 1 : 0),  i$12 = 1; i$12 < l$12; i$12++) rest[i$12 - 1] = arguments[i$12];return 4},a6 = (b6 = [3, 4])[0], b6 = b6[1]
	console.log(test26({a: 1}, 2, 3, 4) === 4, a6 === 3, b6 === 4)

	var test27 = function(a)  //some comments 1
		{var a = a.a;for (var l$13 = arguments.length, rest = ARRAY$0(l$13 > 1 ? l$13 - 1 : 0),  i$13 = 1; i$13 < l$13; i$13++) rest[i$13 - 1] = arguments[i$13];return 4}
	/*some comments 2*/ ,a7 = (b7 = [3, 4])[0], b7 = b7[1]
	console.log(test27({a: 1}, 2, 3, 4) === 4, a7 === 3, b7 === 4)
}

{
	var test31 = function() {return [1, 2]} 
	console.log(test31().join("|") === [1, 2].join("|"))

	var test32 = function()  {return [1, 2]} 
	console.log(test32().join("|") === [1, 2].join("|"))

	var test33 = function() {return [1, 2]}
	console.log(test33().join("|") === [1, 2].join("|"))

	var test34 = function()  {return [1, 2]}
	console.log(test34().join("|") === [1, 2].join("|"))

	var test35 = function() 
		{return [1, 2]}
	console.log(test35().join("|") === [1, 2].join("|"))

	var test36 = function()  //some comments 1
		{return [1, 2]}
	/*some comments 2*/ 
	console.log(test36().join("|") === [1, 2].join("|"))

	var test37 = function()  //some comments 1
		{return [1, 2]}
	/*some comments 2*/ ,a7$0 = (b7$0 = [3, 4])[0], b7$0 = b7$0[1]
	console.log(test37().join("|") === [1, 2].join("|"), a7$0 === 3, b7$0 === 4)

	var test38 = /*com1*/function(/*com2*/)/*com3*//*com4*///some comments 5
		/*com6*/{return [1, 2]}//com7
	/*some comments 8*/ ,a8 = (b8 = [3, 4])[0], b8 = b8[1]
	console.log(test38().join("|") === [1, 2].join("|"), a8 === 3, b8 === 4)
}

{
	var obj = {
		test: function(a) {var a = a.a;for (var l$14 = arguments.length, rest = ARRAY$0(l$14 > 1 ? l$14 - 1 : 0),  i$14 = 1; i$14 < l$14; i$14++) rest[i$14 - 1] = arguments[i$14];
			var test = function(d)  {var a = d[0], b = d[1], c = d[2], d = d[3];return a + b +
				c + d}
			return a + test([ ].concat(ITER$0(rest), [5]));//1 + 14
		}
	}
	console.log(obj.test.apply(obj, [{a: 1}, 2, 3, 4]) === 15)
}

{
	var obj$0 = {
		test: function(a)  {var a = a.a;for (var l$15 = arguments.length, rest = ARRAY$0(l$15 > 1 ? l$15 - 1 : 0),  i$15 = 1; i$15 < l$15; i$15++) rest[i$15 - 1] = arguments[i$15];
			return (
				[a].concat(ITER$0((function(d)  {var a = d[0], b = d[1], c = d[2], d = d[3];return [a, b,
					c]}
				)([ ].concat(ITER$0(rest), [5]))))
			)
		}
	}
	console.log(obj$0.test({a: 1}, 2, 3, 4).join("|") === [1, 2, 3, 4].join("|"))
}

{
	var obj$1 = {
		test: function(a)  {var a = a.a;for (var l$16 = arguments.length, rest = ARRAY$0(l$16 > 1 ? l$16 - 1 : 0),  i$16 = 1; i$16 < l$16; i$16++) rest[i$16 - 1] = arguments[i$16];
			return [a].concat(ITER$0((function(d)  {var a = d[0], b = d[1], c = d[2], d = d[3];return [a, b,
					c]}
				)([ ].concat(ITER$0(rest), [5]))))
		}
	}
	console.log(obj$1.test({a: 1}, 2, 3, 4).join("|") === [1, 2, 3, 4].join("|"))
}
