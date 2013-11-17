
var output = [];
let i = 0;
{
	let arr = [{a: 1}, {a: 2}, {a: 3}, {a: 4}, {b: 999}];
	let output = [];

	for( let {a:f = 9} of arr )
		1,output.push(f),2

	console.log(output.join("|") === [1, 2, 3, 4, 9].join("|"))
}

{
	let arr,f;
}

{
	let arr = [1, 2, 3];
	for(let f of arr ) {
		output.push(f);
	};
	console.log(output.join("|") === "1|2|3")
}


{
	let arr = [1, 2, 3];
	for(let f of  ( arr.push(i++), arr.push(i++), arr.push(i++), arr ) ) {
		output.push(f);
	};
	console.log(output.join("|") === "1|2|3|1|2|3|0|1|2")
}

{
	let arr,f;
}