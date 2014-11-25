// About 'y' flag
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky
// http://developer.mozilla.org/es4/proposals/extend_regexps.html#y_flag
// http://wiki.ecmascript.org/doku.php?id=proposals:extend_regexps&s=regexp#y_flag
// http://mathiasbynens.be/notes/javascript-unicode#astral-ranges
// https://github.com/google/traceur-compiler/issues/370
// http://stackoverflow.com/questions/4542304/what-does-regex-flag-y-do

// About 'u' flag
// http://mathiasbynens.be/notes/javascript-unicode#regex
// https://github.com/mathiasbynens/regenerate
//  regenerate.fromCodePointRange(0x0, 0x10FFFF)
//  '[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF]'
// http://mathiasbynens.be/notes/javascript-unicode#astral-ranges
// https://github.com/google/traceur-compiler/issues/370

// Unicode in RegExp http://www.unicode.org/reports/tr18/index.html
// Unicode character class https://bugzilla.mozilla.org/show_bug.cgi?id=258974 | https://github.com/mathiasbynens/unicode-data
// proposals:extend_regexps http://wiki.ecmascript.org/doku.php?id=proposals:extend_regexps

"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");
const polyfills = require("./polyfills");
const unicode = require("./unicode");
const regenerate = require("regenerate");
const regjsparser = require("./../lib/regjsparser");
const ASTQuery = require("astquery");
const StringAlter = require("string-alter");

var plugin = module.exports = {
	reset: function() {
		this.regExpTranslation_Map = {};
		this.__alterHasThisChanges = false;
		this._isInCharacterClass = false;
		this._reStringAlter = void 0;
		this._isNegativeCharacterClass = void 0;
	}

	, setup: function(alter, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.alter = alter;
		this.ast = ast;
		this.options = options;

		this.codePointsRange_Map = {};
	}

	, '::Literal': function(node) {
		let lastSlashIndex, raw = node.raw;

		if ( raw[0] === "/" && (lastSlashIndex = raw.lastIndexOf("/")) !== -1 && lastSlashIndex !== 0 ) {
			let regExpBody = raw.substr(1, lastSlashIndex - 1)
				, flags = raw.substr(lastSlashIndex + 1)
				, isUnicodeFlag = flags.indexOf("u") >= 0
			;

			if ( flags.indexOf("y") >= 0 || isUnicodeFlag ) {
				if ( isUnicodeFlag ) {
					let oldPattern = regExpBody;
					let oldPatternEscaped = unicode.escape(oldPattern);

					let newPattern = this.regExpTranslation_Map[oldPattern];
					if ( newPattern === void 0 ) {
						newPattern = this.convertUnicodeRegExp(regExpBody, flags);

						if ( newPattern == oldPatternEscaped ) {
							this.regExpTranslation_Map[oldPattern] = true;
						}
						else {
							this.regExpTranslation_Map[oldPattern] = newPattern;
						}
					}

					flags = "\"" + flags + "\"";

					regExpBody = oldPatternEscaped;

					if ( !this.__alterHasThisChanges ) {
						this.__alterHasThisChanges = true;

						let self = this;

						let replacer = "(RegExp[\"__polyfill__\"]||function(obj1, obj2){var arr=RegExp[\"__polyfill__\"];" +
							"if(!arr)arr=RegExp[\"__polyfill__\"]=[];" +
							"arr.push([obj1,obj2])" +
							"})"
						;

						this.alter.insert(0, replacer, {onbefore: function() {
							return this.data + "(" + JSON.stringify(self.regExpTranslation_Map) + ", " + JSON.stringify(self.codePointsRange_Map) + ");";
						}});
					}
				}
				else {
					flags = "\"" + flags + "\"";
					regExpBody = unicode.escape(regExpBody);
				}

				regExpBody = "(new RegExp(\"" + regExpBody + "\", " + flags + "))";

				unicode.markToSkip(node);

				this.alter.replace(node.range[0], node.range[1], regExpBody);

				polyfills.mark('RegExp');
			}
		}
	}

	, convertUnicodeRegExp: function(regExpBody, flags) {
//		try {
			let regExpAst = regjsparser.parse(regExpBody, flags);
			let stringAlter = this._reStringAlter = new StringAlter(regExpBody);

			let reASTQuery = new ASTQuery(regExpAst, 'regexp');
			reASTQuery.on(this, {prefix: ':re:'});
			reASTQuery.apply();
			reASTQuery.reset();

			let result = stringAlter.apply();
			this._reStringAlter = void 0;
			return result;
//		}
//		catch(e) {
			// TODO:: errors('Invalid regular expression: ' + e + ': ' + regExpBody) without throw
//		}
	}

	, ':re: escape[name=codePoint]': function(node) {
		if ( !this._isInCharacterClass ) {
			this._reStringAlter.replace(node.from, node.to, "(?:" + unicode.charCodesFromCodePoint(node.value) + ")");
		}
	}

	, ':re: characterClass': function(node, astQuery) {
		this._isInCharacterClass = true;

		if ( node.negative ) {
			astQuery.mods.add('negative');
		}
		else {
			let needToReplace = true;

			try {
				(new RegExp("[" + node.raw + "]")).test(1);
				needToReplace = false;
			}
			catch(e){}

			if ( !needToReplace ) {
				return false;
			}
		}
	}
	, ':re: ?* characterClassRange': function(node, astQuery) {
		let isNegative = astQuery.mods.indexOf("negative") >= 0;

		let needToReplace = true;

		try {
			(new RegExp("[" + node.raw + "]")).test(1);
			needToReplace = false;
		}
		catch(e){}

		if ( !needToReplace && node.min.name != "codePoint" && node.max.name != "codePoint" ) {
			return false;
		}

		let charCode1 = regjsparser.nodeToCharCode(node.min);
		let charCode2 = regjsparser.nodeToCharCode(node.max);

		if ( isNegative ) {
			if ( charCode1 >= 0x010000 && charCode1 <= 0x10FFFF && charCode2 >= 0x010000 && charCode2 <= 0x10FFFF ) {
				node.$newRaw = "";
			}
			else if ( charCode2 >= 0x010000 && charCode2 <= 0x10FFFF ) {
				node.$newRaw = node.min.raw + "-\\uFFFF";
				charCode1 = 0x010000;
			}
			else {
				throw new Error('Invalid regular expression: /' + this._reStringAlter.getSource() + '/: Range out of order in character class');
			}
		}

		node.$newRange = [charCode1, charCode2];
	}

	// The production CharacterClassEscape :: w evaluates by returning the set of characters containing the sixty-three characters:
	//	a	b	c	d	e	f	g	h	i	j	k	l	m	n	o	p	q	r	s	t	u	v	w	x	y	z
	//	A	B	C	D	E	F	G	H	I	J	K	L	M	N	O	P	Q	R	S	T	U	V	W	X	Y	Z
	//	0	1	2	3	4	5	6	7	8	9	_
	// The production CharacterClassEscape :: W evaluates by returning the set of all characters not included in the set returned by CharacterClassEscape :: w .
	, ':re: escapeChar[value=W]': function(node) {
		let pattern = '[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]';

		if(this._isInCharacterClass) {
			node.$newRaw = pattern;
		}
		else {
			this._reStringAlter.replace(node.from, node.to, '(?:' + pattern + '|\\W)');
		}
	}
	, ':re: ?negative escapeChar[value=W]': function(node) {
		node.$limited = true;// opposite of \W is \w
	}

	// The production CharacterClassEscape :: d evaluates by returning the ten-element set of characters containing the characters 0 through 9 inclusive.
	// The production CharacterClassEscape :: D evaluates by returning the set of all characters not included in the set returned by CharacterClassEscape :: d .
	, ':re: escapeChar[value=D]': function(node) {
		let pattern = '[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]';

		if(this._isInCharacterClass) {
			node.$newRaw = pattern;
		}
		else {
			this._reStringAlter.replace(node.from, node.to, '(?:' + pattern + '|\\D)');
		}
	}
	, ':re: ?negative escapeChar[value=D]': function(node) {
		node.$limited = true;// opposite of \D is \d
	}

	// The production CharacterClassEscape :: s evaluates by returning the set of characters containing the characters that are on the right-hand side of the WhiteSpace (11.2) or LineTerminator (11.3) productions.
	// TODO:: For \s: Other category “Zs” | Any other Unicode “space separator” | <USP>
	// The production CharacterClassEscape :: S evaluates by returning the set of all characters not included in the set returned by CharacterClassEscape :: s .
	, ':re: escapeChar[value=S]': function(node) {
		let pattern = '[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]';
		//alternative: '[\\0-\\x08\\x0E-\\x1F\\x21-\\x9F\\xA1-\\u2027\\u202A-\\uD7FF\\uDC00-\\uFEFE\\uFF00-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF]';
		//regenerate().addRange(0x000000, 0x10FFFF).remove(0x0009, 0x000A, 0x000B, 0x000C, 0x000D, 0x0020, 0x00A0, 0x2028, 0x2029, 0xFEFF);

		if(this._isInCharacterClass) {
			node.$newRaw = pattern;
		}
		else {
			this._reStringAlter.replace(node.from, node.to, '(?:' + pattern + '|\\S)');
		}
	}
	, ':re: ?negative escapeChar[value=S]': function(node) {
		node.$limited = true;// opposite of \S is \s
	}

	, ':re: ^ characterClass': function(node) {
		this._isInCharacterClass = false;

		let rangesMap = {};
		let oldPart = "", newPart = "";
		node.classRanges.forEach(function(classRange) {
			let newRange = classRange.$newRange;
			if ( newRange !== void 0 ) {
				delete classRange.$newRange;

				newRange = this._createRegExpAstralRange(newRange[0], newRange[1]);

				if ( rangesMap[newRange] === void 0 ) {
					newPart = newPart + (newPart ? "|" : "") + newRange;
					rangesMap[newRange] = null;
				}
				return;
			}
			else {
				let newRaw = classRange.$newRaw;
				delete classRange.$newRaw;
				if ( newRaw !== void 0 ) {
					newPart = newPart + (newPart ? "|" : "") + newRaw;
				}
			}
			oldPart += classRange.raw;
		}, this);

		if ( newPart ) {
			newPart = "(?:" + newPart + ")";
			if ( oldPart ) {
				newPart = "(?:" + newPart;
				oldPart = "|[" + oldPart + "])";
			}
			this._reStringAlter.replace(node.from, node.to, newPart + oldPart);
		}
	}

	, ':re: ^ ?negative characterClass': function(node, astQuery) {
		this._isInCharacterClass = false;
		if ( node.negative ) {
			astQuery.mods.remove('negative');
		}

		let needUnicodeSurrogatePairRange = node.classRanges.every(function(node) {
			return node.$limited !== true;
		});

		let rangesMap = {};
		let orRanges = [];
		node.classRanges.forEach(function(classRange) {
			let newRange = classRange.$newRange;
			if ( newRange ) {
				delete classRange.$newRange;
				if ( rangesMap[newRange] === void 0 ) {
					orRanges.push(newRange);
					rangesMap[newRange] = null;
				}
			}

			if ( classRange.$newRaw !== void 0 ) {
				this._reStringAlter.replace(classRange.from, classRange.to, classRange.$newRaw);
				delete classRange.$newRaw;
			}
		}, this);

		if ( needUnicodeSurrogatePairRange ) {
			let result = "";
			if ( orRanges.length ) {
				result = this._createRegExpNegativeAstralRange(orRanges);
			}
			else {
				result = "[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]";
			}

			this._reStringAlter.insertBefore(node.from, "(?:");
			this._reStringAlter.insert(node.to, "|" + result);
			this._reStringAlter.insertAfter(node.to, ")");
		}
	}

	, ':re: dot': function(node) {
		// The production Atom :: . evaluates as follows: Let A be the set of all characters except LineTerminator.
		let pattern = '[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|.';
		//alternative: '[\\0-\\x09\\x0B\\x0C\\x0E-\\u2027\\u202A-\\uD7FF\\uDC00-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF]'
		//regenerate().addRange(0x000000, 0x10FFFF).remove(0x000A, 0x000D, 0x2028, 0x2029)
		let replacer = '(?:' + pattern + ')';
		this._reStringAlter.replace(node.from, node.to, replacer);
	}

	, _createRegExpAstralRange: function(codePoint1, codePoint2) {
		let key = codePoint1 + '|' + codePoint2;
		let result = this.codePointsRange_Map[key];

		if ( result === void 0 ) {
			result = regenerate().addRange(codePoint1, codePoint2).toString();

			if ( result.indexOf("|") >= 0 ) {
				result = "(?:" + result + ")";
			}

			this.codePointsRange_Map[key] = result;
		}

		return result;
	}

	, _createRegExpNegativeAstralRange: function(ranges) {
		let key = "!" + ranges.map(function(range){ return range[0] + "|" + range[1]} ).join("!");
		let result = this.codePointsRange_Map[key];

		if ( result === void 0 ) {
			ranges = this._subtractRangesFromSurrogatePairsRange(ranges);

			let reg = new regenerate();
			ranges.forEach(function(range){ reg.addRange(range[0], range[1]); });
			/* TODO:: https://github.com/termi/es6-transpiler/issues/33 Update to Regenerate v0.6.0
			//ranges = this._subtractRangesFromSurrogatePairsRange(ranges);//<- don't need this any more
			 let reg = new regenerate();
			 reg.addRange(0, 0x10FFFF);
			 ranges.forEach(function(range){ reg.removeRange(range[0], range[1]); });
			*/

			result = reg + "";

			if ( result.indexOf("|") >= 0 ) {
				result = "(?:" + result + ")";
			}

			this.codePointsRange_Map[key] = result;
		}

		return result;
	}

	, _subtractRangesFromSurrogatePairsRange: function(ranges) {
		ranges = ranges.sort(function(a, b) {
			a = a[0];
			b = b[0];

			return a - b;
		});

		let result = [];
		let start = 0x010000, end = 0x10FFFF;

		ranges.forEach(function(range) {//TODO:: tests
			let rangeStart = range[0], rangeEnd = range[1];

			if ( rangeStart > start ) {
				result.push([start, rangeStart - 1]);
				start = rangeEnd + 1;
			}
			else if ( rangeStart <= start && rangeEnd > start ) {
				start = rangeEnd + 1;
			}
		});
		if ( start <= end ) {
			result.push([start, end]);
		}

		return result;
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
