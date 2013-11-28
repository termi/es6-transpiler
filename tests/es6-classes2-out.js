var class1 = (function(){
	function class1(msg) {
		this.property1 = msg;
	}
	class1.sayStatic = function() { return "[static:class1]" }

	class1.prototype.say = function() { return "class1:" + this.property1 }

return class1;})();

var class2 = (function(_super){Object.assign(class2, _super);
	class2.sayStatic = function(){ return _super.sayStatic() + "[static:class2]" }

	//static A = 123;

	function class2($D$0) {var message = $D$0.message;
		_super.call(this, message);
		this.property2 = message;
	}class2.prototype = Object.create(_super.prototype, {"constructor": {"value": class2, "configurable": true, "writable": true, "enumerable": false} });

	class2.prototype.say = function() {var a = arguments[0];if(a === void 0)a = 1;var b = (arguments[1] !== void 0 ? arguments[1] : [2])[0];
		return _super.prototype.say.call(this) + "|class2" + ":" + this.property2 + "|" + a + "|" + b + ":" + class2.sayStatic();
	}

return class2;})(class1);

console.log(class2.A === 123);
console.log((new class2({message: "test"})).say() === "class1:test|class2:test|1|2:[static:class1][static:class2]")
