var x = function(a, b)
	{var c = arguments[2];if(c === void 0)c = 998;return a + b + c};console.log(x(1, 1) === 1000)

console.log(((function(){return function(a){return a*22.032}})())("321") === "321"*22.032)

var obj = {
	a: 1,
	some: function(){var SLICE$0 = Array.prototype.slice;var rest = SLICE$0.call(arguments, 0);return rest.map(function(a){return a + 1})},
	b: 6
}
console.log((obj.a + obj.some(1, 2, 3, 4).join("") + obj.b) === "123456")

var y = function()
	  {var a = arguments[0];if(a === void 0)a = 1;return (a + 1  , a  )}
console.log(y() === 1)

{
	var test$0 = 987;
	var result = (function() {
		var obj = {
			test: 123
			, arr: (function()  {return (function()  {return this.test + test$0}).bind(this)}).bind(this)
		}

		return obj.arr()();
	}).call({test: "testString"});

	console.log(result === "testString987")
}

{
	var test$1 = 321;
	result = (function() {
		var obj = {
			test: 123
			, arr: (function()  {return (function()  {return (function(a)  {return this.test + a + test$1}).bind(this)}).bind(this)}).bind(this)
		}

		return obj.arr()()("|");
	}).call({test: "testString"});

	console.log(result === "testString|321")
}

{
	var test$2 = 777;
	result = (function() {
		var obj = {
			test: "testString",arr: function() { return  (function()  {return this.test + test$2}).bind(this) },test2:1
		};

		return obj.arr()();
	}).call({test: 123});

	console.log(result === "testString777");

}

{
	function test() {
		var z = (function()  {
			this.test();
		}).bind(this)
	}
}
