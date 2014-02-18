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

{// compound with spread inside
	let a = "a", b = "b";
	function test(...rest) {
		return rest.join("\n");
	}
	let string = `a = ${a} | bb = ${b + b} | function call = ${test(...[a, b, "c", ...["d"]])}`;
	console.log(string === "a = a | bb = bb | function call = a\nb\nc\nd");
}

{// compound with object literals inside
	let a = "a", b = "b";
	let string = `{a, b} = ${JSON.stringify({a, b})} | {A: a, B: b} = ${JSON.stringify({A: a, B: b})} | {a, b, method}.method() = ${{a, b, method(){ return "c" }}.method()}`;
	console.log(string === '{a, b} = {"a":"a","b":"b"} | {A: a, B: b} = {"A":"a","B":"b"} | {a, b, method}.method() = c');
}

{// special symbols
	let n = `\n`, t = `\t`, r = `\r`, q1 = `"`, q2 = `'`, q1q1 = `""`, q2q2 = `''`, q1_q1q1 = `"\""`, q2_q2q2 = `'\''`;
	let string = `${n}|${t}|${r}|${q1}|${q2}|${q1q1}|${q2q2}|${q1_q1q1}|${q2_q2q2}`;
	console.log(string === "\n|\t|\r|\"|'|\"\"|''|\"\"\"|'''");
}

{// just toString
	let obj = {toString(){ return [3, 2, 1].join("") }};
	console.log( `${obj}`.split("").join("") === "321" )
}
