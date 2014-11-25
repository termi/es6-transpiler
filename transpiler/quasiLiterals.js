/*globals module,require*/
// @see http://www.nczonline.net/blog/2012/08/01/a-critical-review-of-ecmascript-6-quasi-literals/
"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const tmpl = require("./../lib/tmpl");
const core = require("./core");
const unicode = require("./unicode");

let UUID = tmpl.generateUUID();

var plugin = module.exports = {
	reset: function() {
		this.quasisesTmp = {};
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

	, '::TemplateLiteral': function(node) {
		let parent = node.$parent;

		if( parent.type === "TaggedTemplateExpression" ) {
			this.__replaceTaggedTemplateExpression(parent, node);
		}
		else {
			this.__replaceQuasiLiterals(node);
		}
	}

	, escape: function(templateString, options) {
		options = options || {};
		let raw = options.raw
			, compat = options.compat
		;

		if ( raw ) {
			templateString = templateString.replace(/\\/g, "\\\\");
		}

		templateString = templateString
			.replace(/(")/g, function(fount, group, offset, str){
				var sFount = 0, prevChar;

				while( (prevChar = str[--offset]) === '\\' ) {
					sFount++;
				}

				return (sFount % 2 === 1 ? "" : "\\") + group;
			})
//			.replace(/\t/g, "\\t").replace(/\v/g, "\\v").replace(/\f/g, "\\f")
//			.replace(/\f/g, "\\f")
//			.replace(/\b/g, "\\b")
		;

		if ( compat ) {
			templateString = templateString.replace(/((?:\r\n)|\n)/g, "\\n");
//			templateString = templateString.replace(/((?:\r\n)|\n)/g, function(found, group) {return group === "\n" ? "\\n" : "\\r\\n";});
		}
		else {
			templateString = templateString.replace(/((?:\r\n)|\n)/g, "\\\n\\n");
//			templateString = templateString.replace(/((?:\r\n)|\n)/g, function(found, group) {return group === "\n" ? "\\\n\\n" : "\\\n\\r\\n";});
		}

		return templateString;
	}

	, cleanupTemplateString: function(templateString) {
		return templateString
//			.replace(/([^\\]|^)"/g, "$1\\\"").replace(/([^\\]|^)"/g, "$1\\\"")//need it twice for `""`
			.replace(/([^\\]|^)\\`/g, "$1`").replace(/([^\\]|^)\\`/g, "$1`")//need it twice for `\`\``
			.replace(/([^\\]|^)\\\$/g, "$1$").replace(/([^\\]|^)\\\$/g, "$1$")//need it twice for `\$\$`
			.replace(/([^\\]|^)\\{/g, "$1{").replace(/([^\\]|^)\\{/g, "$1{")//need it twice for `\{\{`
		;
	}

	, __replaceTaggedTemplateExpression: function(expressionContainer, quasiContainer) {
		let quasisCooked = []
			, quasisRaw = []
		;

		quasiContainer.quasis.forEach(function(quasi) {
			let valueNode = quasi.value, rawString = valueNode.raw;

			quasisRaw.push(rawString);

			let unicodeResult = unicode.convert(rawString);
			if ( unicodeResult.changes ) {
				unicode.markToSkip(valueNode);
				rawString = unicodeResult.string;
			}
			quasisCooked.push(rawString);
		});

		let quasiRawString = quasisRaw.map(function(quasiString) {
			return "\"" + this.escape(quasiString, {raw: true, compat: true}) + "\"";
		}, this).join(", ");

		let quasiCookedString = quasisCooked.map(function(quasiString) {
			return "\"" + this.escape(this.cleanupTemplateString(quasiString), {compat: true}) + "\"";
		}, this).join(", ");

		let quasisesTmpKey;

		if( quasiRawString.length === quasiCookedString.length && quasiRawString === quasiCookedString ) {
			quasiRawString = null;
			quasisesTmpKey = quasiCookedString;
		}
		else {
			quasisesTmpKey = quasiCookedString + "|" + quasiRawString;
		}

		let temporaryVarName = this.quasisesTmp[quasisesTmpKey];
		if( !temporaryVarName ) {
			let nearestIIFENode = core.getNearestIIFENode(expressionContainer);
			if( !nearestIIFENode ) {
				nearestIIFENode = this.ast;
				assert(nearestIIFENode.type === "Program");
			}

			const _Object_freeze = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$freeze", "Object.freeze", false);
			const _Object_defineProperties = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$defProps", "Object.defineProperties", false);

			let quasiString, variableNamePlaceholder;
			if( !quasiRawString ) {
				while ( ~quasiCookedString.indexOf(UUID) ) {// paranoiac mode: on
					UUID = tmpl.generateUUID();
				}
				variableNamePlaceholder = UUID;
				quasiString = "[" + quasiCookedString + "];" + variableNamePlaceholder + " = " + _Object_freeze + "(" + _Object_defineProperties + "(" + variableNamePlaceholder + ", {\"raw\": {\"value\": " + variableNamePlaceholder + "}}))";
			}
			else {
				quasiString = _Object_freeze + "(" + _Object_defineProperties + "([" + quasiCookedString + "], {\"raw\": {\"value\": " + _Object_freeze + "([" + quasiRawString + "])}}))";
			}

			temporaryVarName = this.quasisesTmp[quasisesTmpKey] = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$TS", quasiString, false, variableNamePlaceholder);
		}

		quasiContainer.quasis.forEach(function(quasi, index, array) {
			let isLast = array.length - 1 === index;
			let start = quasi.range[0], end = quasi.range[1];
			let lineBreaks = this.alter.getRange(start, end).match(/[\r\n]/g) || [];
			return this.alter.replace(quasi.range[0], quasi.range[1], lineBreaks.join("") + (isLast ? "" : ", "));
		}, this);

		let start = quasiContainer.range[0], end = quasiContainer.range[1];

		this.alter.insert(start, "(" + temporaryVarName);
		this.alter.insertBefore(end, ")", {extend: true});
	}

	, __replaceQuasiLiterals: function(quasiContainer) {
		let quasis = quasiContainer.quasis
			, quasisLength = quasis.length
			, quasi
			, quasiString
			, expressions = quasiContainer.expressions
			, expressionsLength = quasiContainer.expressions.length
			, expression
			, expressionType
			, resultString = "("
			, theOnlyOne = quasisLength === 2 && quasis[1].value.raw === '' && quasis[1].value.cooked === ''
		;

		if( theOnlyOne ) {
			quasisLength--;//remove tail
		}

		for( let index = 0 ; index < quasisLength ; index++ ) {
			quasi = quasis[index];

			quasiString = this.escape(this.cleanupTemplateString(quasi.value.raw));

			let unicodeResult = unicode.convert(quasiString);
			if ( unicodeResult.changes ) {
				unicode.markToSkip(quasi.value);
				quasiString = unicodeResult.string;
			}

			expression = index < expressionsLength// or checking quasi.tail === true
				? expressions[index]
				: null
			;

			expressionType = expression
				? (
					expression.type === "Identifier"
						? 1 // simple
						: 2 // compound
				)
				: null
			;

			resultString += (
				(index ? " + " : "")
				+ (expression && !theOnlyOne ? "(" : "")
				+ "\""
				+ quasiString
				+ (expression
					? ("\" + " + (expressionType === 2 ? "(" : "") + this.alter.get(expression.range[0], expression.range[1]))
						+ (expressionType === 2 ? ")" : "")
						+ (theOnlyOne ? "" : ")")
					: "\"")
			);
		}

		resultString += ")";

		this.alter.replace(
			quasiContainer.range[0]
			, quasiContainer.range[1]
			, resultString
		);
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
