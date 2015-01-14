var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var SP$0 = Object.setPrototypeOf||function(o,p){if(PRS$0){o["__proto__"]=p;}else {DP$0(o,"__proto__",{"value":p,"configurable":true,"enumerable":false,"writable":true});}return o};var OC$0 = Object.create;var DPS$0 = Object.defineProperties;var ARRAY$0 = Array;var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol.iterator||'@@iterator';var S_MARK$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol["__setObjectSetter__"];function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(S_MARK$0)S_MARK$0(v);if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){i=f.call(v);r=[];}else if((v+'')==='[object Generator]'){i=v;r=[];};if(S_MARK$0)S_MARK$0(void 0);if(r) {while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};
var testCall1 = false, testCall2 = false;
var Foo = (function(){"use strict";function Foo() {}DP$0(Foo,"prototype",{"configurable":false,"enumerable":false,"writable":false});var static$0={},proto$0={};
	static$0.doIt = function(test, n) {
		if ( test ) {
			if ( n == 1 ) {
				testCall1 = true;
			}
			else {
				testCall2 = true;
			}
		}
		else {
			if ( n == 1 ) {
				this.test1 = 999;
			}
			else {
				this.test2 = 999;
			}

		}
	};

	proto$0.doIt = function() {
		Foo.doIt.apply(this, arguments);
	};

	static$0.constructor = function() {

	};
MIXIN$0(Foo,static$0);MIXIN$0(Foo.prototype,proto$0);static$0=proto$0=void 0;return Foo;})();

var Base = (function(super$0){"use strict";if(!PRS$0)MIXIN$0(Base, super$0);var static$0={},proto$0={};
	function Base() {
		super$0.call(this);
		super$0.prototype.constructor.call(this);//useless call
		super$0.prototype.doIt.call(this, true, 1);
		super$0.prototype.doIt.call(this, void 0, 1);

		return true;
	}if(super$0!==null)SP$0(Base,super$0);Base.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":Base,"configurable":true,"writable":true}});DP$0(Base,"prototype",{"configurable":false,"enumerable":false,"writable":false});

	static$0.constructor = function() {
		super$0.constructor.call(this);
		super$0.constructor.call(this);//useless call
		super$0.doIt.call(this, true);
		super$0.doIt.call(this);

		return true;
	};

	proto$0.getParentClass = function() {
		return super$0;
	};

	static$0.getParentClass = function() {
		return super$0;
	};
MIXIN$0(Base,static$0);MIXIN$0(Base.prototype,proto$0);static$0=proto$0=void 0;return Base;})(Foo);

console.log( ((new Base).test1 === 999 && testCall1) === true );
console.log( (new Base).getParentClass() == Foo );
console.log( Base.constructor(), (Base.test2 === 999 && testCall2) === true, Base.getParentClass() == Foo );

// --------------------======================== SPREAD ========================--------------------

var A = (function(){"use strict";function A() {}DPS$0(A.prototype,{prop1: {"get": $prop1_get$0, "set": $prop1_set$0, "configurable":true,"enumerable":true}});DP$0(A,"prototype",{"configurable":false,"enumerable":false,"writable":false});var static$0={},proto$0={};
	proto$0.a = function() {for (var l$0 = arguments.length, rest = ARRAY$0(l$0), i$0 = 0; i$0 < l$0; i$0++) rest[i$0] = arguments[i$0];
		return rest.reverse();
	};

	static$0.a = function() {for (var l$1 = arguments.length, rest = ARRAY$0(l$1), i$1 = 0; i$1 < l$1; i$1++) rest[i$1] = arguments[i$1];
		return ['static'].concat(ITER$0(rest)).reverse();
	};

	proto$0.c = function() {for (var l$2 = arguments.length, rest = ARRAY$0(l$2), i$2 = 0; i$2 < l$2; i$2++) rest[i$2] = arguments[i$2];
		return rest.reverse();
	};

	static$0.c = function() {for (var l$3 = arguments.length, rest = ARRAY$0(l$3), i$3 = 0; i$3 < l$3; i$3++) rest[i$3] = arguments[i$3];
		return ['static'].concat(ITER$0(rest)).reverse();
	};

	proto$0.d = function() {for (var l$4 = arguments.length, rest = ARRAY$0(l$4), i$4 = 0; i$4 < l$4; i$4++) rest[i$4] = arguments[i$4];
		return rest.reverse();
	};

	static$0.d = function() {for (var l$5 = arguments.length, rest = ARRAY$0(l$5), i$5 = 0; i$5 < l$5; i$5++) rest[i$5] = arguments[i$5];
		return ['static'].concat(ITER$0(rest)).reverse();
	};

	function $prop1_get$0() {
		return this.a.apply(this, ITER$0(this._prop1));
	}

	function $static_prop1_get$0() {
		return this.a.apply(this, ITER$0(this._prop1));
	};DPS$0(A,{prop1: {"get": $static_prop1_get$0, "set": $static_prop1_set$0, "configurable":true,"enumerable":true}});

	function $prop1_set$0() {for (var l$6 = arguments.length, rest = ARRAY$0(l$6), i$6 = 0; i$6 < l$6; i$6++) rest[i$6] = arguments[i$6];
		this._prop1 = rest;
	}

	function $static_prop1_set$0() {for (var l$7 = arguments.length, rest = ARRAY$0(l$7), i$7 = 0; i$7 < l$7; i$7++) rest[i$7] = arguments[i$7];
		this._prop1 = ['static'].concat(ITER$0(rest));
	}
MIXIN$0(A,static$0);MIXIN$0(A.prototype,proto$0);static$0=proto$0=void 0;return A;})();

var B = (function(super$0){"use strict";var $D$0;var $D$1;var CNAMES$0 = [];var GET_CNAMES$0 = function f(o){var r,u;for(var p in o)if((r=o[p])&&typeof r ==='object'&&(u=r["__unq"])){CNAMES$0[u]=p;delete r["__unq"];}return o;};;function B() {if(super$0!==null)super$0.apply(this, arguments)}if(!PRS$0)MIXIN$0(B, super$0);if(super$0!==null)SP$0(B,super$0);B.prototype = OC$0(super$0!==null?super$0.prototype:null,GET_CNAMES$0({"constructor":{"value":B,"configurable":true,"writable":true}, prop1: {"get": $prop1_get$1, "set": $prop1_set$1, "configurable":true,"enumerable":true, "__unq": 1}}));$D$0=CNAMES$0[1];delete CNAMES$0[1];;DP$0(B,"prototype",{"configurable":false,"enumerable":false,"writable":false});var static$0={},proto$0={};
	proto$0.a = function() {for (var l$8 = arguments.length, rest = ARRAY$0(l$8), i$8 = 0; i$8 < l$8; i$8++) rest[i$8] = arguments[i$8];
		return super$0.prototype.a.apply(this, ITER$0(rest));
	};

	static$0.a = function() {for (var l$9 = arguments.length, rest = ARRAY$0(l$9), i$9 = 0; i$9 < l$9; i$9++) rest[i$9] = arguments[i$9];
		return super$0.a.apply(this, ITER$0(rest));
	};

	proto$0.c = function() {for (var l$10 = arguments.length, rest = ARRAY$0(l$10), i$10 = 0; i$10 < l$10; i$10++) rest[i$10] = arguments[i$10];
		return super$0.prototype.c.apply(this, [1, 2, 3].concat(ITER$0(rest)));
	};

	static$0.c = function() {for (var l$11 = arguments.length, rest = ARRAY$0(l$11), i$11 = 0; i$11 < l$11; i$11++) rest[i$11] = arguments[i$11];
		return super$0.c.apply(this, [1, 2, 3].concat(ITER$0(rest)));
	};

	proto$0.d = function() {for (var l$12 = arguments.length, rest = ARRAY$0(l$12), i$12 = 0; i$12 < l$12; i$12++) rest[i$12] = arguments[i$12];
		return super$0.prototype.d.apply(this, [ ].concat(ITER$0(rest, true), ['|'], ITER$0(rest.reverse())));
	};

	static$0.d = function() {for (var l$13 = arguments.length, rest = ARRAY$0(l$13), i$13 = 0; i$13 < l$13; i$13++) rest[i$13] = arguments[i$13];
		return super$0.d.apply(this, [ ].concat(ITER$0(rest, true), ['|'], ITER$0(rest.reverse())));
	};

	proto$0.a1 = function() {for (var l$14 = arguments.length, rest = ARRAY$0(l$14), i$14 = 0; i$14 < l$14; i$14++) rest[i$14] = arguments[i$14];
		return super$0.prototype.a.apply(this, [1].concat(ITER$0(rest)));
	};

	static$0.a1 = function() {for (var l$15 = arguments.length, rest = ARRAY$0(l$15), i$15 = 0; i$15 < l$15; i$15++) rest[i$15] = arguments[i$15];
		return super$0.a.apply(this, [1].concat(ITER$0(rest)));
	};

	proto$0.a2 = function() {for (var l$16 = arguments.length, rest = ARRAY$0(l$16), i$16 = 0; i$16 < l$16; i$16++) rest[i$16] = arguments[i$16];
		return super$0.prototype.a.apply(this, [1, 2].concat(ITER$0(rest)));
	};

	static$0.a2 = function() {for (var l$17 = arguments.length, rest = ARRAY$0(l$17), i$17 = 0; i$17 < l$17; i$17++) rest[i$17] = arguments[i$17];
		return super$0.a.apply(this, [1, 2].concat(ITER$0(rest)));
	};

	function $prop1_get$1() {
		return GOPD$0(super$0.prototype,$D$0)["get"].call(this);
	}

	function $static_prop1_get$1() {
		return GOPD$0(super$0,$D$1)["get"].call(this);
	};DPS$0(B,GET_CNAMES$0({prop1: {"get": $static_prop1_get$1, "set": $static_prop1_set$1, "configurable":true,"enumerable":true, "__unq": 2}}));$D$1=CNAMES$0[2];delete CNAMES$0[2];;

	function $prop1_set$1() {for (var l$18 = arguments.length, rest = ARRAY$0(l$18), i$18 = 0; i$18 < l$18; i$18++) rest[i$18] = arguments[i$18];
		GOPD$0(super$0.prototype,$D$0)["set"].apply(this, ITER$0(rest));
	}

	function $static_prop1_set$1() {for (var l$19 = arguments.length, rest = ARRAY$0(l$19), i$19 = 0; i$19 < l$19; i$19++) rest[i$19] = arguments[i$19];
		GOPD$0(super$0,$D$1)["set"].apply(this, ITER$0(rest));
	}
MIXIN$0(B,static$0);MIXIN$0(B.prototype,proto$0);static$0=proto$0=void 0;return B;})(A);

console.log(A.a(1, 2, 3).join('|') === [3, 2, 1, 'static'].join('|'), A.c(1, 2, 3).join('|') === [3, 2, 1, 'static'].join('|'), A.d(1, 2, 3).join('|') === [3, 2, 1, 'static'].join('|'));

console.log(B.a(1, 2, 3).join('|') === [3, 2, 1, 'static'].join('|'));
console.log(B.c(1, 2, 3).join('|') === [3, 2, 1, 3, 2, 1, 'static'].join('|'));
console.log(B.d(1, 2, 3).join('|') === [1, 2, 3, '|', 3, 2, 1, 'static'].join('|'));

console.log(B.a1(2, 3).join('|') === [3, 2, 1, 'static'].join('|'));
console.log(B.a2(3).join('|') === [3, 2, 1, 'static'].join('|'));

var a = new A;
var b = new B;

console.log(a.a(1, 2, 3).join('|') === [3, 2, 1].join('|'), a.c(1, 2, 3).join('|') === [3, 2, 1].join('|'), a.d(1, 2, 3).join('|') === [3, 2, 1].join('|'));

console.log(b.a(1, 2, 3).join('|') === [3, 2, 1].join('|'));
console.log(b.c(1, 2, 3).join('|') === [3, 2, 1, 3, 2, 1].join('|'));
console.log(b.d(1, 2, 3).join('|') === [1, 2, 3, '|', 3, 2, 1].join('|'));

console.log(b.a1(2, 3).join('|') === [3, 2, 1].join('|'));
console.log(b.a2(3).join('|') === [3, 2, 1].join('|'));
