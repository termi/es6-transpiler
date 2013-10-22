"use strict";

{
	let test = {
		test: function()1
	}
	console.log(test.test() === 1)

	{
		let test = {
			test: function({a}, ...rest)a+rest[0]
		}
		console.log(test.test({a: 1}, 2, 999) === 3)
	}
}

{
	let test = {
		test: function()(2)
	}
	console.log(test.test() === 2)

	{
		let test = {
			test: function({a}, ...rest)(a+rest[0])
		}
		console.log(test.test({a: 2}, 2, 999) === 4)
	}
}

{
	let test = {
		test: function()(1, 3)
	}
	console.log(test.test() === 3)

	{
		let test = {
			test: function({a}, ...rest)(1, a+rest[0])
		}
		console.log(test.test({a: 3}, 2, 999) === 5)
	}
}

{
	let test = {
		test: function()([3, 4])
	}
	console.log(test.test().join("|") === [3, 4].join("|"))

	{
		let test = {
			test: function({a}, ...rest)([a, rest[0]])
		}
		console.log(test.test({a: 4}, 2, 999).join("|") === [4, 2].join("|"))
	}
}

{
	let test = {
		test: function()(
			5
		)
	}
	console.log(test.test() === 5)

	{
		let test = {
			test: function({a}, ...rest)(
				a+rest[0]
			)
		}
		console.log(test.test({a: 5}, 2, 999) === 7)
	}
}

{
	let test = {
		test: function()(
			[5, 6]
		)
	}
	console.log(test.test().join("|") === [5, 6].join("|"))

	{
		let test = {
			test: function({a}, ...rest)(
				[a, rest[0]]
			)
		}
		console.log(test.test({a: 6}, 2, 999).join("|") === [6, 2].join("|"))
	}
}

{
	let test = {
		test: function/*com1*/(/*com2*/)/*com3*/(//com4
			/*com5*/7//com6
		/*com7*/)//com8
	}
	console.log(test.test() === 7)

	{
		let test = {
			test: function/*com1*/(/*com2*/{a}/*com3-1*/,/*com3-2*/...rest/*com3-3*/)/*com3-4*/(//com4
				/*com5*/a+rest[0]//com6
			/*com7*/)//com8
		}
		console.log(test.test({a: 7}, 2, 999) === 9)
	}
}

{
	let test = {
		test: function/*com1*/(/*com2*/)/*com3*/(//com4
			/*com5*/[7, 8]//com6
		/*com7*/)//com8
	}
	console.log(test.test().join("|") === [7, 8].join("|"))

	{
		let test = {
			test: function/*com1*/(/*com2*/{a}/*com3-1*/,/*com3-2*/...rest/*com3-3*/)/*com3-4*/(//com4
				/*com5*/[a, rest[0]]//com6
			/*com7*/)//com8
		}
		console.log(test.test({a: 8}, 2, 999).join("|") === [8, 2].join("|"))
	}
}

{
	let test = {
		test: function/*com1*/(/*com2*/)/*com3*/(1,//com4
			/*com5*/9//com6
		/*com7*/)//com8
	}
	console.log(test.test() === 9)

	{
		let test = {
			test: function/*com1*/(/*com2*/{a}/*com3-1*/,/*com3-2*/...rest/*com3-3*/)/*com3-4*/(1,//com4
				/*com5*/a+rest[0]//com6
			/*com7*/)//com8
		}
		console.log(test.test({a: 9}, 2, 999) === 11)
	}
}