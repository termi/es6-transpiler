function test1(obj) {
	var a = obj.someValue;if(a === void 0)a = "defaultValue";var b = obj.b;
	if( obj.someValue === void 0 ) {
		console.log(a === "defaultValue", b === obj.b);
	}
	else {
		console.log(a === obj.someValue, b === obj.b);
	}
}

test1({b: "bValue"});
test1({someValue: 999, b: "bValue"});

(function($D$0) {var a = $D$0["a"];if(a === void 0)a = 123;var b = $D$0.b;if(b === void 0)b = 321;
	console.log(a === 123, b === 321);
})({});

function test2(auto) {var $D$1 = (arguments[1] !== void 0 ? arguments[1] : {a: {test: 1, q: 2}}).a, c = $D$1.test;if(c === void 0)c = "test";var q = $D$1.q;if(q === void 0)q = "default";var a = ($D$1 = (arguments[2] !== void 0 ? arguments[2] : ["9", null, void 0, "6", "5", "4"]))[0];if(a === void 0)a = 1;var b = $D$1[2];if(b === void 0)b = 2;var rest = [].slice.call($D$1, 3);var def = arguments[3];if(def === void 0)def = "def";
	if( auto ) {
		console.log(c === 1, q === 2, a === "9", b === 2, rest.join("|") === "6|5|4", def === "def")
	}
	else {
		console.log(c === "cValue", q === "default", a === 1, b === 3, rest.join("|") === "4|5|6", def === "def")
	}
}
test2(false, {a:{test: "cValue", q: void 0}}, [void 0, 2, 3, 4, 5, 6]);
test2(true);
