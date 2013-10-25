"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");



function isObjectPattern(node) {
	return node && node.type === 'ObjectPattern';
}

function isArrayPattern(node) {
	return node && node.type === 'ArrayPattern';
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
		if( node.type === "Property" ) {
			if( node.method === true) {
				this.replaceMethod(node);
			}
			else if( node.shorthand === true) {
				var parent = node.$parent;
				if( !isArrayPattern(parent)
					&& !isObjectPattern(parent)
//					&& !isArrayPattern(parent.$parent)
//					&& !isObjectPattern(parent.$parent)
				) {//filter destructuring
					this.replaceShorthand(node);
				}
			}
		}
	}

	, replaceMethod: function(node) {
		const methodKey = node.key;

		this.alter.insert(methodKey.range[1], ": function");
	}

	, replaceShorthand: function(node) {
		const propertyKey = node.key;
		const propertyValue = node.value;

		this.alter.insert(propertyKey.range[1], ": " + propertyValue.name);
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
