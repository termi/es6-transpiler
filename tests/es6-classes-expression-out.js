var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};
var secret = Object.create(null);

var A = (function(){"use strict";function A() {}DP$0(A, "prototype", {"configurable": false, "enumerable": false, "writable": false});
	A.prototype.m1 = function() {
		return secret;
	}
;return A;})();

{// anon class
	var v = new ((function(super$0){"use strict";function constructor$0() {super$0.apply(this, arguments)}MIXIN$0(constructor$0, super$0);constructor$0.prototype = Object.create(super$0.prototype, {"constructor": {"value": constructor$0, "configurable": true, "writable": true} });DP$0(constructor$0, "prototype", {"configurable": false, "enumerable": false, "writable": false});
		constructor$0.sMethod = function() {
			// can't call this method
		}
	;return constructor$0;})(A));

	console.log(v.m1() === secret);
}

{// anon class2
	var secret2 = Object.create(null);

	var Class = (((function(super$0){"use strict";function constructor$1() {super$0.apply(this, arguments)}MIXIN$0(constructor$1, super$0);constructor$1.prototype = Object.create(super$0.prototype, {"constructor": {"value": constructor$1, "configurable": true, "writable": true} });DP$0(constructor$1, "prototype", {"configurable": false, "enumerable": false, "writable": false});
		constructor$1.sMethod = function() {
			return secret2;
		}
	;return constructor$1;})(A)));
	var v$0 = new Class;

	console.log(v$0.m1() === secret, Class.sMethod() === secret2);
}

{// named class
	var secret2$0 = Object.create(null);

	var v$1 = new ((function(super$0){"use strict";function B() {super$0.apply(this, arguments)}MIXIN$0(B, super$0);B.prototype = Object.create(super$0.prototype, {"constructor": {"value": B, "configurable": true, "writable": true} });DP$0(B, "prototype", {"configurable": false, "enumerable": false, "writable": false});
		B.sMethod = function() {
			return secret2$0;
		}
		B.prototype.test = function() {
			return B.sMethod();
		}
	;return B;})(A));

	console.log(v$1.m1() === secret, v$1.test() === secret2$0);
}


{// named class 2
	var secret2$1 = Object.create(null);

	var Class$0 = (((function(super$0){"use strict";function B() {super$0.apply(this, arguments)}MIXIN$0(B, super$0);B.prototype = Object.create(super$0.prototype, {"constructor": {"value": B, "configurable": true, "writable": true} });DP$0(B, "prototype", {"configurable": false, "enumerable": false, "writable": false});
		B.sMethod = function() {
			return secret2$1;
		}
		B.prototype.test = function() {
			return B.sMethod();
		}
	;return B;})(A)));
	var v$2 = new Class$0;

	console.log(v$2.m1() === secret, Class$0.sMethod() === secret2$1, v$2.test() === secret2$1);
}
