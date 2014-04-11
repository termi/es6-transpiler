var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};
function inStrictMode() {
	"use strict";

	var A = (function(){function A() {}DP$0(A, "prototype", {"configurable": false, "enumerable": false, "writable": false});//class body should be in strict mode, but in this case in already in strict mode

		A.prototype.test = function(a) {
			arguments[0] = a + 1;
			return [a, arguments[0]];
		}
	;return A;})();

	var B = (function(super$0){function B() {super$0.apply(this, arguments)}MIXIN$0(B, super$0);B.prototype = Object.create(super$0.prototype, {"constructor": {"value": B, "configurable": true, "writable": true} });DP$0(B, "prototype", {"configurable": false, "enumerable": false, "writable": false});//class body should be in strict mode, but in this case in already in strict mode

		B.prototype.test = function(a) {
			arguments[0] = a + 1;
			return [a, arguments[0]];
		}
	;return B;})(A);

	function simpleFunc(a) {// this function is in strict mode
		arguments[0] = a + 1;
		return [a, arguments[0]];
	}

	var a = new A
		, resA = a.test(9)
	;
	var b = new B
		, resB = b.test(8)
	;
	var funcRes = simpleFunc(7);

	console.log(resA[0] != resA[1], resB[0] != resB[1], funcRes[0] != funcRes[1]);
}
inStrictMode();

function notInStrictMode() {

	var A = (function(){"use strict";function A() {}DP$0(A, "prototype", {"configurable": false, "enumerable": false, "writable": false});//class body should be in strict mode

		A.prototype.test = function(a) {
			arguments[0] = a + 1;
			return [a, arguments[0]];
		}
	;return A;})();

	var B = (function(super$0){"use strict";function B() {super$0.apply(this, arguments)}MIXIN$0(B, super$0);B.prototype = Object.create(super$0.prototype, {"constructor": {"value": B, "configurable": true, "writable": true} });DP$0(B, "prototype", {"configurable": false, "enumerable": false, "writable": false});//class body should be in strict mode

		B.prototype.test = function(a) {
			arguments[0] = a + 1;
			return [a, arguments[0]];
		}
	;return B;})(A);

	function simpleFunc(a) {// this function not! in strict mode
		arguments[0] = a + 1;
		return [a, arguments[0]];
	}

	var a = new A
		, resA = a.test(9)
	;
	var b = new B
		, resB = b.test(8)
	;
	var funcRes = simpleFunc(7);

	console.log(resA[0] != resA[1], resB[0] != resB[1], funcRes[0] === funcRes[1]);
}
notInStrictMode();