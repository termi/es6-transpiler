var assert = function(a, m){ if(!a)throw new Error(m||"") }

let filter = void 0;
function test(quasis, ...expressionValues){
	var {raw} = quasis;

	assert(quasis.length);
	assert(raw.length);
	assert(quasis.length === raw.length);
	assert(expressionValues.length);

	if(quasis.length === 0)return '';

	expressionValues = expressionValues.map( filter || ((x) => `(${x})`) )

	var s = '', i = 0, len = raw.length;
	while (true) {
		s += raw[i];
		if (i + 1 === len) {
			return s;
		}
		s += expressionValues[i++];
	}
}

let name = `name`;

{// simple
	let a = test`\n<${ 40 + 2 }>\t - \n<${ name }>\t`;
	console.log(a === '\\n<(42)>\\t - \\n<(name)>\\t');

	let b = `\n${ 40 + 2 }\t - \n<${ name }>\t`;
	console.log(b === '\n42\t - \n<name>\t');

//	let c = String.raw`\n<${ 40 + 2 }>\t - \n<${ name }>\t`;
//	console.log(c === '\\n<42>\\t - \\n<name>\\t' )

	(function() {
		let a1 = test`\n<${ 1 }>\t - \n<${ 2 }>\t`;
		console.log(a1 === '\\n<(1)>\\t - \\n<(2)>\\t');

		let a2 = test`\n<{${ 3 }}>\t - \n<{${ 4 }}>\t`;
		console.log(a2 === '\\n<{(3)}>\\t - \\n<{(4)}>\\t');
	})();
}

{// nested

	filter = function safehtml(val) {
		if( Array.isArray(val) )return val.join("");
		return `${val}`.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;')
	};

	var rows = [['Unicorns', 'Sunbeams', 'Puppies'], ['<3', '<3', '<3']];
	var html = test`<table>${
		rows.map(function(row) {
			return test`<tr>${
				row.map((cell) =>
					test`<td>${cell}</td>`
				)
			}</tr>`
		})
	}</table>`;
	console.log(html === '<table><tr><td>Unicorns</td><td>Sunbeams</td><td>Puppies</td></tr><tr><td>&lt;3</td><td>&lt;3</td><td>&lt;3</td></tr></table>')
}
