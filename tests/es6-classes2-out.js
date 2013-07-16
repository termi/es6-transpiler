var test = (function(){
	function test(msg) {
		this.msg = msg;
	}

	test.prototype.greet = function() { return "lol" }

	return test;
})();

var Greeter = (function(_super){
	Greeter.test = function(){ return _super.test() + "test" }

	//static A = 123;

	function Greeter() {
		var $D$0 = arguments[0];
		var message = $D$0.message;
		$D$0 = null;
		_super.call(this, message);
		this.greeting = message;
	}
	Object.assign(Greeter, _super);Greeter.prototype = Object.create(_super.prototype);Greeter.prototype.constructor = Greeter;

	Greeter.prototype.greet = function() {
		var a = arguments[0];if(a === void 0)a = 1;
		var $D$1 = arguments[1] !== void 0 ? arguments[1] : [2];
		var b = $D$1[0];
		$D$1 = null;
		return _super.prototype.greet.call(this) + "Hello, " + this.msg	+ "|" + this.greeting + "|" + a + "|" + b;
	}

	return Greeter;
})(test);

(new Greeter({message: "test"})).greet()
