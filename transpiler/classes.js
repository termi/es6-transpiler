"use strict";

const assert = require("assert");
const core = require("./core");

const classesTranspiler = {
	reset: function() {
		this.__currentClassMethodsStatic = null;
		this.__currentClassName = null;
	}

	, setup: function(alter, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.alter = alter;

		options.applyChangesAfter = true;
	}

	, pre: function replaceClassBody(node) {
		if( node.type === "ClassDeclaration" ) {
			let nodeId = node.id
				, superClass = node.superClass
				, classStr
				, insertAfterBodyBegin_string
				, classBodyNodes = node.body.body
				, classConstructor
				, classBodyNodesCount = classBodyNodes.length
				, extendedClassConstructorPostfix
			;

			assert(nodeId && nodeId.type === "Identifier");

			this.__currentClassName = nodeId.name;
			classStr = "var " + this.__currentClassName + " = (function(";

			if( superClass ) {
				classStr += "_super";
				superClass = this.alter.get(superClass.range[0], superClass.range[1]);

				insertAfterBodyBegin_string = "Object.assign(" + this.__currentClassName + ", _super);";

				extendedClassConstructorPostfix =
					this.__currentClassName
						+ ".prototype = Object.create(_super.prototype"
							+ ", {\"constructor\": {\"value\": " + this.__currentClassName + ", \"configurable\": true, \"writable\": true, \"enumerable\": false} }"
						+ ");"
				;
			}

			classStr += ")";

			for( let i = 0 ; i < classBodyNodesCount && !classConstructor ; i++ ) {
				classConstructor = classBodyNodes[i];
				if( classConstructor.type !== "MethodDefinition" ) {
					classConstructor = null;
				}
				else if( classConstructor.key.name !== "constructor" ) {
					classConstructor = null;
				}
			}

			if( classConstructor ) {
				classBodyNodesCount--;

				this.alter.replace(classConstructor.key.range[0], classConstructor.key.range[1], "function " + this.__currentClassName);
				if( extendedClassConstructorPostfix ) {
					this.alter.insert(classConstructor.range[1], extendedClassConstructorPostfix);
				}
				core.traverse(classConstructor, {pre: this.replaceClassConstructorSuper});
			}
			else {
				this.alter.replace(
					node.body.range[0] + 1
					, (classBodyNodesCount ? node.body.body[0].range[0] : node.body.range[1]) - 1
					, "function " + this.__currentClassName + "() {" + (superClass ? "_super.apply(this, arguments)" : "") + "}" + (extendedClassConstructorPostfix || "") + "\n"
				);
			}


			if( classBodyNodesCount ) {
				core.traverse(node.body, {pre: this.replaceClassMethods})
			}

			if( insertAfterBodyBegin_string ) {
				this.alter.insert(node.body.range[0] + 1, insertAfterBodyBegin_string);
			}

			// replace class definition
			// text change 'class A[ extends B]' => 'var A = (function([_super])'
			this.alter.replace(node.range[0], node.body.range[0], classStr);

			this.alter.insert(node.range[1] - 1, "return " + this.__currentClassName + ";");

			this.alter.insert(node.range[1], ")(" + (superClass || "") + ");");

			this.__currentClassName = null;
			return false;
		}
		this.__currentClassName = null;
	}

	, unwrapSuperCall: function unwrapSuperCall(node, calleeNode, isStatic, property, isConstructor) {
		let changeStr = "_super" + (isStatic ? "" : ".prototype");
		let callArguments = node.arguments;
		let hasSpreadElement = !isStatic && callArguments.some(function(node){ return node.type === "SpreadElement" });

		let changesEnd;
		if( (!isStatic || isConstructor) && !hasSpreadElement ) {
			changeStr += (property ? "." + property.name : "");

			if( !callArguments.length ) {
				changeStr += ".call(this)";
				changesEnd = node.range[1];
			}
			else {
				changeStr += ".call(this, ";
				changesEnd = callArguments[0].range[0];
			}
		}
		else {
			changesEnd = calleeNode.range[1];
		}

		// text change 'super(<some>)' => '_super(<some>)' (if <some> contains SpreadElement) or '_super.call(this, <some>)'
		this.alter.replace(calleeNode.range[0], changesEnd, changeStr);
	}
	
	, replaceClassConstructorSuper: function replaceClassConstructorSuper(node) {
		if( node.type === "CallExpression" ) {
			let calleeNode = node.callee;

			if( calleeNode && calleeNode.type === "Identifier" && calleeNode.name === "super" ) {
				this.unwrapSuperCall(node, calleeNode, true, null, true);
			}
		}
	}
	
	, replaceClassMethods: function replaceClassMethods(node) {
		if( node.type === "MethodDefinition" && node.key.name !== "constructor" ) {
			this.__currentClassMethodsStatic = node.static;

			if( this.__currentClassMethodsStatic === true ) {
				// text change 'method(<something>)' => 'ClassName.method(<something>)'
				this.alter.replace(node.range[0], node.key.range[0], this.__currentClassName + ".");
			}
			else {
				// text change 'method(<something>)' => 'ClassName.prototype.method(<something>)'
				this.alter.replace(node.range[0], node.key.range[0], this.__currentClassName + ".prototype.");
			}

			// text change 'method(<something>)' => 'method = function(<something>)'
			this.alter.insert(node.key.range[1], " = function");

			core.traverse(node.value, {pre: this.replaceClassMethodSuper})
		}
		this.__currentClassMethodsStatic = null;
	}
	
	, replaceClassMethodSuper: function replaceClassMethodSuper(node) {
		if( node.type === "CallExpression" ) {
			assert(typeof this.__currentClassMethodsStatic === "boolean");

			let calleeNode = node.callee;

			if( calleeNode && calleeNode.type === "MemberExpression" ) {
				let objectNode = calleeNode.object;
				if( objectNode && objectNode.type === "Identifier" && objectNode.name === "super" ) {
					// text change 'super.method(<some>)' => '_super(<some>)' (if <some> contains SpreadElement) or '_super.call(this, <some>)'
					this.unwrapSuperCall(node, objectNode, this.__currentClassMethodsStatic, calleeNode.property);
				}
			}
		}
	}
};

for(let i in classesTranspiler) if( classesTranspiler.hasOwnProperty(i) && typeof classesTranspiler[i] === "function" ) {
	classesTranspiler[i] = classesTranspiler[i].bind(classesTranspiler);
}

module.exports = classesTranspiler;
