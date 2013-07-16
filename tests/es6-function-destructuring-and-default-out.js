"use strict";

function test1(a) {
	var b = arguments[1];if(b === void 0)b = {c: 1};
	var $D$0 = arguments[2] !== void 0 ? arguments[2] : b;
	var c = $D$0.c;
	$D$0 = null;
	console.log(a, b, c);
}
test1(1);

function test2(a) {
	var $D$1 = arguments[1] !== void 0 ? arguments[1] : {b: {c: 321}}, $D$2 = $D$1.b;
	var c = $D$2.c;
	$D$1 = null;$D$2 = null;
	console.log(a, c);
}
test2(1);

function test3() {
	var $D$3 = arguments[0] !== void 0 ? arguments[0] : {a: [ {b: [ {c: 999, d: 888} ]} ]}, $D$4 = $D$3.a, $D$5 = $D$4[0], $D$6 = $D$5.b, $D$7 = $D$6[0];
	var c = $D$7.c, d = $D$7.d;
	$D$3 = null;$D$4 = null;$D$5 = null;$D$6 = null;$D$7 = null;
	console.log(c);

	{
		var c$0 = [{test: "test1"}, {test: "test2"}];
		c$0.forEach(function inner() {
			var $D$8 = arguments[0];
			var test = $D$8.test;
			$D$8 = null;
			console.log(test, c$0, d);
		})
	}
}
test3();

function test4() {
	var a = arguments[0];if(a === void 0)a = 1;
	var b = arguments[1];if(b === void 0)b = {c: 333};
	var $D$9 = arguments[2] !== void 0 ? arguments[2] : b;
	var d = $D$9.c;
	$D$9 = null;
	var rest = [].slice.call(arguments, 3);
	console.log(a, b, d, rest);
}
test4(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);
