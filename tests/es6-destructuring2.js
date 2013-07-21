let [a, b, ...c] = [1, 2, 3, 4, 5, 6]
console.log(a === 1, b === 2, c.join("|") === "3|4|5|6")

{
	let [a, b] = [1, [[[4], 3], 2]], c, d, e;
	[b, [[[a], d],c]] = [a, b];
	console.log(b === 1, c === 2, d === 3, a === 4);
}

{
	let {a, b} = {a: "A", b: "B"};
	({B: b, a}) = {a: b, B: a};
	console.log(a === "B", b === "A");
}

{
	let [a, b, ...c] = [1, 2, 3, 4, 5]
	console.log(a === 1, b === 2, c.join("|") === "3|4|5");
}

{
	let [a = 1, , b, ...c] = [void 0, 2, 3, 4, 5]
	console.log(a === 1, b === 3, c.join("|") === "4|5");
}
