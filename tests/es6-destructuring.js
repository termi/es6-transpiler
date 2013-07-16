"use strict";

function test1({opt1: opt1, opt2}) {
	{
		let {a: opt1, b: opt2} = {a: 1, b: 2};
		console.log(opt1, opt2);
		{
			let {"opt1": opt1, opt2} = {opt1: 1, opt2: 2};
		}
	}
	console.log(opt1, opt2);
}
test1({opt1: 1, opt2: 2});

function test2(obj) {
	let {a, b: bVar} = obj;
	console.log(a, bVar);
}
test2({a: 1, b: 2});

function test3(array) {
	let a = 1, b, b$0;
	{
		let [a, , b, c] = array;
		console.log(a, b, c);
	}
	console.log(a, b, b$0);
}
test3([1,null,2,3]);

function test4(array) {
	var [a, , b, , c] = array;
	console.log(a, b, c);
}
test4([1, null, 2, null ,3]);

function test5() {
	var obj = { obj: {a: 1, b: 2, cObj: {test: 3}}, test: "test" };
	var {obj: {a, b, cObj: c}, test: testStr} = obj;

	console.log(a, b, c.test, testStr);
}
test5();
