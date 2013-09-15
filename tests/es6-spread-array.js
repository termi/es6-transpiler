{
	let a = [1, ...[2, 3], 4, , , [5, 6],...[7]];
	console.log(a.join("|") == "1|2|3|4|||5,6|7");
}

{
	let a = [...[parseInt("1qwe")], ...(function(a = 2, b = 3){ return [a, b] })(), ...[4], 5];
	console.log(a.join("|") == "1|2|3|4|5");
}

{
	let b = [6, 7, 8];
	let a = [1,...[2, 3], 4, 5, , , ...b];
	console.log(a.join("|") == "1|2|3|4|5|||6|7|8");
}

{
	var g1 = "7", g2 = "8";
	let a = [("0", false, "1") | 0, +"2", ...[(false, "3")], +parseFloat("4.5float"), (true ? "5" : 0), ...[6, g1, g1 && g2]];
	console.log(a.join("|") == "1|2|3|4.5|5|6|7|8");
}

{
	let a = [1, ...[...[2, 3, ...[(1 ? 4 : 0), (5)]]]];
	console.log(a.join("|") == "1|2|3|4|5");
}

{
	let a =  [...[...[...[]]]] ;
	console.log(a.join("|") == "");
}