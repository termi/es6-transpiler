var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};
var moduleGreeter = {
	Greeter: ((function(){"use strict";var $static$0={},$proto$0={};
		$static$0.test = function(){ return "test" };

		function constructor$0(message) {
			this.greeting = message;
		}DP$0(constructor$0, "prototype", {"configurable": false, "enumerable": false, "writable": false});

		$proto$0.greet = function() {
			return "Hello 1, " + this.greeting;
		};
	MIXIN$0(constructor$0,$static$0);MIXIN$0(constructor$0.prototype,$proto$0);$static$0=$proto$0=void 0;return constructor$0;})())
};

var moduleGreeter1 = {
	Greeter1: ((function(super$0){"use strict";MIXIN$0(constructor$1, super$0);var $proto$0={};
		function constructor$1(message) {
			super$0.call(this, message);
			this.greeting = message;
		}constructor$1.prototype = Object.create(super$0.prototype, {"constructor": {"value": constructor$1, "configurable": true, "writable": true} });DP$0(constructor$1, "prototype", {"configurable": false, "enumerable": false, "writable": false});
		$proto$0.greet = function() {
			return super$0.prototype.greet.call(this) + "Hello 2, " + this.greeting;
		};
	MIXIN$0(constructor$1.prototype,$proto$0);$proto$0=void 0;return constructor$1;})(moduleGreeter.Greeter))
};

console.log(moduleGreeter1.Greeter1.test() === "test");
console.log((new moduleGreeter1.Greeter1("test | 3")).greet() === "Hello 1, test | 3Hello 2, test | 3");
