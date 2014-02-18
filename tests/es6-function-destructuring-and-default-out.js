"use strict";

function test1(a) {var b = arguments[1];if(b === void 0)b = {c: 1};var c = (arguments[2] !== void 0 ? arguments[2] : b).c;
	console.log(a === 1, typeof b === "object" && b.c === 1, c === 1);
}
test1(1);

function test2(a) {var c = (arguments[1] !== void 0 ? arguments[1] : {b: {c: 321}}).b.c;
	console.log(a === 1, c === 321);
}
test2(1);

function test3() {var c = (d = (arguments[0] !== void 0 ? arguments[0] : {a: [ {b: [ {c: 999, d: 888} ]} ]}).a[0].b[0]).c, d = d.d;
	console.log(c === 999, d === 888);

	{
		var c$0 = [{test: "test1"}, {test: "test2"}];
        c$0.forEach(function inner(test, index, thisArray) {var test = test.test;
			console.log(test === "test" + (index + 1), Array.isArray(c$0) && c$0 === thisArray, d === 888);
		})
	}
}
test3();

function test4() {var SLICE$0 = Array.prototype.slice;var a = arguments[0];if(a === void 0)a = 1;var b = arguments[1];if(b === void 0)b = {c: 333};var d = (arguments[2] !== void 0 ? arguments[2] : b).c;var rest = SLICE$0.call(arguments, 3);
	console.log(a === 1, typeof b === "object" && b.c === 333, d === b.c, rest.join("|") === "9|8|7|6|5|4");
}
test4(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);

function test5() {var a = arguments[0];if(a === void 0)a = 1;var b = arguments[1];if(b === void 0)b = {c: 333};var test = (arguments[2] !== void 0 ? arguments[2] : (  function(A)     {function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof v['@@iterator']==='function'){i=v['@@iterator'](),r=[];while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};var A = A.A;return (A = [].concat(ITER$0(A, true), ITER$0(A)) , {test: A} )})({A: [1, 2, 3]})).test;
	console.log(a === 1, typeof b === "object" && b.c === 333, test.join("|") === [1,2,3,1,2,3].join("|"));
}
test5(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);

