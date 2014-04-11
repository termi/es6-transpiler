var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};
var A = (function(){"use strict";function A() {}Object.defineProperties(A.prototype, {a: {"get": a$get$0, "set": a$set$0, "configurable": true, "enumerable": true}});DP$0(A, "prototype", {"configurable": false, "enumerable": false, "writable": false});
	function a$get$0() {
		return this._a;
	}

	function a$set$0(val) {
		this._a = val + 3;
	}
;return A;})();;

var B = (function(super$0){"use strict";function B() {super$0.apply(this, arguments)}MIXIN$0(B, super$0);B.prototype = Object.create(super$0.prototype, {"constructor": {"value": B, "configurable": true, "writable": true}, b: {"get": b$get$0, "set": b$set$0, "configurable": true, "enumerable": true}, 'c': {"get": c$get$0, "set": c$set$0, "configurable": true, "enumerable": true} });DP$0(B, "prototype", {"configurable": false, "enumerable": false, "writable": false});
	function b$get$0() {
		return this._b;
	}

	B.prototype.m = function(){ return "m" }

	function b$set$0(val) {
		this._b = val + 2;
	}

	function c$get$0(){ return this._c }
	function c$set$0(val){ this._c = val + 1 }

	function static_d$get$0(){ return this._d };Object.defineProperties(B, {d: {"get": static_d$get$0, "set": static_d$set$0, "configurable": true, "enumerable": true}});
	function static_d$set$0(val){ this._d = val + 999 }
;return B;})(A);;

var C = (function(super$0){"use strict";function C() {super$0.apply(this, arguments)}MIXIN$0(C, super$0);C.prototype = Object.create(super$0.prototype, {"constructor": {"value": C, "configurable": true, "writable": true}, 'e': {"get": e$get$0, "set": e$set$0, "configurable": true, "enumerable": true}, f: {"get": f$get$0, "configurable": true, "enumerable": true}, g: {"set": g$set$0, "configurable": true, "enumerable": true} });DP$0(C, "prototype", {"configurable": false, "enumerable": false, "writable": false});
	function e$set$0(val){ this._e = val * 3 }
	function e$get$0(){ return this._e }

	function f$get$0(){ return 'f' }

	function g$set$0(){var val = arguments[0];if(val === void 0)val = 'g'; return this._g = val }

	C.m = function(){ return "m" }
;return C;})(B);;

// TODO::
//let prop = 'h' + Math.random();
//class E extens C {
//	get [prop](){ return this["_" + prop] }
//	set [prop](val){ this["_" + prop] = val * 2 }
//}

var test = new C;
test.a = 996;
test.b = 97;
test['c'] = 8;
test['e'] = 1;
test.g = void 0;
//test[prop] = 2;
C.d = 0;
console.log(test.a == 999, test.b == 99, test.m() == "m", test['c'] == 9, test['e'] == 3, test.g == void 0, test._g == 'g', test.f == 'f'/*, test[prop] == 4*/, C.d === 999, C.m() == "m");
