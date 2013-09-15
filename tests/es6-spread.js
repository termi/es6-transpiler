{
	let i = 0;
	let a = [];
	let b = [-2, -1, "|", ...(a.push(i++),a), "idx", i, "-", ...(a.push(i++),a), "idx", i, "-", ...(a.push(i++),a), "idx", i, "-"]

	console.log( b.join("|") === [-2, -1, "|", 0, "idx", 1, "-", 0, 1, "idx", 2, "-", 0, 1, 2, "idx", 3, "-"].join("|") )
}

{
	let a = [1, 2, 3];
	let b =
		[0, ...a, 4, ...a.reverse()];

	console.log( b.join("|") === [0, 1, 2, 3, 4, 3, 2, 1].join("|") )
}


{
	let a = [0, 1, ...[5, 6], 7, ...[8, 9]];

	console.log( a.join("|") === [0, 1, 5, 6, 7, 8, 9].join("|") )
}

function test(a, b, c) {
	console.log(a === 1, b === 2, c.join() === "3")
}
test(1, ...[...[2], [3]])
