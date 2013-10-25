// About: objectLiteral's and destructuring transpiling

{// properties
	var A, B, C;
	var A$0 = 11, B$0 = 22, C$0 = 33;

	{
		var A$1 = (C$1 = ([{A: A$0, B: B$0, C: C$0}])[0]).A, B$1 = C$1.B, C$1 = C$1.C;
		console.log(A$1 === A$0, B$1 === B$0, C$1 === C$0)
	}

}

{// properties & default values
	var A$2, B$2, C$2;
	var A$0$0 = 11, B$0$0 = 22, C$0$0 = 33;

	{
		var A$3 = ((A$3 = (C$3 = ([{A: A$0$0, B: B$0$0}])[0]).A) === void 0 ? 111 : A$3), B$3 = ((B$3 = C$3.B) === void 0 ? 222 : B$3), C$3 = ((C$3 = C$3.C) === void 0 ? 333 : C$3);
		console.log(A$3 === A$0$0, B$3 === B$0$0, C$3 === 333)
	}

}
