var SLICE$0 = Array.prototype.slice;function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v==='object'&&typeof v['iterator']==='function')return Array['from'](v);}throw new Error(v+' is not iterable')};
{
	var test11 = function($D$0) {var a = $D$0.a;var rest = SLICE$0.call(arguments, 1);return [a, rest[0]]}
	console.log(test11({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test12 = function($D$1)  {var a = $D$1.a;var rest = SLICE$0.call(arguments, 1);return [a, rest[0]]}
	console.log(test12({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test13 = function($D$2) {var a = $D$2.a;var rest = SLICE$0.call(arguments, 1);return [a, rest[0]]}
	console.log(test13({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test14 = function($D$3)  {var a = $D$3.a;var rest = SLICE$0.call(arguments, 1);return [a, rest[0]]}
	console.log(test14({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test15 = function($D$4)
	{var a = $D$4.a;var rest = SLICE$0.call(arguments, 1);return [a, rest[0]]}
	console.log(test15({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test16 = function($D$5)  {var a = $D$5.a;var rest = SLICE$0.call(arguments, 1);return [
		a, rest[0]
	]}
	console.log(test16({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test17 = function($D$6)  //some comments 1
	{var a = $D$6.a;var rest = SLICE$0.call(arguments, 1);return [a, rest[0]]}
	/*some comments 2*/
	console.log(test17({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))
}

{
	var test21 = function($D$7) {var a = $D$7.a;var rest = SLICE$0.call(arguments, 1);return (1, [a, rest[0]])}
	console.log(test21({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test22 = function($D$8)  {var a = $D$8.a;var rest = SLICE$0.call(arguments, 1);return (2, [a, rest[0]])}
	console.log(test22({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

	var test23 = function($D$9) {var a = $D$9.a;var rest = SLICE$0.call(arguments, 1);return 3+a+rest[0]+rest[1]},a3 = (b3 = [3, 4])[0], b3 = b3[1]
	console.log(test23({a: 1}, 2, 3, 4) === 9, a3 === 3, b3 === 4)

	var test24 = function($D$10)  {var a = $D$10.a;var rest = SLICE$0.call(arguments, 1);return 4},a4 = (b4 = [3, 4])[0], b4 = b4[1]
	console.log(test24({a: 1}, 2, 3, 4) === 4, a4 === 3, b4 === 4)

	var test25 = function($D$11)  {var a = $D$11.a;var rest = SLICE$0.call(arguments, 1);return 4},a5 = (b5 = [3, 4])[0], b5 = b5[1]
	console.log(test25({a: 1}, 2, 3, 4) === 4, a5 === 3, b5 === 4)

	var test26 = function($D$12)
	{var a = $D$12.a;var rest = SLICE$0.call(arguments, 1);return 4},a6 = (b6 = [3, 4])[0], b6 = b6[1]
	console.log(test26({a: 1}, 2, 3, 4) === 4, a6 === 3, b6 === 4)

	var test27 = function($D$13)  //some comments 1
		{var a = $D$13.a;var rest = SLICE$0.call(arguments, 1);return 4}
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
		test: function($D$14) {var a = $D$14.a;var rest = SLICE$0.call(arguments, 1);
			var test = function($D$15)  {var a = $D$15[0], b = $D$15[1], c = $D$15[2], d = $D$15[3];return a + b +
				c + d}
			return a + test([].concat(ITER$0(rest), 5));//1 + 14
		}
	}
	console.log(obj.test.apply(obj, [{a: 1}].concat([2, 3, 4])) === 15)
}

// TODO::
//{
//      let obj = {
//              test: ({a}, ...rest) => {
//                      return (
//                              a + (([a, b, c, d]) => a + b +
//                                      c
//                              )([...rest, 5])
//                      )
//              }
//      }
//      console.log(obj.test({a: 1}, [2, 3, 4]))
//}

// TODO::
//{
//      let obj = {
//              test: ({a}, ...rest) => {
//                      return a + (([a, b, c, d]) => a + b +
//                                      c
//                              )([...rest, 5])
//              }
//      }
//      console.log(obj.test({a: 1}, [2, 3, 4]))
//}

