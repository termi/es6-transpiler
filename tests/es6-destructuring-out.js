"use strict";

function test1() {
	var $D$0 = arguments[0];
	var opt1 = $D$0.opt1, opt2 = $D$0.opt2;
	$D$0 = null;
	{
		var $D$1 = {a: 1, b: 2}, opt1$0 = $D$1.a, opt2$0 = $D$1.b;$D$1 = null;
		console.log(opt1$0, opt2$0);
		{
			var $D$2 = {opt1: 1, opt2: 2}, opt1$1 = $D$2["opt1"], opt2$1 = $D$2.opt2;$D$2 = null;
		}
	}
	console.log(opt1, opt2);
}
test1({opt1: 1, opt2: 2});

function test2(obj) {
	var a = obj.a, bVar = obj.b;
	console.log(a, bVar);
}
test2({a: 1, b: 2});

function test3(array) {
	var a = 1, b, b$0;
	{
		var a$0 = array[0], b$1 = array[2], c = array[3];
		console.log(a$0, b$1, c);
	}
	console.log(a, b, b$0);
}
test3([1,null,2,3]);

function test4(array) {
	var a = array[0], b = array[2], c = array[4];
	console.log(a, b, c);
}
test4([1, null, 2, null ,3]);

function test5() {
	var obj = { obj: {a: 1, b: 2, cObj: {test: 3}}, test: "test" };
	var $D$3 = obj.obj, a = $D$3.a, b = $D$3.b, c = $D$3.cObj, testStr = obj.test;$D$3 = null;

	console.log(a, b, c.test, testStr);
}
test5();
