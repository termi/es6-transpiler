var DP$0 = Object.defineProperty;
var moduleGreeter = {
	Greeter: ((function(){"use strict";
		constructor$0.test = function(){ return "test" }

		function constructor$0(message) {
			this.greeting = message;
		}DP$0(constructor$0, "prototype", {"configurable": false, "enumerable": false, "writable": false});

		constructor$0.prototype.greet = function() {
			return "Hello 1, " + this.greeting;
		}
	;return constructor$0;})())
};

var moduleGreeter1 = {
	Greeter1: ((function(super$0){var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};"use strict";MIXIN$0(constructor$1, super$0);
		function constructor$1(message) {
			super$0.call(this, message);
			this.greeting = message;
		}constructor$1.prototype = Object.create(super$0.prototype, {"constructor": {"value": constructor$1, "configurable": true, "writable": true} });DP$0(constructor$1, "prototype", {"configurable": false, "enumerable": false, "writable": false});
		constructor$1.prototype.greet = function() {
			return super$0.prototype.greet.call(this) + "Hello 2, " + this.greeting;
		}
	;return constructor$1;})(moduleGreeter.Greeter))
};

console.log(moduleGreeter1.Greeter1.test() === "test");
console.log((new moduleGreeter1.Greeter1("test | 3")).greet() === "Hello 1, test | 3Hello 2, test | 3");
