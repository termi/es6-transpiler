var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;
// simple class
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A();

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 0);
})();

// simple class with constructor
(function() {
	var A = (function(){"use strict";
		function A(a) {
			this.a = a;
		}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A('test');

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 0);
})();

// simple class with method
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});var proto$0={};
		proto$0.a = function(a) {
			return 'test'
		};
	MIXIN$0(A.prototype,proto$0);proto$0=void 0;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a.a() === 'test');
})();

// simple class with static method
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});var static$0={};
		static$0.a = function(a) {
			return 'test'
		};
	MIXIN$0(A,static$0);static$0=void 0;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A.a() === 'test');
})();

// simple class with getter
(function() {
	var A = (function(){"use strict";function A() {}DPS$0(A.prototype,{a: {"get": a$get$0, "configurable":true,"enumerable":true}});DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function a$get$0() {
			return 'test'
		}
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a.a === 'test');
})();

// simple class with setter
(function() {
	var A = (function(){"use strict";function A() {}DPS$0(A.prototype,{a: {"set": a$set$0, "configurable":true,"enumerable":true}});DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function a$set$0(a) {
			this._a = a + '_' + 9;
		}
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	a.a = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a._a === 'test_9');
})();

// simple class with static getter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function static_a$get$0() {
			return 'test'
		};DPS$0(A,{a: {"get": static_a$get$0, "configurable":true,"enumerable":true}});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A.a === 'test');
})();

// simple class with static setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function static_a$set$0(a) {
			this._a = a + '_' + 9;
		};DPS$0(A,{a: {"set": static_a$set$0, "configurable":true,"enumerable":true}});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	A.a = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A._a === 'test_9');
})();

// simple class with getter and setter
(function() {
	var A = (function(){"use strict";function A() {}DPS$0(A.prototype,{a: {"get": a$get$1, "set": a$set$1, "configurable":true,"enumerable":true}});DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function a$get$1() {
			return this._a;
		}

		function a$set$1(a) {
			this._a = a + '_' + 9;
		}
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	a.a = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a.a === 'test_9', a._a === 'test_9');
})();

// simple class with static getter and setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function static_a$get$1() {
			return this._a;
		};DPS$0(A,{a: {"get": static_a$get$1, "set": static_a$set$1, "configurable":true,"enumerable":true}});

		function static_a$set$1(a) {
			this._a = a + '_' + 9;
		}
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	A.a = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A.a === 'test_9', A._a === 'test_9');
})();

// --------------------======================== LITERAL ========================--------------------

// simple class with literal constructor
(function() {
	var A = (function(){"use strict";
		function A(a) {
			this.a = a;
		}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A('test');

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 0, a.a === 'test');
})();

// simple class with literal method
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});var proto$0={};
		proto$0['a'] = function(a) {
			return 'test'
		};
	MIXIN$0(A.prototype,proto$0);proto$0=void 0;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a['a']() === 'test');
})();

// simple class with literal static method
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});var static$0={};
		static$0['a'] = function(a) {
			return 'test'
		};
	MIXIN$0(A,static$0);static$0=void 0;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A['a']() === 'test');
})();

// simple class with literal getter
(function() {
	var A = (function(){"use strict";function A() {}DPS$0(A.prototype,{'a': {"get": a$get$2, "configurable":true,"enumerable":true}});DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function a$get$2() {
			return 'test'
		}
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a['a'] === 'test');
})();

// simple class with literal setter
(function() {
	var A = (function(){"use strict";function A() {}DPS$0(A.prototype,{'a': {"set": a$set$2, "configurable":true,"enumerable":true}});DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function a$set$2(a) {
			this._a = a + '_' + 9;
		}
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	a['a'] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a._a === 'test_9');
})();

// simple class with literal static getter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function static_a$get$2() {
			return 'test'
		};DPS$0(A,{'a': {"get": static_a$get$2, "configurable":true,"enumerable":true}});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A['a'] === 'test');
})();

// simple class with literal static setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function static_a$set$2(a) {
			this._a = a + '_' + 9;
		};DPS$0(A,{'a': {"set": static_a$set$2, "configurable":true,"enumerable":true}});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	A['a'] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A._a === 'test_9');
})();

// simple class with literal getter and setter
(function() {
	var A = (function(){"use strict";function A() {}DPS$0(A.prototype,{'a': {"get": a$get$3, "set": a$set$3, "configurable":true,"enumerable":true}});DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function a$get$3() {
			return this._a;
		}

		function a$set$3(a) {
			this._a = a + '_' + 9;
		}
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	a['a'] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a['a'] === 'test_9', a._a === 'test_9');
})();

// simple class with literal static getter and setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		function static_a$get$3() {
			return this._a;
		};DPS$0(A,{'a': {"get": static_a$get$3, "set": static_a$set$3, "configurable":true,"enumerable":true}});

		function static_a$set$3(a) {
			this._a = a + '_' + 9;
		}
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	A['a'] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A['a'] === 'test_9', A._a === 'test_9');
})();

// --------------------======================== SIMPLE COMPUTED ========================--------------------

// TODO::
//// simple class with simple computed constructor
//(function() {
//	class A {
//		['constructor'](a) {
//			this.a = a;
//		}
//	}
//
//	let a = new A('test');
//
//	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 0, a.a === 'test');
//})();

// simple class with simple computed method
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});var proto$0={};
		proto$0['a'] = function(a) {
			return 'test'
		};
	MIXIN$0(A.prototype,proto$0);proto$0=void 0;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a['a']() === 'test');
})();

// simple class with simple computed static method
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});var static$0={};
		static$0['a'] = function(a) {
			return 'test'
		};
	MIXIN$0(A,static$0);static$0=void 0;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A['a']() === 'test');
})();

// simple class with simple computed getter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A.prototype,'a',{"get":function() {
			return 'test'
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a['a'] === 'test');
})();

// simple class with simple computed setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A.prototype,'a',{"set":function(a) {
			this._a = a + '_' + 9;
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	a['a'] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a._a === 'test_9');
})();

// simple class with simple computed static getter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A,'a',{"get":function() {
			return 'test'
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A['a'] === 'test');
})();

// simple class with simple computed static setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A,'a',{"set":function(a) {
			this._a = a + '_' + 9;
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	A['a'] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A._a === 'test_9');
})();

// simple class with simple computed getter and setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A.prototype,'a',{"get":function() {
			return this._a;
		},"configurable":true,"enumerable":true});

		DP$0(A.prototype,'a',{"set":function(a) {
			this._a = a + '_' + 9;
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	a['a'] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a['a'] === 'test_9', a._a === 'test_9');
})();

// simple class with simple computed static getter and setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A,'a',{"get":function() {
			return this._a;
		},"configurable":true,"enumerable":true});

		DP$0(A,'a',{"set":function(a) {
			this._a = a + '_' + 9;
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	A['a'] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A['a'] === 'test_9', A._a === 'test_9');
})();

// --------------------======================== COMPUTED ========================--------------------

var postfix = 'd' + Math.random(), constructorPostfix = 'ctor';

// TODO::
//// simple class with computed constructor
//(function() {
//	class A {
//		['constru' + constructorPostfix](a) {
//			this.a = a;
//		}
//	}
//
//	let a = new A('test');
//
//	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 0, a.a === 'test');
//})();

// simple class with computed method
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});var proto$0={};
		proto$0['a' + postfix] = function(a) {
			return 'test'
		};
	MIXIN$0(A.prototype,proto$0);proto$0=void 0;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a['a' + postfix]() === 'test');
})();

// simple class with computed static method
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});var static$0={};
		static$0['a' + postfix] = function(a) {
			return 'test'
		};
	MIXIN$0(A,static$0);static$0=void 0;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A['a' + postfix]() === 'test');
})();

// simple class with computed getter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A.prototype,'a' + postfix,{"get":function() {
			return 'test'
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a['a' + postfix] === 'test');
})();

// simple class with computed setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A.prototype,'a' + postfix,{"set":function(a) {
			this._a = a + '_' + 9;
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	a['a' + postfix] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a._a === 'test_9');
})();

// simple class with computed static getter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A,'a' + postfix,{"get":function() {
			return 'test'
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A['a' + postfix] === 'test');
})();

// simple class with computed static setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A,'a' + postfix,{"set":function(a) {
			this._a = a + '_' + 9;
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	A['a' + postfix] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A._a === 'test_9');
})();

// simple class with computed getter and setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A.prototype,'a' + postfix,{"get":function() {
			return this._a;
		},"configurable":true,"enumerable":true});

		DP$0(A.prototype,'a' + postfix,{"set":function(a) {
			this._a = a + '_' + 9;
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	a['a' + postfix] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 1, sk.length === 0, a['a' + postfix] === 'test_9', a._a === 'test_9');
})();

// simple class with computed static getter and setter
(function() {
	var A = (function(){"use strict";function A() {}DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});
		DP$0(A,'a' + postfix,{"get":function() {
			return this._a;
		},"configurable":true,"enumerable":true});

		DP$0(A,'a' + postfix,{"set":function(a) {
			this._a = a + '_' + 9;
		},"configurable":true,"enumerable":true});
	;return A;})();

	var pk = Object.keys(A.prototype);var sk = Object.keys(A);
	var a = new A;
	A['a' + postfix] = 'test';

	console.log(a.constructor == A, a instanceof A, pk.length === 0, sk.length === 1, A['a' + postfix] === 'test_9', A._a === 'test_9');
})();
