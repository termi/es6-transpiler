
// simple generator
{
	// [[ TEST:: NOT COMPARE START ]]
	function *simpleTest() {
		yield 1;
		yield 2;
	}
	// [[ TEST:: NOT COMPARE END ]]

	let gen = simpleTest()
		, result = [gen.next().value, gen.next().value]
	;
	console.log(result.join("|") === "1|2" && (gen = gen.next()).done === true);
}

// complex generator
{
	// [[ TEST:: NOT COMPARE START ]]
	function *range(max, step) {
		var count = 0;
		step = step || 1;

		for (var i = 0; i < max; i += step) {
			count++;
			yield i;
		}

		return count;
	}
	// [[ TEST:: NOT COMPARE END ]]

	let gen = range(20, 3), info, result = [];

	while (!(info = gen.next()).done) {
		result.push(info.value);
	}

	console.log(result.join("|") === [0, 3, 6, 9, 12, 15, 18].join("|"));

}

// generator with other es6 features
// [[ TEST:: NOT COMPARE START ]]
function *test(...$args) {

	let a = $args[0];

	{
		let a = $args[1];
		yield (function()++a)();
	}

	{
		let arr = [{b: 0}, {a: 2}, {a: 3}]
		for( let {a = 2, b = 1} of arr ) {
			yield ([a, b] = [b, a])[0] + b;
		}
	}

	yield ({a}).a;
}
// [[ TEST:: NOT COMPARE END ]]
console.log([ for(x of test(5, 0)) x ].join("|") === [1, 2, 3, 4, 5].join("|"))
console.log([ ...test(5, 0) ].join("|") === [1, 2, 3, 4, 5].join("|"))

// generator and reserved words
{
	// [[ TEST:: NOT COMPARE START ]]
	function *test1() {
		var test1$ = 1;
		var $ctx = 2;
		var $args = arguments[0];
		var wrapGenerator = arguments[1];
		yield test1$;
		yield $ctx;
		yield $args;
		yield wrapGenerator;
	}
	// [[ TEST:: NOT COMPARE END ]]

	console.log([ ...test1(3, 4) ].join("|") === [1, 2, 3, 4].join("|"))
}


// [[ TEST:: PASS BELOW ]]
