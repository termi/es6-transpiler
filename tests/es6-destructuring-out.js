"use strict";

function test0() {var y = arguments[0];if(y === void 0)y = 1;
	var $D$3 = {}, a = $D$3.someValue;if(a === void 0)a = "defaultValue";var b = $D$3.b;

	console.log(y === 1, a === "defaultValue", b === void 0);
}
test0();

function test1($D$0) {var opt1 = $D$0.opt1, opt2 = $D$0.opt2;
	{
		var $D$4 = {a: 9, b: 8}, opt1$0 = $D$4.a, opt2$0 = $D$4.b;
		console.log(opt1$0 === 9, opt2$0 === 8);
		{
			var opt1$1 = ($D$4 = {opt1: 7, opt2: 6})["opt1"], opt2$1 = $D$4.opt2;
			console.log(opt1$1 === 7, opt2$1 === 6);
		}
	}
	console.log(opt1 === 1, opt2 === 2);
}
test1({opt1: 1, opt2: 2});

function test2(obj) {
	var a = obj.a, bVar = obj.b;
	console.log(a === 1, bVar === 2);
}
test2({a: 1, b: 2});

function test3(array) {
	var a = 1, b = 2, b$0;
	{
		var a$0 = array[0], b$1 = array[2], c = array[3];
		console.log(a$0 === 9, b$1 === 7, c === 6);
	}
	console.log(a === 1, b === 2, b$0 === void 0);
}
test3([9,null,7,6]);

function test4(array) {
	var a = array[0], b = array[2], c = array[4];
	console.log(a === 1, b === 2, c === 3);
}
test4([1, null, 2, null ,3]);

function test5() {
	var obj = { obj: {a: 1, b: 2, cObj: {test: 3}}, test: "test" };
	var $D$5 = obj.obj, a = $D$5.a, b = $D$5.b, c = $D$5.cObj, testStr = obj.test;

	console.log(a === 1, b === 2, c.test === 3, testStr === "test");
}
test5();

function test6($D$1, $D$2) {var a = $D$1.a, b = $D$1.b;var c = $D$2.c;
	console.log(a === 1, b === 2, c === 3)
}
test6({a: 1, b: 2}, {c: 3});
