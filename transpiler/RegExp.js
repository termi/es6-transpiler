// About 'y' flag
// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky
// @see http://developer.mozilla.org/es4/proposals/extend_regexps.html#y_flag
// @see http://wiki.ecmascript.org/doku.php?id=proposals:extend_regexps&s=regexp#y_flag
// @see http://mathiasbynens.be/notes/javascript-unicode#astral-ranges
// @see https://github.com/google/traceur-compiler/issues/370
// @see http://stackoverflow.com/questions/4542304/what-does-regex-flag-y-do

// About 'u' flag
// http://mathiasbynens.be/notes/javascript-unicode#regex
// https://github.com/mathiasbynens/regenerate
//  regenerate.fromCodePointRange(0x0, 0x10FFFF)
// '[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF]'

// Unicode in RegExp @see http://www.unicode.org/reports/tr18/index.html
// Unicode character class @see https://bugzilla.mozilla.org/show_bug.cgi?id=258974 | https://github.com/mathiasbynens/unicode-data
// proposals:extend_regexps @see http://wiki.ecmascript.org/doku.php?id=proposals:extend_regexps

"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");
const polyfills = require("./polyfills");
const unicode = require("./unicode");
const regenerate = require("regenerate");
const regjsparser = require("./../lib/regjsparser");
const ASTQuery = require("ASTQuery");
const StringAlter = require("./../lib/StringAlter-es5");

var plugin = module.exports = {
	reset: function() {
		this.codePointsRange_Map = {};
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
	}

	, '::Literal': function(node) {
		let lastSlashIndex, raw = node.raw;

		if ( raw[0] === "/" && (lastSlashIndex = raw.lastIndexOf("/")) !== -1 && lastSlashIndex !== 0 ) {
			let regExpBody = raw.substr(1, lastSlashIndex - 1)
				, flags = raw.substr(lastSlashIndex + 1)
				, isUnicodeFlag = flags.contains("u")
			;

			if ( flags.contains("y") || isUnicodeFlag ) {
				if ( isUnicodeFlag ) {
					let oldPattern = unicode.convert(regExpBody).string;
					let oldPatternEscaped = unicode.escape(oldPattern);

					let newPattern = this.regExpTranslation_Map[oldPattern];
					if ( newPattern === void 0 ) {
						newPattern = this.convertUnicodeRegExp(regExpBody, flags);

						if ( newPattern == oldPatternEscaped ) {
							this.regExpTranslation_Map[oldPattern] = true;
						}
						else {
							this.regExpTranslation_Map[oldPattern] = newPattern;

//							let oldPatternDecoded = (new Function("return '" + oldPattern + "'"))();
//							if ( oldPatternDecoded != oldPatternEscaped ) {
//								// TODO:: replace unicode value ('\\uXXXX') with '\uXXXX'
//								this.regExpTranslation_Map[oldPatternDecoded] = newPattern;
//							}

							this.regExpTranslation_Map[newPattern] = true;
						}
					}

					flags = "\"" + flags + "\"";

					regExpBody = oldPatternEscaped;

					if ( !this.__alterHasThisChanges ) {
						this.__alterHasThisChanges = true;

						let self = this;

						this.alter.insert(0, "(RegExp[\"__polyfill__\"]||function(){})", {onbefore: function() {
							return this.data + "(" + JSON.stringify(self.regExpTranslation_Map) + ", " + JSON.stringify(self.codePointsRange_Map) + ")";
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

			(new ASTQuery(regExpAst, 'regexp')).on(this, {prefix: ':re:'});

			let result = stringAlter.apply();
			this._reStringAlter = void 0;
			return result;
//		}
//		catch(e) {
			// TODO:: errors('Invalid regular expression: ' + e + ': ' + regExpBody) without throw
//		}
	}

	, ':re: characterClass': function(node, astQuery) {
		this._isInCharacterClass = true;

		if ( node.negative ) {
			throw new Error("Unsupported for now");
			// TODO:: astQuery.setMode('negative');
		}
	}
	, ':re: characterClassRange': function(node) {
		let needToReplace = true;

		try {
			(new RegExp("[" + node.raw + "]")).test(1);
			needToReplace = false;
		}
		catch(e){}

		if ( !needToReplace && node.min.name != "codePoint" && node.max.name != "codePoint" ) {
			return false;
		}

		node.$newRaw = this._createRegExpAstralRange(regjsparser.nodeToCharCode(node.min), regjsparser.nodeToCharCode(node.max));
	}
	, ':re: escapeChar[value=W]': function(node) {
		// The production CharacterClassEscape :: w evaluates by returning the set of characters containing the sixty-three characters:
		//	a	b	c	d	e	f	g	h	i	j	k	l	m	n	o	p	q	r	s	t	u	v	w	x	y	z
		//	A	B	C	D	E	F	G	H	I	J	K	L	M	N	O	P	Q	R	S	T	U	V	W	X	Y	Z
		//	0	1	2	3	4	5	6	7	8	9	_
		// The production CharacterClassEscape :: W evaluates by returning the set of all characters not included in the set returned by CharacterClassEscape :: w .
		let pattern = '[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|\\W';
		let replacer = '(?:' + pattern + ')';

		if(this._isInCharacterClass) {
			node.$newRaw = replacer;
		}
		else {
			this._reStringAlter.replace(node.from, node.to, replacer);
		}
	}
	, ':re: escapeChar[value=D]': function(node) {
		// The production CharacterClassEscape :: d evaluates by returning the ten-element set of characters containing the characters 0 through 9 inclusive.
		// The production CharacterClassEscape :: D evaluates by returning the set of all characters not included in the set returned by CharacterClassEscape :: d .
		let pattern = '[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|\\D';
		let replacer = '(?:' + pattern + ')';

		if(this._isInCharacterClass) {
			node.$newRaw = pattern;
		}
		else {
			this._reStringAlter.replace(node.from, node.to, replacer);
		}
	}
	, ':re: escapeChar[value=S]': function(node) {
		// The production CharacterClassEscape :: s evaluates by returning the set of characters containing the characters that are on the right-hand side of the WhiteSpace (11.2) or LineTerminator (11.3) productions.
		// TODO:: For \s: Other category “Zs” | Any other Unicode “space separator” | <USP>
		// The production CharacterClassEscape :: S evaluates by returning the set of all characters not included in the set returned by CharacterClassEscape :: s .
		let pattern = '[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|\\S';
		//alternative: '[\\0-\\x08\\x0E-\\x1F\\x21-\\x9F\\xA1-\\u2027\\u202A-\\uD7FF\\uDC00-\\uFEFE\\uFF00-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF]';
		//regenerate().addRange(0x000000, 0x10FFFF).remove(0x0009, 0x000A, 0x000B, 0x000C, 0x000D, 0x0020, 0x00A0, 0x2028, 0x2029, 0xFEFF);
		let replacer = '(?:' + pattern + ')';

		if(this._isInCharacterClass) {
			node.$newRaw = pattern;
		}
		else {
			this._reStringAlter.replace(node.from, node.to, replacer);
		}
	}
	, ':re: ^ characterClass': function(node) {
		this._isInCharacterClass = false;

		let isNegative = node.negative;
		let oldPart = "", newPart = "";
		node.classRanges.forEach(function(classRange) {
			let newRaw = classRange.$newRaw;
			if ( newRaw !== void 0 ) {
				newPart = newPart + (newPart ? "|" : "") + newRaw;
				return;
			}
			oldPart += classRange.raw;
		});

		if ( newPart ) {
			newPart = "(?:" + newPart + ")";
			if ( oldPart ) {
				newPart = "(?:" + newPart;
				oldPart = "|[" + oldPart + "])";
			}
			this._reStringAlter.replace(node.from, node.to, newPart + oldPart);
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
			result = regenerate.fromCodePointRange(codePoint1, codePoint2);

			if ( result.contains("|") ) {
				result = "(?:" + result + ")";
			}

			this.codePointsRange_Map[key] = result;
		}

		return result;
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
