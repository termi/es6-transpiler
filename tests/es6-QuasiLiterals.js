let a = "a", b = "b", a$1, b$1;

{
	let a = 1, b = 2;
	console.log(`${a + 1}|${b}` === "2|2")
}

{
	let a = "3a", b = 4;
	console.log(
		`"${a.toUpperCase()}\"
   ${b + "\\n"}` === "\"3A\"\n   4\\n")
}
