var SLICE$0 = Array.prototype.slice;var $D$0;var a = (c = [1, 2, 3, 4, 5, 6])[0], b = c[1], c = SLICE$0.call(c, 2)
console.log(a === 1, b === 2, c.join("|") === "3|4|5|6")

{
	var a$0 = (b$0 = [1, [[[4], 3], 2]])[0], b$0 = b$0[1], c$0, d, e;
	b$0 = ($D$0 = [a$0, b$0])[0], a$0 = (d = (c$0 = $D$0[1])[0])[0][0], d = d[1], c$0 = c$0[1], $D$0;
	console.log(b$0 === 1, c$0 === 2, d === 3, a$0 === 4);
}

{
	var a$1 = (b$1 = {a: "A", b: void 0}).a, b$1 = ((b$1 = b$1.b) === void 0 ? "B" : b$1), c$1 = 22;
	b$1 = ($D$0 = {a: b$1, B: a$1}).B, a$1 = $D$0.a, $D$0;
	console.log(a$1 === "B", b$1 === "A", c$1 === 22);
}

{
	var a$2 = (c$2 = [1, 2, 3, 4, 5])[0], b$2 = c$2[1], c$2 = SLICE$0.call(c$2, 2)
	console.log(a$2 === 1, b$2 === 2, c$2.join("|") === "3|4|5");
}

{
	var a$3 = ((a$3 = (rest = [void 0, 2, 3, 4, 5])[0]) === void 0 ? 1 : a$3), c$3 = rest[2], rest = SLICE$0.call(rest, 3), b$3 = 22
	console.log(a$3 === 1, c$3 === 3, b$3 === 22, rest.join("|") === "4|5");
}

{
	var a$4, b$4, c$4, rest$0;
	a$4 = ($D$0 = [1, 2, 3, 4, 5])[0], b$4 = $D$0[1], c$4 = $D$0[2], rest$0 = SLICE$0.call($D$0, 3), $D$0;
	console.log(a$4 === 1, c$4 === 3, rest$0.join("|") === "4|5");
}
