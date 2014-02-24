"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");

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

	, pre: function(node) {
		if( node.type === "TemplateLiteral" ) {
			let parent = node.$parent;

			if( parent.type === "TaggedTemplateExpression" ) {
				this.__replaceTaggedTemplateExpression(parent, node);
			}
			else {
				this.__replaceQuasiLiterals(node);
			}
		}
	}

	, cleanupTemplateString: function(templateString) {
		return templateString
			.replace(/([^\\]|^)"/g, "$1\\\"").replace(/([^\\]|^)"/g, "$1\\\"")//need it twice for `""`
			.replace(/([^\\]|^)\\`/g, "$1`").replace(/([^\\]|^)\\`/g, "$1`")//need it twice for `\`\``
			.replace(/([^\\]|^)\\\$/g, "$1$").replace(/([^\\]|^)\\\$/g, "$1$")//need it twice for `\$\$`
			.replace(/([^\\]|^)\\{/g, "$1{").replace(/([^\\]|^)\\{/g, "$1{")//need it twice for `\{\{`
		;
	}

	, __replaceTaggedTemplateExpression: function(expressionContainer, quasiContainer) {
		let quasis = quasiContainer.quasis;

		let quasiRawString = quasis.map(function(quasi) {
			return "\"" + this.cleanupTemplateString(quasi.value.raw)
				.replace(/\\n/g, "\\\\n")
				.replace(/\\t/g, "\\\\t")
				.replace(/\\r/g, "\\\\r")
			+ "\"";
		}, this).join(", ");

		let quasiCookedString = quasis.map(function(quasi) {
			return "\"" + this.cleanupTemplateString(quasi.value.cooked)
				.replace(/\n/g, "\\n")
				.replace(/\r/g, "\\r")
				.replace(/\t/g, "\\t")
			+ "\"";
		}, this).join(", ");

		let quasiString, variableNamePlaceholder;

		if( quasiRawString.length === quasiCookedString.length && quasiRawString === quasiCookedString ) {
			variableNamePlaceholder = "%" + (Math.random() * 1e9 | 0) + "name" + (Math.random() * 1e9 | 0) + "%";
			quasiString = "[" + quasiCookedString + "];" + variableNamePlaceholder + " = Object.freeze(Object.defineProperties(" + variableNamePlaceholder + ", {\"raw\": {\"value\": " + variableNamePlaceholder + "}}))";
		}
		else {
			quasiString = "Object.freeze(Object.defineProperties([" + quasiCookedString + "], {\"raw\": {\"value\": Object.freeze([" + quasiRawString + "])}}))";
		}

		let temporaryVarName = this.quasisesTmp[quasiString];
		if( !temporaryVarName ) {
			let nearestIIFENode = core.getNearestIIFENode(expressionContainer);
			if( !nearestIIFENode ) {
				nearestIIFENode = this.ast;
				assert(nearestIIFENode.type === "Program");
			}
			temporaryVarName = this.quasisesTmp[quasiString] = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$TS", quasiString, false, variableNamePlaceholder);
		}

		let resultString =
			"("
				+ temporaryVarName
				+ ", " + quasiContainer.expressions.map(function(expression) {
					return this.alter.get(expression.range[0], expression.range[1])
				}, this).join(", ")
				+ ")"
		;

		this.alter.replace(
			quasiContainer.range[0]
			, quasiContainer.range[1]
			, resultString
		);

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

			quasiString = this.cleanupTemplateString(quasi.value.raw)
				.replace(/((?:\r\n)|\n)/g, "\\\n\\n")
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
			quasiContainer.range[0]
			, quasiContainer.range[1]
			, resultString
		);
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
