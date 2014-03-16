;applyPolyfills$0();/* <[tests es6-transpiler options: {"includePolyfills":true, "polyfillsSeparator":"\/* <[tests es6-transpiler test file EOF ]> *\/"} ]> */
test1();
test2();
test3();
test4();

function test1() {
    
    // Test sticky flag.

    /*
     * calls to reportCompare invoke regular expression matches which interfere
     * with the test of the sticky flag. Collect expect and actual values prior
     * to calling reportCompare. Note setting y = /(1)/y resets the lastIndex etc.
     */
	var re = (new RegExp("(1)", "y")), re2 = /(1)/g;
	console.log(re.sticky === true, re2.sticky === false);
	console.log(re instanceof RegExp, re2 instanceof RegExp);
	console.log(re.__proto__ == RegExp.prototype, re2.__proto__ == RegExp.prototype);


    re = (new RegExp("(1)", "y"));
	var str1 = '1234561';
	var match1 = re.exec(str1);
    var expect1 = 'captures: 0::1::1; RegExp.leftContext: ""; RegExp.rightContext: "234561"';
    var actual1 = 'captures: ' + (match1 == null ? 'null' : match1.index + '::' + match1[0] + '::' + re.lastIndex) +
        '; RegExp.leftContext: "' + RegExp.leftContext +
        '"; RegExp.rightContext: "' + RegExp.rightContext + '"';

	var str2 = '1234561';
	var match2 = re.exec(str2);
    var expect2 = 'captures: null; RegExp.leftContext: ""; RegExp.rightContext: "234561"';
    var actual2 = 'captures: ' + (match2 == null ? 'null' : match2.index + '::' + match2[0] + '::' + re.lastIndex) +
        '; RegExp.leftContext: "' + RegExp.leftContext +
        '"; RegExp.rightContext: "' + RegExp.rightContext + '"';

    console.log(expect1 == actual1, ' - /(1)/y.exec("' + str1 + '") first call');
    console.log(expect2 == actual2, ' - /(1)/y.exec("' + str2 + '") second call');

    re = (new RegExp("(1)", "y"));
    re.exec(str1);

    re = (new RegExp("(1)", "y"));
    console.log(re.lastIndex == 0, 'Must be the fresh instance of RegExp');
	var str3 = '1123456';
	var match3 = re.exec(str3);
    var expect3 = 'captures: 0::1::1; RegExp.leftContext: ""; RegExp.rightContext: "123456"';
    var actual3 = 'captures: ' + (match3 == null ? 'null' : match3.index + '::' + match3[0] + '::' + re.lastIndex) +
        '; RegExp.leftContext: "' + RegExp.leftContext +
        '"; RegExp.rightContext: "' + RegExp.rightContext + '"';

	var str4 = '1123456';
	var match4 = re.exec(str4);
    var expect4 = 'captures: 0::1::2; RegExp.leftContext: "1"; RegExp.rightContext: "23456"';
    var actual4 = 'captures: ' + (match4 == null ? 'null' : match4.index + '::' + match4[0] + '::' + re.lastIndex) +
        '; RegExp.leftContext: "' + RegExp.leftContext +
        '"; RegExp.rightContext: "' + RegExp.rightContext + '"';

    console.log(expect3 == actual3, ' - /(1)/y.exec("' + str3 + '") first call');
    console.log(expect4 == actual4, ' - /(1)/y.exec("' + str4 + '") second call');
}

function test2() {
	var text = "First line\nsecond line";
	var regex = (new RegExp("^(\\S+) line\\n?", "y"));

	var match = regex.exec(text);
	console.log(match[1] === "First", "should be \"First\"");
	console.log(regex.lastIndex === 11, "should be 11");

	var match2 = regex.exec(text);
	console.log(match2[1] === "second", "should be \"second\"");
	console.log(regex.lastIndex == 22, "should be 22");

	var match3 = regex.exec(text);
	console.log(match3 === null);
}

function test3() {
	var text = "First line\nsecond line";
	var regex = (new RegExp("^(\\S+) LINE\\n?", "gyi"));
	console.log(text.replace(regex, "--") == "----");
	console.log(text.match(regex ).join('') == ["First line\n", "second line"].join(''));
}

function test4() {
	var text = "\\\u0078\\\u0078";
	var regex = (new RegExp("^\\\\\\u0078", "gyi"));
	console.log(text.match(regex).join("|") == ["\\x", "\\x"].join("|"));
}

/* <[tests es6-transpiler test file EOF ]> */

function applyPolyfills$0() {
(function(){"use strict";

var regExp_flag_u_support = false
	, regExp_flag_y_support = false
;

try {
	(new RegExp("1", "u")).test("1");
	regExp_flag_u_support = true;
}
catch(e){}

try {
	(new RegExp("1", "y")).test("1");
	regExp_flag_y_support = true;
}
catch(e){}


if( !regExp_flag_u_support || !regExp_flag_y_support ) {
	var $RegExp = RegExp
		, global = (new Function("return this"))()
		, convertUnicodeSequenceToES5Compatible
		, has__getter__support = (function(){
			try {
				var random = Math.random();
				var propName = "sentinel";
				var obj = Object.defineProperty({}, propName, {"get": function(){ return random }});
				return obj[propName] == random;
			}
			catch (e){
				return false;
			}
		})()
		, updateGlobalRegExpProperties
	;

	var extendedRegExp = function RegExp(pattern, flags) {
		var has_u_flag = false, originalPattern;
		var has_y_flag = false;

		if( flags ) {
			if( !regExp_flag_u_support && (has_u_flag = String(flags).indexOf("u") !== -1) ) {
				flags = String(flags).replace("u", "");
				originalPattern = pattern;
				pattern = convertUnicodeSequenceToES5Compatible(pattern);
			}

			if( !regExp_flag_y_support && (has_y_flag = String(flags).indexOf("y") !== -1) ) {
				flags = String(flags).replace("y", "");
				pattern = String(pattern);
				var lineStartIndex = pattern.indexOf("^");
				if( lineStartIndex === -1 || (pattern[lineStartIndex - 1] === "\\") ) {
					originalPattern = pattern;
					pattern = "^" + pattern;
				}
			}
		}

		var re = new $RegExp(pattern, flags);// new RegExp object

		if( originalPattern !== void 0 ) {
			Object.defineProperty(re, "__pattern__", {"value": originalPattern});
		}

		if( !regExp_flag_u_support ) {
			Object.defineProperty(re, "unicode", {"value": has_u_flag, "configurable": true});
		}

		if( !regExp_flag_y_support ) {
			re["sticky"] = has_y_flag;
			Object.defineProperty(re, "sticky", {"value": has_y_flag, "configurable": true});
		}

		return re;
	};
	extendedRegExp.prototype = $RegExp.prototype;
	global["RegExp"] = extendedRegExp;
	if( has__getter__support ) {
		Object.keys($RegExp).forEach(function(key) {
			var desc = Object.getOwnPropertyDescriptor($RegExp, key);

			if( desc["value"] ) {
				delete desc["value"];
				delete desc["writable"];
			}
			if( key === "leftContext" ) {
				desc["get"] = function() {
					return this["__leftContext__"] || $RegExp["leftContext"];
				};
			}
			else {
				desc["get"] = function() {
					return $RegExp[key];
				};
			}
			desc["set"] = function(value) {
				$RegExp[key] = value;
				return value;
			};

			Object.defineProperty(extendedRegExp, key, desc);
		});

	}
	else {
		var $RegExp_keys = Object.keys($RegExp);
		var len = $RegExp_keys.length;
		updateGlobalRegExpProperties = function() {
			for( var i = 0 ; i < len ; i++ ) {
				var key = $RegExp_keys[i];
				extendedRegExp[key] = $RegExp[key];
			}
			if( extendedRegExp["__leftContext__"] !== void 0 ) {
				extendedRegExp["leftContext"] = extendedRegExp["__leftContext__"];
			}
		};
		updateGlobalRegExpProperties();
	}
	if ( !regExp_flag_y_support )Object.defineProperty(extendedRegExp, "sticky", {"value": false, "enumerable": true});
	if ( !regExp_flag_u_support )Object.defineProperty(extendedRegExp, "unicode", {"value": false, "enumerable": true});

	{
		var $toString = extendedRegExp.prototype.toString;
		var newToString = function toString() {
			var result = $toString.apply(this, arguments);

			if( !regExp_flag_y_support || !regExp_flag_u_support ) {
				var originalPattern = this["__pattern__"];

				if( originalPattern !== void 0 ) {
					result = "/" + originalPattern + "/"
						+ (this.global ? "g" : "") + (this.ignoreCase ? "i" : "") + (this.multiline ? "m" : "") + (this["sticky"] ? "y" : "") + "u"
					;
				}
				else {
					if( this["sticky"] ) {
						result += "y";
					}
				}
			}

			return result;
		};

		var newProps = {
			"sticky": {"value": false, "configurable": true, "writable": true}
			, "unicode": {"value": false, "configurable": true, "writable": true}
			, "toString": {"value": newToString, "configurable": true, "writable": true}
		};

		if( regExp_flag_y_support ) {
			delete newProps["sticky"];
		}
		else {

		}

		if( regExp_flag_u_support ) {
			delete newProps["unicode"];
		}
		else {
			convertUnicodeSequenceToES5Compatible = function(pattern) {
				// TODO:: replace [\uD83D\uDCA9-\uD83D\uDCAB] to ES5 compatible string
				return pattern;
			}
		}

		Object.defineProperties(extendedRegExp.prototype, newProps);
	}

	if( !regExp_flag_y_support ) {
		var $exec = extendedRegExp.prototype.exec;
		extendedRegExp.prototype.exec = function(string) {
			var sticky = this["sticky"]
				, _global
				, lastIndex
				, leftContext
			;

			if( sticky ) {
				lastIndex = this.lastIndex;
				_global = this["global"];

				if( lastIndex != 0 ) {
					if( _global ) {
						this.lastIndex = 0;
					}

					leftContext = string.substring(0, lastIndex);
					arguments[0] = String(string).substr(lastIndex);
				}
			}

			var result = $exec.apply(this, arguments);

			if( sticky ) {
				this.lastIndex = result == null ? 0 : lastIndex + (_global ? this.lastIndex : result[0].length);
				extendedRegExp["__leftContext__"] = leftContext !== void 0 && result != null ? leftContext : void 0;
			}

			if ( updateGlobalRegExpProperties !== void 0 )updateGlobalRegExpProperties();

			return result;
		}
		var $test = extendedRegExp.prototype.test;
		extendedRegExp.prototype.test = function(string) {
			var sticky = this["sticky"]
				, _global
				, lastIndex
				, leftContext
				, result
			;

			if( sticky ) {
				lastIndex = this.lastIndex;
				_global = this["global"];

				if( lastIndex != 0 ) {
					if( _global ) {
						this.lastIndex = 0;
					}

					leftContext = string.substring(0, lastIndex);
					arguments[0] = String(string).substr(lastIndex);
				}

				result = $exec.apply(this, arguments);

				this.lastIndex = result ? lastIndex + (_global ? this.lastIndex : result[0].length) : 0;
				extendedRegExp["__leftContext__"] = leftContext !== void 0 && result != null ? leftContext : void 0;

				result = result != null;
			}
			else {
				result = $test.apply(this, arguments);
			}

			if ( updateGlobalRegExpProperties !== void 0 )updateGlobalRegExpProperties();

			return result;
		}

		{
			var globalString_prototype = global["String"].prototype;

			var $replace = globalString_prototype.replace;
			globalString_prototype.replace = function(pattern) {
				// TODO::
				return $replace.apply(this, arguments);
			}
			var $match = globalString_prototype.match;
			globalString_prototype.match = function(pattern) {
				var patternIsRegExpWithStickyFlag = pattern && typeof pattern === 'object' && pattern instanceof $RegExp && pattern["sticky"];

				if( patternIsRegExpWithStickyFlag ) {
					if( pattern.global ) {
						var result = [];
						var execRes;
						while( execRes = pattern.exec(this) ) {
							result.push(execRes[0]);
						}
						return result;
					}
					else {
						return pattern.exec(this);
					}
				}
				else {
					return $match.apply(this, arguments);
				}
			}
		}
	}
}

})();
}