"use strict";

function test1(a, b = {c: 1}, {c} = b) {
	console.log(a === 1, typeof b === "object" && b.c === 1, c === 1);
}
test1(1);

function test2(a, {b: {c}} = {b: {c: 321}}) {
	console.log(a === 1, c === 321);
}
test2(1);

function test3({a: [ {b: [ {c, d} ]} ]} = {a: [ {b: [ {c: 999, d: 888} ]} ]}) {
	console.log(c === 999, d === 888);

	{
		let c = [{test: "test1"}, {test: "test2"}];
		c.forEach(function inner({test}, index, thisArray) {
			console.log(test === "test" + (index + 1), Array.isArray(c) && c === thisArray, d === 888);
		})
	}
}
test3();

function test4(a = 1, b = {c: 333}, {c: d} = b, ...rest) {
	console.log(a === 1, typeof b === "object" && b.c === 333, d === b.c, rest.join("|") === "9|8|7|6|5|4");
}
test4(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);
