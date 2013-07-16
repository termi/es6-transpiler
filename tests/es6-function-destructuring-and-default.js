"use strict";

function test1(a, b = {c: 1}, {c} = b) {
	console.log(a, b, c);
}
test1(1);

function test2(a, {b: {c}} = {b: {c: 321}}) {
	console.log(a, c);
}
test2(1);

function test3({a: [ {b: [ {c, d} ]} ]} = {a: [ {b: [ {c: 999, d: 888} ]} ]}) {
	console.log(c);

	{
		let c = [{test: "test1"}, {test: "test2"}];
		c.forEach(function inner({test}) {
			console.log(test, c, d);
		})
	}
}
test3();

function test4(a = 1, b = {c: 333}, {c: d} = b, ...rest) {
	console.log(a, b, d, rest);
}
test4(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);
