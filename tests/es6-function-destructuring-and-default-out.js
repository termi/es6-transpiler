"use strict";

function test1(a) {var b = arguments[1];if(b === void 0)b = {c: 1};var c = (arguments[2] !== void 0 ? arguments[2] : b).c;
	console.log(a === 1, typeof b === "object" && b.c === 1, c === 1);
}
test1(1);

function test2(a) {var c = (arguments[1] !== void 0 ? arguments[1] : {b: {c: 321}}).b.c;
	console.log(a === 1, c === 321);
}
test2(1);

function test3() {var $D$0 = (arguments[0] !== void 0 ? arguments[0] : {a: [ {b: [ {c: 999, d: 888} ]} ]}).a[0].b[0], c = $D$0.c, d = $D$0.d;
	console.log(c === 999, d === 888);

	{
		var c$0 = [{test: "test1"}, {test: "test2"}];
		c$0.forEach(function inner($D$1, index, thisArray) {var test = $D$1.test;
			console.log(test === "test" + (index + 1), Array.isArray(c$0) && c$0 === thisArray, d === 888);
		})
	}
}
test3();

function test4() {var a = arguments[0];if(a === void 0)a = 1;var b = arguments[1];if(b === void 0)b = {c: 333};var d = (arguments[2] !== void 0 ? arguments[2] : b).c;var rest = [].slice.call(arguments, 3);
	console.log(a === 1, typeof b === "object" && b.c === 333, d === b.c, rest.join("|") === "9|8|7|6|5|4");
}
test4(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);
