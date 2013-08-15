"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");

var plugin = module.exports = {
	reset: function() {

	}

	, setup: function(changes, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.changes = changes;
		this.options = options;
	}

	, pre: function(node) {
		if( node.type === "TemplateLiteral" ) {
			this.__replaceQuasiLiterals(node);
		}
	}

	, __replaceQuasiLiterals: function(node) {
		let quasis = node.quasis
			, quasisLength = quasis.length
			, quasi
			, quasiString
			, expressions = node.expressions
			, expressionsLength = node.expressions.length
			, expression
			, expressionType
			, resultString = "("
		;

		for( let index = 0 ; index < quasisLength ; index++ ) {
			quasi = quasis[index];

			quasiString = quasi.value.raw
				.replace(/((?:\r\n)|\n)/g, "\\\n\\n")
				.replace(/([^\\]|^)"/g, "$1\\\"")
			;

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
				+ (expression ? "(" : "")
				+ "\""
				+ quasiString
				+ (expression ? ("\" + " + (expressionType === 2 ? "(" : "") + core.stringFromSrc(expression)) + (expressionType === 2 ? ")" : "") + ")" : "\"")
			);
		}

		resultString += ")";

		this.changes.push({
			start: node.range[0],
			end: node.range[1],
			str: resultString
		})
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
