
var A = (function(){function A() {return this}Object.defineProperties(A.prototype, {a: {"get": a$get$0, "set": a$set$0, "configurable": true, "enumerable": true}});
	function a$get$0() {
		return this._a;
	}

	function a$set$0(val) {
		this._a = val + 3;
	}
;return A;})();;

var B = (function(super$0){var ASSIGN$0 = Object['assign']||function(t,s){for(var p in s){if(s.hasOwnProperty(p)){t[p]=s[p];}}return t};function B() {return super$0.apply(this, arguments)}ASSIGN$0(B, super$0);B.prototype = Object.create(super$0.prototype, {"constructor": {"value": B, "configurable": true, "writable": true}, b: {"get": b$get$0, "set": b$set$0, "configurable": true, "enumerable": true}, 'c': {"get": c$get$0, "set": c$set$0, "configurable": true, "enumerable": true} });
	function b$get$0() {
		return this._b;
	}

	B.prototype.m = function(){ }

	function b$set$0(val) {
		this._b = val + 2;
	}

	function c$get$0(){ return this._c }
	function c$set$0(val){ this._c = val + 1 }
;return B;})(A);;

var test = new B;
test.a = 996;
test.b = 97;
test.c = 8;
console.log(test.a == 999, test.b == 99, test['c'] == 9)
