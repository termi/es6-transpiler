var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};
var secret = Object.create(null);

var A = (function(){"use strict";function A() {}DP$0(A, "prototype", {"configurable": false, "enumerable": false, "writable": false});var $proto$0={};
	$proto$0.m1 = function() {
		return secret;
	};
MIXIN$0(A.prototype,$proto$0);$proto$0=void 0;return A;})();

{// anon class
	var v = new ((function(super$0){"use strict";function constructor$0() {super$0.apply(this, arguments)}MIXIN$0(constructor$0, super$0);constructor$0.prototype = Object.create(super$0.prototype, {"constructor": {"value": constructor$0, "configurable": true, "writable": true} });DP$0(constructor$0, "prototype", {"configurable": false, "enumerable": false, "writable": false});var $static$0={};
		$static$0.sMethod = function() {
			// can't call this method
		};
	MIXIN$0(constructor$0,$static$0);$static$0=void 0;return constructor$0;})(A));

	console.log(v.m1() === secret);
}

{// anon class2
	var secret2 = Object.create(null);

	var Class = (((function(super$0){"use strict";function constructor$1() {super$0.apply(this, arguments)}MIXIN$0(constructor$1, super$0);constructor$1.prototype = Object.create(super$0.prototype, {"constructor": {"value": constructor$1, "configurable": true, "writable": true} });DP$0(constructor$1, "prototype", {"configurable": false, "enumerable": false, "writable": false});var $static$0={};
		$static$0.sMethod = function() {
			return secret2;
		};
	MIXIN$0(constructor$1,$static$0);$static$0=void 0;return constructor$1;})(A)));
	var v$0 = new Class;

	console.log(v$0.m1() === secret, Class.sMethod() === secret2);
}

{// named class
	var secret2$0 = Object.create(null);

	var v$1 = new ((function(super$0){"use strict";function B() {super$0.apply(this, arguments)}MIXIN$0(B, super$0);B.prototype = Object.create(super$0.prototype, {"constructor": {"value": B, "configurable": true, "writable": true} });DP$0(B, "prototype", {"configurable": false, "enumerable": false, "writable": false});var $static$0={},$proto$0={};
		$static$0.sMethod = function() {
			return secret2$0;
		};
		$proto$0.test = function() {
			return B.sMethod();
		};
	MIXIN$0(B,$static$0);MIXIN$0(B.prototype,$proto$0);$static$0=$proto$0=void 0;return B;})(A));

	console.log(v$1.m1() === secret, v$1.test() === secret2$0);
}


{// named class 2
	var secret2$1 = Object.create(null);

	var Class$0 = (((function(super$0){"use strict";function B() {super$0.apply(this, arguments)}MIXIN$0(B, super$0);B.prototype = Object.create(super$0.prototype, {"constructor": {"value": B, "configurable": true, "writable": true} });DP$0(B, "prototype", {"configurable": false, "enumerable": false, "writable": false});var $static$0={},$proto$0={};
		$static$0.sMethod = function() {
			return secret2$1;
		};
		$proto$0.test = function() {
			return B.sMethod();
		};
	MIXIN$0(B,$static$0);MIXIN$0(B.prototype,$proto$0);$static$0=$proto$0=void 0;return B;})(A)));
	var v$2 = new Class$0;

	console.log(v$2.m1() === secret, Class$0.sMethod() === secret2$1, v$2.test() === secret2$1);
}
