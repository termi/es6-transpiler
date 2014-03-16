/* <[tests es6-transpiler options: {"includePolyfills":true, "polyfillsSeparator":"\/* <[tests es6-transpiler test file EOF ]> *\/"} ]> */

// @see http://mathiasbynens.be/notes/javascript-unicode#astral-ranges
// @see https://github.com/google/traceur-compiler/issues/370

{
	console.log(/foo.bar/u.test('foo?bar'));

	let re = /foo.bar/u, re2 = /foo.bar/;
	console.log(re.unicode === true, re2.unicode === false);
}

{
//	console.log(/foo.bar/u.test('foo💩bar'));
	//TODO:: console.log((new RegExp("foo(?:[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF])bar", "u")).test('foo?bar'));
//	console.log(/foo[\s\S]bar/u.test('foo💩bar'));
	//TODO:: console.log((new RegExp("foo[\\s]|(?:[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF])bar", "u")).test('foo?bar'));
}

{
	console.log(/A[\uD83D\uDCA9-\uD83D\uDCAB]/u.test('A\uD83D\uDCA9')); // match U+1F4A9

	console.log(/A[\u{1F4A9}-\u{1F4AB}]/u.test('A\u{1F4A9}')); // match U+1F4A9

	console.log(/A[💩-💫]/u.test('A💩')); // match U+1F4A9

	console.log(/B[\uD83D\uDCA9-\uD83D\uDCAB]/u.test('B\uD83D\uDCAA')); // match U+1F4AA

	console.log(/B[\u{1F4A9}-\u{1F4AB}]/u.test('B\u{1F4AA}')); // match U+1F4AA

	console.log(/B[💩-💫]/u.test('B💪'));// match U+1F4AA

	console.log(/C[\uD83D\uDCA9-\uD83D\uDCAB]/u.test('C\uD83D\uDCAB')); // match U+1F4AB

	console.log(/C[\u{1F4A9}-\u{1F4AB}]/u.test('C\u{1F4AB}')); // match U+1F4AB

	console.log(/C[💩-💫]/u.test('C💫')); // match U+1F4AB
}

{
	// case: [\u0001-\u0002\u0003]
	console.log(/D[\u0001-\uD83D\uDCAB]/u.test('D\uD83D\uDCA9'));
	// case: [a-\u0002\u0003]
	console.log(/D[a-\uD83D\uDCAB]/u.test('D\uD83D\uDCA9'));
}

{
	// or
	console.log(/OR[\u0001-\uD83D\uDCAB]|[a-\uD83D\uDCAB]/u.test('OR\uD83D\uDCA9'));
}

{ // should not match
	console.log(/A[\uD83D\uDCA9-\uD83D\uDCAB]/u.test('H\uD83D\uDCA9') === false);

	console.log(/A[\u{1F4A9}-\u{1F4AB}]/u.test('H\uD83D\uDCA9') === false);

	console.log(/A[💩-💫]/u.test('H\uD83D\uDCA9') === false);

	console.log(/A[\u0001-\uD83D\uDCAB]/u.test('H\uD83D\uDCA9') === false);

	console.log(/A[a-\uD83D\uDCAB]/u.test('H\uD83D\uDCA9') === false);
}
