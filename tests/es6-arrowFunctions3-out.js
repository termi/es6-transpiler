"use strict";var ARRAY$0 = Array;

var a = 1;
{
	var a$0 = 2;//
}

{
	var test = {
		test: function(){return 1}
	}
	console.log(test.test() === 1)

	{
		var test$0 = {
			test: function(a){var a = a.a;for (var l$0 = arguments.length, rest = ARRAY$0(l$0 > 1 ? l$0 - 1 : 0),  i$0 = 1; i$0 < l$0; i$0++) rest[i$0 - 1] = arguments[i$0];return a+rest[0]}
		}
		console.log(test$0.test({a: 1}, 2, 999) === 3)
	}

	(function() {var this$0 = this;

		var test = {
			test: function(){return 1+this$0.test}
		}
		console.log(test.test() === 101)

		{
			var test$1 = {
				test: function(a){var a = a.a;for (var l$1 = arguments.length, rest = ARRAY$0(l$1 > 1 ? l$1 - 1 : 0),  i$1 = 1; i$1 < l$1; i$1++) rest[i$1 - 1] = arguments[i$1];return a+rest[0]+this$0.test}
			}
			console.log(test$1.test({a: 1}, 2, 999) === 103)
		}

	}).call({test: 100})
}

{
	var test$2 = {
		test: function(){return 2} 
	}
	console.log(test$2.test() === 2)

	{
		var test$3 = {
			test: function(a){var a = a.a;for (var l$2 = arguments.length, rest = ARRAY$0(l$2 > 1 ? l$2 - 1 : 0),  i$2 = 1; i$2 < l$2; i$2++) rest[i$2 - 1] = arguments[i$2];return a+rest[0]} 
		}
		console.log(test$3.test({a: 2}, 2, 999) === 4)
	}

	(function() {var this$0 = this;

		var test = {
			test: function(){return 2+this$0.test} 
		}
		console.log(test.test() === 102)

		{
			var test$4 = {
				test: function(a){var a = a.a;for (var l$3 = arguments.length, rest = ARRAY$0(l$3 > 1 ? l$3 - 1 : 0),  i$3 = 1; i$3 < l$3; i$3++) rest[i$3 - 1] = arguments[i$3];return a+rest[0]+this$0.test} 
			}
			console.log(test$4.test({a: 2}, 2, 999) === 104)
		}

	}).call({test: 100})
}

{
	var test$5 = {
		test: function(){return (1, 3)}
	}
	console.log(test$5.test() === 3)

	{
		var test$6 = {
			test: function(a){var a = a.a;for (var l$4 = arguments.length, rest = ARRAY$0(l$4 > 1 ? l$4 - 1 : 0),  i$4 = 1; i$4 < l$4; i$4++) rest[i$4 - 1] = arguments[i$4];return (1, a+rest[0])}
		}
		console.log(test$6.test({a: 3}, 2, 999) === 5)
	}

	(function() {var this$0 = this;

		var test = {
			test: function(){return (1, 3+this$0.test)}
		}
		console.log(test.test() === 103)

		{
			var test$7 = {
				test: function(a){var a = a.a;for (var l$5 = arguments.length, rest = ARRAY$0(l$5 > 1 ? l$5 - 1 : 0),  i$5 = 1; i$5 < l$5; i$5++) rest[i$5 - 1] = arguments[i$5];return (1, a+rest[0]+this$0.test)}
			}
			console.log(test$7.test({a: 3}, 2, 999) === 105)
		}

	}).call({test: 100})
}

{
	var test$8 = {
		test: function(){return [3, 4]} 
	}
	console.log(test$8.test().join("|") === [3, 4].join("|"))

	{
		var test$9 = {
			test: function(a){var a = a.a;for (var l$6 = arguments.length, rest = ARRAY$0(l$6 > 1 ? l$6 - 1 : 0),  i$6 = 1; i$6 < l$6; i$6++) rest[i$6 - 1] = arguments[i$6];return [a, rest[0]]} 
		}
		console.log(test$9.test({a: 4}, 2, 999).join("|") === [4, 2].join("|"))
	}

	(function() {var this$0 = this;

		var test = {
			test: function(){return [3, 4, this$0.test]} 
		}
		console.log(test.test().join("|") === [3, 4, 100].join("|"))

		{
			var test$10 = {
				test: function(a){var a = a.a;for (var l$7 = arguments.length, rest = ARRAY$0(l$7 > 1 ? l$7 - 1 : 0),  i$7 = 1; i$7 < l$7; i$7++) rest[i$7 - 1] = arguments[i$7];return [a, rest[0], this$0.test]} 
			}
			console.log(test$10.test({a: 4}, 2, 999).join("|") === [4, 2, 100].join("|"))
		}

	}).call({test: 100})
}

{
	var test$11 = {
		test: function()
			{return 5}
		 
	}
	console.log(test$11.test() === 5)

	{
		var test$12 = {
			test: function(a)
				{var a = a.a;for (var l$8 = arguments.length, rest = ARRAY$0(l$8 > 1 ? l$8 - 1 : 0),  i$8 = 1; i$8 < l$8; i$8++) rest[i$8 - 1] = arguments[i$8];return a+rest[0]}
			 
		}
		console.log(test$12.test({a: 5}, 2, 999) === 7)
	}

	(function() {var this$0 = this;

		var test = {
			test: function()
				{return 5 + this$0.test}
			 
		}
		console.log(test.test() === 105)

		{
			var test$13 = {
				test: function(a)
					{var a = a.a;for (var l$9 = arguments.length, rest = ARRAY$0(l$9 > 1 ? l$9 - 1 : 0),  i$9 = 1; i$9 < l$9; i$9++) rest[i$9 - 1] = arguments[i$9];return a+rest[0]+this$0.test}
				 
			}
			console.log(test$13.test({a: 5}, 2, 999) === 107)
		}

	}).call({test: 100})
}

{
	var test$14 = {
		test: function()
			{return [5, 6]}
		 
	}
	console.log(test$14.test().join("|") === [5, 6].join("|"))

	{
		var test$15 = {
			test: function(a)
				{var a = a.a;for (var l$10 = arguments.length, rest = ARRAY$0(l$10 > 1 ? l$10 - 1 : 0),  i$10 = 1; i$10 < l$10; i$10++) rest[i$10 - 1] = arguments[i$10];return [a, rest[0]]}
			 
		}
		console.log(test$15.test({a: 6}, 2, 999).join("|") === [6, 2].join("|"))
	}

	(function() {var this$0 = this;

		var test = {
			test: function()
				{return [5, 6, this$0.test]}
			 
		}
		console.log(test.test().join("|") === [5, 6, 100].join("|"))

		{
			var test$16 = {
				test: function(a)
					{var a = a.a;for (var l$11 = arguments.length, rest = ARRAY$0(l$11 > 1 ? l$11 - 1 : 0),  i$11 = 1; i$11 < l$11; i$11++) rest[i$11 - 1] = arguments[i$11];return [a, rest[0], this$0.test]}
				 
			}
			console.log(test$16.test({a: 6}, 2, 999).join("|") === [6, 2, 100].join("|"))
		}

	}).call({test: 100})
}

{
	var test$17 = {
		test: /*com1*/function(/*com2*/)/*com3-1*//*com3-2*///com4
			/*com5*/{return 7}//com6
		/*com7*/ //com8
	}
	console.log(test$17.test() === 7)

	{
		var test$18 = {
			test: /*com1*/function(/*com2*/a/*com3-3*/)/*com3-4*//*com3-5*///com4
				/*com5*/{var a = a.a;for (var l$12 = arguments.length, rest = ARRAY$0(l$12 > 1 ? l$12 - 1 : 0),  i$12 = 1; i$12 < l$12; i$12++) rest[i$12 - 1] = arguments[i$12];return a+rest[0]}//com6
			/*com7*/ //com8
		}
		console.log(test$18.test({a: 7}, 2, 999) === 9)
	}

	(function() {var this$0 = this;

		var test = {
			test: /*com1*/function(/*com2*/)/*com3-1*//*com3-2*///com4
				/*com5*/{return 7+this$0.test}//com6
			/*com7*/ //com8
		}
		console.log(test.test() === 107)

		{
			var test$19 = {
				test: /*com1*/function(/*com2*/a/*com3-3*/)/*com3-4*//*com3-5*///com4
					/*com5*/{var a = a.a;for (var l$13 = arguments.length, rest = ARRAY$0(l$13 > 1 ? l$13 - 1 : 0),  i$13 = 1; i$13 < l$13; i$13++) rest[i$13 - 1] = arguments[i$13];return a+rest[0]+this$0.test}//com6
				/*com7*/ //com8
			}
			console.log(test$19.test({a: 7}, 2, 999) === 109)
		}

	}).call({test: 100})
}

{
	var test$20 = {
		test: /*com1*/function(/*com2*/)/*com3-1*//*com3-2*///com4
			/*com5*/{return [7, 8]}//com6
		/*com7*/ //com8
	}
	console.log(test$20.test().join("|") === [7, 8].join("|"))

	{
		var test$21 = {
			test: /*com1*/function(/*com2*/a/*com3-3*/)/*com3-4*//*com3-5*///com4
				/*com5*/{var a = a.a;for (var l$14 = arguments.length, rest = ARRAY$0(l$14 > 1 ? l$14 - 1 : 0),  i$14 = 1; i$14 < l$14; i$14++) rest[i$14 - 1] = arguments[i$14];return [a, rest[0]]}//com6
			/*com7*/ //com8
		}
		console.log(test$21.test({a: 8}, 2, 999).join("|") === [8, 2].join("|"))
	}

	(function() {var this$0 = this;

		var test = {
			test: /*com1*/function(/*com2*/)/*com3-1*//*com3-2*///com4
				/*com5*/{return [7, 8, this$0.test]}//com6
			/*com7*/ //com8
		}
		console.log(test.test().join("|") === [7, 8, 100].join("|"))

		{
			var test$22 = {
				test: /*com1*/function(/*com2*/a/*com3-3*/)/*com3-4*//*com3-5*///com4
					/*com5*/{var a = a.a;for (var l$15 = arguments.length, rest = ARRAY$0(l$15 > 1 ? l$15 - 1 : 0),  i$15 = 1; i$15 < l$15; i$15++) rest[i$15 - 1] = arguments[i$15];return [a, rest[0], this$0.test]}//com6
				/*com7*/ //com8
			}
			console.log(test$22.test({a: 8}, 2, 999).join("|") === [8, 2, 100].join("|"))
		}

	}).call({test: 100})
}

{
	var test$23 = {
		test: /*com1*/function(/*com2*/)/*com3-1*//*com3-2*/{return (1,//com4
			/*com5*/9//com6
		/*com7*/)}//com8
	}
	console.log(test$23.test() === 9)

	{
		var test$24 = {
			test: /*com1*/function(/*com2*/a/*com3-3*/)/*com3-4*//*com3-5*/{var a = a.a;for (var l$16 = arguments.length, rest = ARRAY$0(l$16 > 1 ? l$16 - 1 : 0),  i$16 = 1; i$16 < l$16; i$16++) rest[i$16 - 1] = arguments[i$16];return (1,//com4
				/*com5*/a+rest[0]//com6
			/*com7*/)}//com8
		}
		console.log(test$24.test({a: 9}, 2, 999) === 11)
	}

	(function() {var this$0 = this;

		var test = {
			test: /*com1*/function(/*com2*/)/*com3-1*//*com3-2*/{return (1,//com4
				/*com5*/9+this$0.test//com6
			/*com7*/)}//com8
		}
		console.log(test.test() === 109)

		{
			var test$25 = {
				test: /*com1*/function(/*com2*/a/*com3-3*/)/*com3-4*//*com3-5*/{var a = a.a;for (var l$17 = arguments.length, rest = ARRAY$0(l$17 > 1 ? l$17 - 1 : 0),  i$17 = 1; i$17 < l$17; i$17++) rest[i$17 - 1] = arguments[i$17];return (1,//com4
					/*com5*/a+rest[0]+this$0.test//com6
				/*com7*/)}//com8
			}
			console.log(test$25.test({a: 9}, 2, 999) === 111)
		}

	}).call({test: 100})
}
