function test1(obj) {
	var a = obj.someValue;if(a === void 0)a = "defaultValue";var b = obj.b;
	if( obj.someValue === void 0 ) {
		console.log(a === "defaultValue", b === obj.b);
	}
	else {
		console.log(a === obj.a, b === obj.b);
	}
}

test1({b: "bValue"});
test1({someValue: 999, b: "bValue"});

(function() {
	var $D$0 = arguments[0], a = $D$0["a"];if(a === void 0)a = 123;var b = $D$0.b;if(b === void 0)b = 321;$D$0 = null;
	console.log(a === 123, b === 321);
})();

function test2(/*, [a = 1, , b = 2, ...rest]*/) {
	var $D$1 = arguments[0], $D$2 = $D$1.a, c = $D$2.test;if(c === void 0)c = "test";var q = $D$2.q;if(q === void 0)q = "default";$D$1 = null;$D$2 = null;
	console.log(c === "cValue", q === "default"/*, a === 1, b === 3, rest.join("|") === "4|5|6"*/)
}
test2({a:{test: "cValue", q: void 0}}, [void 0, 2, 3, 4, 5, 6]);
