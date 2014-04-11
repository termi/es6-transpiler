var DP$0 = Object.defineProperty;var Greeter = (function(){"use strict";
	Greeter.test = function(){ return "test" }

	//static A = 123;

	function Greeter(message) {
		this.greeting = message;
	}DP$0(Greeter, "prototype", {"configurable": false, "enumerable": false, "writable": false});

	Greeter.prototype.greet = function() {
		return "Hello 1, " + this.greeting;
	}
;return Greeter;})();

var Greeter1 = (function(super$0){var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};"use strict";MIXIN$0(Greeter1, super$0);
	function Greeter1(message) {
		super$0.call(this, message);
		this.greeting = message;
	}Greeter1.prototype = Object.create(super$0.prototype, {"constructor": {"value": Greeter1, "configurable": true, "writable": true} });DP$0(Greeter1, "prototype", {"configurable": false, "enumerable": false, "writable": false});
	Greeter1.prototype.greet = function() {
		return super$0.prototype.greet.call(this) + "Hello 2, " + this.greeting;
	}
;return Greeter1;})(Greeter);

var A = (function(){"use strict";function A() {}DP$0(A, "prototype", {"configurable": false, "enumerable": false, "writable": false});

;return A;})();

//console.log(Greeter.A === 123);
//console.log(Greeter1.A === 123);
console.log(Greeter1.test() === "test");
console.log((new Greeter1("test | 3")).greet() === "Hello 1, test | 3Hello 2, test | 3");
console.log(new A instanceof A);
