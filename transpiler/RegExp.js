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

"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");
const polyfills = require("./polyfills");
const unicode = require("./unicode");
const regenerate = require("regenerate");

const RE_REGEXP_RANGES =
	new RegExp('\\[' +
		'(?:' +
			'(?:(?:\\\\u(\\w{4}))(?:\\\\u(\\w{4}))?)' +
			'|((?:[\\0-\\uD7FF\\uDC00-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF])+)' +
		')' +
		'\\-' +
		'(?:' +
			'(?:(?:\\\\u(\\w{4}))(?:\\\\u(\\w{4}))?)' +
			'|((?:[\\0-\\uD7FF\\uDC00-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF])+)' +
		')' +
	'\\]', 'g')
;

var plugin = module.exports = {
	reset: function() {
		this.codePointsRange_Map = {};
		this.regExpTranslation_Map = {};
		this.__alterHasThisChanges = false;
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
						newPattern = this.convertUnicodeRegExp(regExpBody);

						if ( newPattern == oldPatternEscaped ) {
							this.regExpTranslation_Map[oldPattern] = true;
						}
						else {
							this.regExpTranslation_Map[oldPattern] = newPattern;

							let oldPatternDecoded = (new Function("return '" + oldPattern + "'"))();
							if ( oldPatternDecoded != oldPatternEscaped ) {
								this.regExpTranslation_Map[oldPatternDecoded] = newPattern;
							}

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

	, convertUnicodeRegExp: function(regExpBody) {
		let self = this;

		// TODO:: [\x01-\uD7FF\uDC00-\uFFFF], [a-b-c-e] support
		// TODO:: /foo.bar/u -> /foo(?:[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF])bar/u
		// TODO:: /foo\Sbar/u -> /foo(?:[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF])bar/u
		// TODO:: /foo[\s\S]bar/u -> /foo(?:[\\s]|[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF])bar/u

		try {
			return unicode.convert(regExpBody).string
				.replace(RE_REGEXP_RANGES, function(str, code11, code12, char1, code21, code22, char2) {
					if ( code11 ) {
						code11 = parseInt(code11, 16);
						if ( code12 ) {
							char1 = String.fromCharCode(code11, parseInt(code12, 16));
						}
						else {
							char1 = String.fromCharCode(code11);
						}
					}

					if ( code21 ) {
						code21 = parseInt(code21, 16);
						if ( code22 ) {
							char2 = String.fromCharCode(code21, parseInt(code22, 16));
						}
						else {
							char2 = String.fromCharCode(code21);
						}
					}

					return self._createRegExpAstralRange(char1, char2);
				})
			;
		}
		catch(e) {
			throw new SyntaxError('Invalid regular expression: ' + e + ': ' + regExpBody);
		}
	}

	, _createRegExpAstralRange: function(fromChar, toChar) {
		let fromChar_length = fromChar.length
			, toChar_length = toChar.length
		;

		assert(fromChar_length <= 2, 'Invalid regular expression (1)');
		assert(toChar_length <= 2, 'Invalid regular expression (2)');

		let codePoint1 = fromChar.codePointAt(0)
			, codePoint2 = toChar.codePointAt(0)
		;

		if ( fromChar_length > 1 ) {
			assert(String.fromCodePoint(codePoint1) == fromChar, 'Invalid regular expression (3)');
		}
		if ( toChar_length > 1 ) {
			assert(String.fromCodePoint(codePoint2) == toChar, 'Invalid regular expression (4)');
		}

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
