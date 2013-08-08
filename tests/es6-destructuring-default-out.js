function test1(obj) {var $D$4;
	var a = (($D$4 = obj.someValue) === void 0 ? "defaultValue" : $D$4), b = obj.b;
	if( obj.someValue === void 0 ) {
		console.log(a === "defaultValue", b === obj.b);
	}
	else {
		console.log(a === obj.someValue, b === obj.b);
	}
}

test1({b: "bValue"});
test1({someValue: 999, b: "bValue"});

(function($D$0) {var $D$1;var a = (($D$1 = $D$0["a"]) === void 0 ? 123 : $D$1), b = (($D$1 = $D$0.b) === void 0 ? 321 : $D$1);
	console.log(a === 123, b === 321);
})({});

function test2(auto) {var $D$3;var $D$2;var c = (($D$3 = ($D$2 = (arguments[1] !== void 0 ? arguments[1] : {a: {test: 1, q: 2}}).a).test) === void 0 ? "test" : $D$3), q = (($D$3 = $D$2.q) === void 0 ? "default" : $D$3);var a = (($D$3 = ($D$2 = (arguments[2] !== void 0 ? arguments[2] : ["9", null, void 0, "6", "5", "4"]))[0]) === void 0 ? 1 : $D$3), b = (($D$3 = $D$2[2]) === void 0 ? 2 : $D$3), rest = [].slice.call($D$2, 3);var def = arguments[3];if(def === void 0)def = "def";
	if( auto ) {
		console.log(c === 1, q === 2, a === "9", b === 2, rest.join("|") === "6|5|4", def === "def")
	}
	else {
		console.log(c === "cValue", q === "default", a === 1, b === 3, rest.join("|") === "4|5|6", def === "def")
	}
}
test2(false, {a:{test: "cValue", q: void 0}}, [void 0, 2, 3, 4, 5, 6]);
test2(true);
