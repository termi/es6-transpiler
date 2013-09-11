var a = "a", b = "b", a$1, b$1;

{
	var a$0 = 1, b$0 = 2;
	console.log((("" + (a$0 + 1)) + ("|" + b$0) + "") === "2|2")
}

{
	var a$2 = "3a", b$2 = 4;
	console.log(
		(("\"" + (a$2.toUpperCase())) + ("\"\
\n   " + (b$2 + "\\n")) + "") === "\"3A\"\n   4\\n")
}
