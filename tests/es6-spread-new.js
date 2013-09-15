function test() {

	function test(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	function test1(_arr, ...rest) {

		let arr = [6, ...[..._arr], ...rest];

		console.log(arr.join("|") === "6|3|34|35|36|37")

		{
			let T = new test(...arr);
			console.log( T.a === 6, T.b === 3 )
		}

		{
			let arr = void 0;
			let T = new test(...(arr || [1, 2]));
			console.log( T.a === 1, T.b === 2 )
		}

		{
			let T = new test(9, ...arr);
			console.log( T.a === 9, T.b === 6, T.c === 3 )
		}

		{
			let obj = {
				test: test
			};
			let T = new obj.test(18, ...arr);
			console.log( T.a === 18, T.b === 6, T.c === 3 )
		}

		{
			let obj = {
				obj: {
					test: test
				}
			};
			let T = new obj.obj.test(27, ...arr);
			console.log( T.a === 27, T.b === 6, T.c === 3 )
		}

		{
			let T = new test(...[...(function(){ let a = 0; {let b = 1; a+=b;} {let b = 2; a+=b;} return [a] })(), ...arr]);
			console.log( T.a === 3, T.b === 6, T.c === 3 )
		}

	}
	test1([3], 34, 35, 36, 37);

}
test()