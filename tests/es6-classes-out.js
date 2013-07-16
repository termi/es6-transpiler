var Greeter = (function(){
	Greeter.test = function(){ return "test" }

	//static A = 123;

	function Greeter(message) {
		this.greeting = message;
	}

	Greeter.prototype.greet = function() {
		return "Hello, " + this.greeting;
	}

	return Greeter;
})();

var Greeter1 = (function(_super){
	function Greeter1(message) {
		_super.call(this, message);
		this.greeting = message;
	}
	Object.assign(Greeter1, _super);Greeter1.prototype = Object.create(_super.prototype);Greeter1.prototype.constructor = Greeter1;
	Greeter1.prototype.greet = function() {
		return _super.prototype.greet.call(this) + "Hello, " + this.greeting;
	}

	return Greeter1;
})(Greeter);

console.log(Greeter1.A);
console.log(Greeter1.test());
console.log((new Greeter1("test | ")).greet());
