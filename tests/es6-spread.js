// Important: finalize file. Do not add new tests!!!

{
	let i = 0;
	let a = [];
	let c = ["c"];
	let b = [-2, -1, "|", ...(a.push(i++),a), "idx", i, "-", ...(a.push(i++),a), "idx", i, "-", ...(a.push(i++),a), "idx", i, "-", ...c];

	console.log( b.join("|") === [-2, -1, "|", 0, "idx", 1, "-", 0, 1, "idx", 2, "-", 0, 1, 2, "idx", 3, "-", "c"].join("|") )
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

{
	let a = [...[5, 6], 7];

	let b = (  (a, b, c)  =>  [
		a, b, c
	])(...a)

	console.log(b.join("|") === [5, 6, 7].join("|"))
}

{
	let a = [...[9, void 0], void 0, 6, 5, 4];

	let b = (  (a = 9, b = 8, c = 7, ...rest)  =>  [
		a, b, c, ...rest
	])(...a)

	console.log(b.join("|") === [9, 8, 7, 6, 5, 4].join("|"))
}
