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

function isLiteral(node) {
	let type;
	return node && (type = node.type)
		&& (type === "Literal");
}

const $defineProperty = "Object.defineProperty";
const $defineProperties = "Object.defineProperties";
const $GOPDS_P = "Object.getOwnPropertyDescriptors||function(o){" +
	"var d=Object.create(null);" +
	"for(var p in o)if(o.hasOwnProperty(p)){" +
		"d[p]={\"value\":o[p],\"enumerable\":true,\"configurable\":true,\"writable\":true};" +
	"}" +
	"return d;" +
"}";
const $GOPDS_A = "function(o){" +
	"var d=Object.create(null);" +
	"for(var p in o)if(o.hasOwnProperty(p)){" +
		"d[p]=o[p];" +
	"}" +
	"return d;" +
"}";

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

	, '::Property[computed=true]': function(node) {//':: !:not(ObjectPattern,ArrayPattern) > Property[computed=true]'
		var parent = node.$parent;
		if( !isArrayPattern(parent) && !isObjectPattern(parent)//filter destructuring
			&& !parent.$uncomputed
		) {
			parent.$uncomputed = true;

			assert(parent.type === 'ObjectExpression');

			this.replaceComputedProperties(parent);
		}
	}

	, replaceComputedProperties: function(node) {
		let properties = node.properties;
		let beforeString = '';

		let endFragment = '}';
		let computedReplacementStarted = false;

		let Object_defineProperty_name;
		let Object_defineProperties_name;
		let $GOPDS_P_name;
		let $GOPDS_A_name;

		let objectOpened = '';

		let _this = this;
		function closeOpenTag(prevProperty) {
			if ( prevProperty ) {
				_this.alter.insertAfter(prevProperty.range[1], endFragment, {extend: true});
			}
			else {
				objectOpened = '},';
			}
		}


		let property = null, prevProperty;
		for ( let i = 0, len = properties.length ; i < len ; i++ ) {
			prevProperty = property;
			property = properties[i];

			let isComputed = property.computed;

			if ( property.kind === 'get' || property.kind === 'set' ) {
				if ( property.$objectLiteral_pass ) {
					continue;
				}

				let expectedNextKind = property.kind === 'set' ? 'get' : 'set';
				let nextAccessor = !isComputed && properties[i + 1];

				if ( nextAccessor ) {
					if ( nextAccessor.computed || nextAccessor.kind !== expectedNextKind ) {
						nextAccessor = void 0;
					}
				}
				if ( nextAccessor ) {
					nextAccessor.$objectLiteral_pass = true;
				}

				closeOpenTag(prevProperty);

				if ( isComputed ) {
					computedReplacementStarted = true;

					if ( !Object_defineProperty_name ) {
						Object_defineProperty_name = core.bubbledVariableDeclaration(node.$scope, "DP", $defineProperty);
					}
					beforeString = Object_defineProperty_name + '(' + beforeString;
				}
				else {
					if ( !Object_defineProperties_name ) {
						Object_defineProperties_name = core.bubbledVariableDeclaration(node.$scope, "DPS", $defineProperties);
					}

					beforeString = Object_defineProperties_name + '(' + beforeString;

					if ( !$GOPDS_A_name ) {
						$GOPDS_A_name = core.bubbledVariableDeclaration(node.$scope, "GOPDS_A", $GOPDS_A);
					}
					this.alter.insertBefore(property.range[0], $GOPDS_A_name + '({');
				}

				let propKey = property.key;
				this.alter.remove(property.range[0], propKey.range[0]);//remove 'set ' or 'get ', or 'set [' or 'get ['
				if ( isComputed === true ) {
					this.alter.remove(propKey.bracesRange[1] - 1, propKey.bracesRange[1]);//remove ']'
				}
				this.alter.insertBefore(propKey.range[1], (isComputed ? ',' : ':') + '{"' + property.kind + '":function');

				if ( nextAccessor ) {
					let nextAccessorKey = nextAccessor.key;
					this.alter.remove(nextAccessor.range[0], nextAccessorKey.range[1]);//remove 'set <name>' or 'get <name>', or 'set [<name>' or 'get [<name>'
					if ( nextAccessor.computed === true ) {
						this.alter.remove(nextAccessorKey.bracesRange[1] - 1, nextAccessorKey.bracesRange[1]);//remove ']'
					}
					this.alter.insertBefore(nextAccessorKey.range[1], '"' + nextAccessor.kind + '":function');
					this.alter.insert(nextAccessor.range[1], ',"configurable":true,"enumerable":true}');
				}
				else {
					let propValue = property.value;
					this.alter.insert(propValue.range[1], ',"configurable":true,"enumerable":true}');
				}

				endFragment = isComputed ? ')' : '}))';
			}
			else if ( isComputed || (computedReplacementStarted && isLiteral(property.key)) ) {
				computedReplacementStarted = true;

				if ( !Object_defineProperty_name ) {
					Object_defineProperty_name = core.bubbledVariableDeclaration(node.$scope, "DP", $defineProperty);
				}

				beforeString = Object_defineProperty_name + '(' + beforeString;

				let propKey = property.key;
				if ( isComputed ) {
					this.alter.remove(propKey.bracesRange[0], propKey.bracesRange[0] + 1);//remove '['
					this.alter.remove(propKey.bracesRange[1] - 1, propKey.bracesRange[1]);//remove ']'
				}
				else {
					property.$literal = true;
				}
				this.alter.insertBefore(propKey.range[1], ',{"value"');

				let propValue = property.value;
				this.alter.insert(propValue.range[1], ',"configurable":true,"enumerable":true,"writable":true}');

				closeOpenTag(prevProperty);

				endFragment = ')';
			}
			else if ( computedReplacementStarted ) {
				if ( !Object_defineProperties_name ) {
					Object_defineProperties_name = core.bubbledVariableDeclaration(node.$scope, "DPS", $defineProperties);
				}

				beforeString = Object_defineProperties_name + '(' + beforeString;

				closeOpenTag(prevProperty);

				if ( !$GOPDS_P_name ) {
					$GOPDS_P_name = core.bubbledVariableDeclaration(node.$scope, "GOPDS_P", $GOPDS_P);
				}
				this.alter.insertBefore(property.range[0], $GOPDS_P_name + '({', {extend: true});

				endFragment = '}))';

				computedReplacementStarted = false;
			}
		}

		if ( beforeString ) {
			if ( endFragment === '}))' ) {
				endFragment = '))';
			}

			if ( property.computed === true || property.$literal === true ) {// lastProperty
				this.alter.replace(node.range[1] - 1, node.range[1], endFragment, {extend: true});//replace '}'
			}
			else {
				this.alter.insertBefore(node.range[1], endFragment, {extend: true});
			}

			this.alter.insertBefore(node.range[0], beforeString, {extend: true});
			if ( objectOpened ) {
				this.alter.insert(node.range[0] + 1, objectOpened);
			}
		}

	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
