var SLICE$0 = Array.prototype.slice;"use strict";

{
	var test = {
		test: function(){return 1}
	}
	console.log(test.test() === 1)

	{
		var test$0 = {
			test: function(a){var a = (a).a;var rest = SLICE$0.call(arguments, 1);return a+rest[0]}
		}
		console.log(test$0.test({a: 1}, 2, 999) === 3)
	}
}

{
	var test$1 = {
		test: function(){return 2}
	}
	console.log(test$1.test() === 2)

	{
		var test$2 = {
			test: function(a){var a = (a).a;var rest = SLICE$0.call(arguments, 1);return a+rest[0]}
		}
		console.log(test$2.test({a: 2}, 2, 999) === 4)
	}
}

{
	var test$3 = {
		test: function(){return (1, 3)}
	}
	console.log(test$3.test() === 3)

	{
		var test$4 = {
			test: function(a){var a = (a).a;var rest = SLICE$0.call(arguments, 1);return (1, a+rest[0])}
		}
		console.log(test$4.test({a: 3}, 2, 999) === 5)
	}
}

{
	var test$5 = {
		test: function(){return [3, 4]}
	}
	console.log(test$5.test().join("|") === [3, 4].join("|"))

	{
		var test$6 = {
			test: function(a){var a = (a).a;var rest = SLICE$0.call(arguments, 1);return [a, rest[0]]}
		}
		console.log(test$6.test({a: 4}, 2, 999).join("|") === [4, 2].join("|"))
	}
}

{
	var test$7 = {
		test: function()
		{return 5}

	}
	console.log(test$7.test() === 5)

	{
		var test$8 = {
			test: function(a)
			{var a = (a).a;var rest = SLICE$0.call(arguments, 1);return a+rest[0]}

		}
		console.log(test$8.test({a: 5}, 2, 999) === 7)
	}
}

{
	var test$9 = {
		test: function()
		{return [5, 6]}

	}
	console.log(test$9.test().join("|") === [5, 6].join("|"))

	{
		var test$10 = {
			test: function(a)
			{var a = (a).a;var rest = SLICE$0.call(arguments, 1);return [a, rest[0]]}

		}
		console.log(test$10.test({a: 6}, 2, 999).join("|") === [6, 2].join("|"))
	}
}

{
	var test$11 = {
		test: function(/*com1*//*com2*/)/*com3*///com4
			/*com5*/{return 7}//com6
		/*com7*/ //com8
	}
	console.log(test$11.test() === 7)

	{
		var test$12 = {
			test: function/*com1*/(/*com2*/a/*com3-3*/)/*com3-4*///com4
				/*com5*/{var a = (a).a;var rest = SLICE$0.call(arguments, 1);return a+rest[0]}//com6
			/*com7*/ //com8
		}
		console.log(test$12.test({a: 7}, 2, 999) === 9)
	}
}

{
	var test$13 = {
		test: function(/*com1*//*com2*/)/*com3*///com4
			/*com5*/{return [7, 8]}//com6
		/*com7*/ //com8
	}
	console.log(test$13.test().join("|") === [7, 8].join("|"))

	{
		var test$14 = {
			test: function/*com1*/(/*com2*/a/*com3-3*/)/*com3-4*///com4
				/*com5*/{var a = (a).a;var rest = SLICE$0.call(arguments, 1);return [a, rest[0]]}//com6
			/*com7*/ //com8
		}
		console.log(test$14.test({a: 8}, 2, 999).join("|") === [8, 2].join("|"))
	}
}

{
	var test$15 = {
		test: function(/*com1*//*com2*/)/*com3*/{return (1,//com4
			/*com5*/9//com6
		/*com7*/)}//com8
	}
	console.log(test$15.test() === 9)

	{
		var test$16 = {
			test: function/*com1*/(/*com2*/a/*com3-3*/)/*com3-4*/{var a = (a).a;var rest = SLICE$0.call(arguments, 1);return (1,//com4
				/*com5*/a+rest[0]//com6
			/*com7*/)}//com8
		}
		console.log(test$16.test({a: 9}, 2, 999) === 11)
	}
}
