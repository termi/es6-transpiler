/*globals module*/
"use strict";

const assert = require("assert");

const $__proto__support = "(function(o,t){o[\"__proto__\"]={\"a\":t};return o[\"a\"]===t})({},{})";
const $defineProperty = "Object.defineProperty";
const $defineProperties = "Object.defineProperties";
const $create = "Object.create";
const $getOwnPropertyDescriptor = "Object.getOwnPropertyDescriptor";
const objectMixinBody =	"function(t,s){"
	+ "for(var p in s){"
		+ "if(s.hasOwnProperty(p)){"
			+ "${defineProperty}(t,p,${getOwnPropertyDescriptor}(s,p));"
		+ "}"
	+ "}"
+ "return t}"
;
//const $setPrototypeOf = '(function($,o){' +
//	'if($){' +
//		'var p=false;' +//polyfilled
//		'o[\"__on_proto__\"]=function(){p=true};' +
//		'$(o,{});' +
//		'if(!p)$=Object.setPrototypeOf=function(o,p){' +
//			'var n;if(typeof (n=o[\"__on_proto__\"])===\'function\')n.call(o,p);' +
//			'return $.apply(this,arguments);' +
//		'}' +
//		'return $;' +
//	'}' +
//	'else return function(o,p){' +
//		'var n;if(typeof (n=o[\"__on_proto__\"])===\'function\')n.call(o,p);' +
//		'o[\"__proto__\"]=p;' +
//		'return o' +
//	'}' +
//'})(Object.setPrototypeOf,{})';
const $setPrototypeOf = 'Object.setPrototypeOf||' +
	'function(o,p){' +
		'if(${__proto__support}){' +
			'o[\"__proto__\"]=p;' +
		'}' +
		'else {' +
			'${defineProperty}(o,\"__proto__\",{\"value\":p,\"configurable\":true,\"enumerable\":false,\"writable\":true});' +
		'}' +
		'return o' +
	'}'
;
const $__proto__literal_support = "(function(o){return o[\"a\"]===o[\"__proto__\"][\"a\"]})({\"__proto__\":{\"a\":{}}})";
const $fix__proto__ = 'function(o,f){' +
		'if((f||!${__proto__literal_support})&&o.hasOwnProperty(\"__proto__\")){' +
			'var p=o[\"__proto__\"];' +
			'delete o[\"__proto__\"];' +
			'${setPrototypeOf}(o,p);' +
		'}' +
		'return o' +
	'}'
;

var standardVars = {
	"defineProperty": {template: $defineProperty, name: "DP"}
	, "defineProperties": {template: $defineProperties, name: "DPS"}
	, "create": {template: $create, name: "OC"}
	, "setPrototypeOf": {
		template: $setPrototypeOf
		, deps: ["defineProperty", "__proto__support"]
		, name: "SP"
	}
	, "getOwnPropertyDescriptor": {template: $getOwnPropertyDescriptor, name: "GOPD"}
	, "MIXIN": {
		template: objectMixinBody
		, deps: ["defineProperty", "getOwnPropertyDescriptor"]
	}
	, "__proto__support": {template: $__proto__support, name: "PRS"}
	, "__proto__literal_support": {template: $__proto__literal_support, name: "PRLS"}
	, "fix__proto__": {
		template: $fix__proto__
		, deps: ["__proto__literal_support", "setPrototypeOf"]
		, name: "FIX_PROTO"
	}
};

function isTheSameVarDescriptions(d1, d2) {
	return ['persistent', 'template', 'name', 'on', 'deps', 'isFunction'].every(function(name) {
		let prop1 = d1[name], prop2 = d2[name];
		let isArray1 = Array.isArray(prop1), isArray2 = Array.isArray(prop2);

		return isArray1 === isArray2
			&& isArray1
				? prop1.every(function(prop1, index) {
					return prop1 === prop2[index];
				})
				: prop1 === prop2
		;
	})
}

module.exports = {
	createVars: function(node, options) {
		assert(node && node.$scope)

		let core = this;
		let isString = typeof options === 'string';
		let resultName = isString ? options : void 0;

		if ( isString ) {
			options = {};
			options[resultName] = true;
		}
		
		options = options || {};
		let result = {};

		for ( let name in options ) if ( options.hasOwnProperty(name) ) {
			let description = standardVars[name];

			assert(description, 'can\'t fine registered variable \"' + name + '\"');

			if ( description.persistent ) {
				if ( !description.__newName ) {
					// We need only one unique name for the entire file
					description.__newName = core.unique(description.name || name, true);
				}
			}
			else if ( description.template ) {
				let template = description.template || 'void 0';

				if ( Array.isArray(description.deps) ) {
					description.deps.forEach(function(dep) {
						var obj = {};
						obj[dep] = true;

						var newName = this.createVars(node, obj)[dep];

						template = template.replace(new RegExp('\\$\\{' + dep + '\\}', 'g'), newName);
					}, this);
				}

				description.__newName = core.bubbledVariableDeclaration(node.$scope, description.name || name, template, description.isFunction);
			}

			standardVars[name] = description;

			result[name] = description.__newName;
		}

		return isString ? result[resultName] : result;
	}
	
	, registerVar: function(name, options) {
		let description = standardVars[name];
		
		if ( !description || isTheSameVarDescriptions(description, options) ) {
			standardVars[name] = options;
		}
		else {
			assert(false, 'Try to redefine the existed standard var "' + name + '"');
		}
	}
};
