// About: objectLiteral's and destructuring transpiling

{// properties
	let A, B, C;
	let A$0 = 11, B$0 = 22, C$0 = 33;

	{
		let [{A, B, C}] = [{A: A$0, B: B$0, C: C$0}];
		console.log(A === A$0, B === B$0, C === C$0)
	}

}

{// properties & default values
	let A, B, C;
	let A$0 = 11, B$0 = 22, C$0 = 33;

	{
		let [{A = 111, B = 222, C = 333}] = [{A: A$0, B: B$0}];
		console.log(A === A$0, B === B$0, C === 333)
	}

}
