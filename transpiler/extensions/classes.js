"use strict";

const assert = require("assert");

const classesExtendedTranspiler = {
	reset: function() {

	}

	, setup: function(alter, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.alter = alter;
	}

	, ':: ClassDeclaration, ClassExpression': function replaceClassBody(node, astQuery) {
		this.__currentClassName = node["$ClassName"];
	}

	, ':: XStaticProperty, XPublicProperty, XPublicMethodDefinition': function replaceClassBody(node, astQuery) {
		var nextNode = node.$nextElementSibling;
		var hasSemicolonNext = nextNode && this.alter.getRange(node.range[1], nextNode.range[0]).trim().startsWith(";");
		var isStatic = node.type == "XStaticProperty";
		var isMethod = node.type == "XPublicMethodDefinition";

		this.alter.replace(node.range[0], node.key.range[0], this.__currentClassName + (isStatic ? "" : ".prototype") + ".");

		if ( isMethod ) {
			this.alter.insertAfter(node.key.range[1], " = function");
			if ( !hasSemicolonNext ) {
				this.alter.insertAfter(node.range[1], ";");
			}
		}
		else if ( node.value == null || hasSemicolonNext ){
			this.alter.insertAfter(node.range[1], (node.value == null ? " = void 0" : "") + (hasSemicolonNext ? "" : ";"));
		}
	}
};

module.exports = classesExtendedTranspiler;
