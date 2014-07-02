var DP$0 = Object.defineProperty;
var testCall = false;
var Foo = (function(){"use strict";function Foo() {}DP$0(Foo, "prototype", {"configurable": false, "enumerable": false, "writable": false});
	Foo.doIt = function(test) {
		if ( test ) {
			testCall = true;
		}
		else {
			this.test = 999;
		}
	}
;return Foo;})();

var Base = (function(super$0){var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};"use strict";MIXIN$0(Base, super$0);
	function Base() {
		super$0.call(this);
		super$0.constructor();//useless call
		super$0.doIt(true);
		super$0.doIt.call(this);
	}Base.prototype = Object.create(super$0.prototype, {"constructor": {"value": Base, "configurable": true, "writable": true} });DP$0(Base, "prototype", {"configurable": false, "enumerable": false, "writable": false});
;return Base;})(Foo);

console.log( ((new Base).test === 999 && testCall) === true );
