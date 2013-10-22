var Greeter = (function(){
	Greeter.test = function(){ return "test" }

	//static A = 123;

	function Greeter(message) {
		this.greeting = message;
	}

	Greeter.prototype.greet = function() {
		return "Hello 1, " + this.greeting;
	}

return Greeter;})();

var Greeter1 = (function(_super){Object.assign(Greeter1, _super);
	function Greeter1(message) {
		_super.call(this, message);
		this.greeting = message;
	}Greeter1.prototype = Object.create(_super.prototype, {"__proto__": null, "constructor": {"value": Greeter1, "configurable": true, "writable": true, "enumerable": false} });
	Greeter1.prototype.greet = function() {
		return _super.prototype.greet.call(this) + "Hello 2, " + this.greeting;
	}

return Greeter1;})(Greeter);

console.log(Greeter.A === 123);
console.log(Greeter1.A === 123);
console.log(Greeter1.test() === "test");
console.log((new Greeter1("test | 3")).greet() === "Hello 1, test | 3Hello 2, test | 3");
