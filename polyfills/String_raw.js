if ( !String.raw )String.raw = function raw(quasis) {
	let {"raw": raw} = quasis
		, len = raw.length >>> 0
	;
	
	if (len === 0) return '';
	
	let s = '', i = 0;
	while (true) {
		s += raw[i];
		if (i + 1 === len) return s;
		s += arguments[++i];
	}
} 