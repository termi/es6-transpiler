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

	, '::Property[method=true]': function(node) {
		const methodKey = node.key;

		this.alter.insert(methodKey.range[1], ": function");
	}

	, '::Property[shorthand=true]': function(node) {//':: :not(ObjectPattern,ArrayPattern) > Property[shorthand=true]'
		var parent = node.$parent;
		if( !isArrayPattern(parent) && !isObjectPattern(parent) ) {//filter destructuring
			const propertyKey = node.key;
			const propertyValue = node.value;

			let renamingOptions = propertyValue.$renamingOptions;
			if( renamingOptions ) {// turn off changes were made by 'letConst' transpiler
				renamingOptions.inactive = true;
			}

			this.alter.insert(propertyKey.range[1], ": " + propertyValue.name);
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
