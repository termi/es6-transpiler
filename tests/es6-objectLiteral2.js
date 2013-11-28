// About: simple objectLiteral's transpiling

function test(a) {
	let obj = {
		a
		, res() ("_" + this.a)
	}
	return obj.res()
}
console.log(test(10) == "_10")