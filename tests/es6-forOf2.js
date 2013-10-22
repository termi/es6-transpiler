

var output = [];
let i = 0;
{
	let arr,f;
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
