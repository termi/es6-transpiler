var a = "a", b = "b";

{
	var a$0 = 1, b$0 = 2;
	console.log((("" + (a$0 + 1)) + ("|" + b$0) + "") === "2|2")
}

{
	var a$1 = "3a", b$1 = 4;
	console.log(
		(("\"" + (a$1.toUpperCase())) + ("\"\
\n   " + (b$1 + "\\n")) + "") === "\"3A\"\n   4\\n")
}
