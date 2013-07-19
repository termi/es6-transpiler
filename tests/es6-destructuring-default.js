function test1(obj) {
	const {someValue: a = "defaultValue", b} = obj;
	if( obj.someValue === void 0 ) {
		console.log(a === "defaultValue", b === obj.b);
	}
	else {
		console.log(a === obj.a, b === obj.b);
	}
}

test1({b: "bValue"});
test1({someValue: 999, b: "bValue"});

(function({"a": a = 123, b = 321}) {
	console.log(a === 123, b === 321);
})();

function test2({a:{ test: c = "test", q = "default" }}/*, [a = 1, , b = 2, ...rest]*/) {
	console.log(c === "cValue", q === "default"/*, a === 1, b === 3, rest.join("|") === "4|5|6"*/)
}
test2({a:{test: "cValue", q: void 0}}, [void 0, 2, 3, 4, 5, 6]);
