// About: simple objectLiteral's transpiling

{// properties
	let A = 1, B = 2, C = 3;

	let a = {A, B, C};
	console.log(Object.keys(a).join("|") === "A|B|C", a.A === A, a.B === B, a.C === C)
	{
		let a = {A: A, b: B, C};
		console.log(Object.keys(a).join("|") === "A|b|C", a.A === A, a.b === B, a.C === C)
		{
			let a = {A: A, B, c: C};
			console.log(Object.keys(a).join("|") === "A|B|c", a.A === A, a.B === B, a.c === C)
		}
	}
}

{// property + method (function)
	let A = 11, B = 22, C = 33;

	let a = {A(){ return A }, B: B, C};
	console.log(Object.keys(a).join("|") === "A|B|C", a.A() === A, a.B === B, a.C === C)
}

{// property + method (function) in default value
	let A = 11, B = 22, C = 33;

	function test(value = {A(){ return A }, B: B, C}) {
		return value
	}

	let a = test();
	console.log(Object.keys(a).join("|") === "A|B|C", a.A() === A, a.B === B, a.C === C)
}

// TODO:: more
