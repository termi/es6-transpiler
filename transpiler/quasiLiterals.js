"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");

var plugin = module.exports = {
	reset: function() {

	}

	, setup: function(alter, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.alter = alter;
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
			, theOnlyOne = quasisLength === 2
		;

		if( theOnlyOne ) {
			quasisLength--;//remove tail
		}

		for( let index = 0 ; index < quasisLength ; index++ ) {
			quasi = quasis[index];

			quasiString = quasi.value.raw
				.replace(/((?:\r\n)|\n)/g, "\\\n\\n")
				.replace(/([^\\]|^)"/g, "$1\\\"")
				.replace(/([^\\]|^)"/g, "$1\\\"")//need it twice for `""`
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
			node.range[0]
			, node.range[1]
			, resultString
		);
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
