function test() {
	function test4(ssssss, fffffffff = [], ooooooo = []) {
		return ssssss + fffffffff + ooooooo;
	}
	{let test;}

	let test;
	for (let i ; test = false ; ) {
		let {test} = this.testtesttest((test||{}).a, (test||{}).b);
	}
	return test4(1) + test;
}
console.log(test() === "1false");
