/**
 * '\u0456' (raw '\\u0456') -> 'i' and etc
 * @param escapedString
 */
function unescapeUnicode(escapedString) {
	return escapedString.replace(/\\u(\w{4})/g, (found, charCode, offset, string) => {
		let prev1 = string[offset - 1],  prev2 = string[offset - 2];
		if ( prev1 === '\\' && prev2 !== '\\' ) {
			return found;
		}

		return String.fromCharCode(parseInt(charCode, 16));
	});
};

module.export = unescapeUnicode;

//test:
//str = 'qwe\\\\\\\\\\u0023 \\\\\\u0024 \\\\u0024 \\u0025\\u0026 '.replace(/\\u(\w{4})/g, function(found, charCode, offset, string) {
//	var prev1 = string[offset - 1],  prev2 = string[offset - 2];
//	if ( prev1 === '\\' && prev2 !== '\\' )return found;
//
//	return String.fromCharCode(parseInt(charCode, 16));
//})