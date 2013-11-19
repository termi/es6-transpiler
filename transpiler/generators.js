"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");

function isFunction(node) {
	let type;
	return node && ((type = node.type) === "FunctionDeclaration" || type === "FunctionExpression" || type === "ArrowFunctionExpression");
}

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
		if( isFunction(node) && node.generator === true ) {
			this.__replaceGenerator(node);
		}
	}

	, __replaceGenerator: function(node) {

	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
