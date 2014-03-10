"use strict";

const assert = require("assert");
const core = require("./core");

const objectAssign =
		"Object['assign']||function(t,s){"
			+ "for(var p in s){"
				+ "if(s.hasOwnProperty(p)){"
					+ "t[p]=s[p];"
				+ "}"
			+ "}"
		+ "return t}"
	;

const classesTranspiler = {
	reset: function() {
		this.__currentClassMethodsStatic = null;
		this.__currentClassName = null;
		this.__currentSuperRefName = null;
	}

	, setup: function(alter, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.alter = alter;
	}

	, pre: function replaceClassBody(node) {
		if( node.type === "ClassDeclaration" ) {
			if( !this.__currentSuperRefName ) {
				// We need only one unique 'super' name for the entire file
				this.__currentSuperRefName = core.unique("super", true);
			}

			const nodeId = node.id
				, classBodyNodes = node.body.body
				, currentClassName = nodeId.name
				, SUPER_NAME = this.__currentSuperRefName
			;

			let classStr
				, superClass = node.superClass
				, classBodyNodesCount = classBodyNodes.length
				, insertAfterBodyBegin_string
				, classConstructor
				, extendedClassConstructorPostfix
				, objectAssignFunctionName
			;

			assert(nodeId && nodeId.type === "Identifier");

			this.__currentClassName = currentClassName;

			classStr = "var " + currentClassName + " = (function(";

			if( superClass ) {
				objectAssignFunctionName = core.bubbledVariableDeclaration(node.$scope, "ASSIGN", objectAssign);

				classStr += SUPER_NAME;
				superClass = superClass.name;

				insertAfterBodyBegin_string = objectAssignFunctionName + "(" + currentClassName + ", " + SUPER_NAME + ");";

				extendedClassConstructorPostfix =
					currentClassName
						+ ".prototype = Object.create(" + SUPER_NAME + ".prototype"
							+ ", {\"constructor\": {\"value\": " + currentClassName + ", \"configurable\": true, \"writable\": true, \"enumerable\": false} }"
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

				this.alter.replace(classConstructor.key.range[0], classConstructor.key.range[1], "function " + currentClassName);
				if( extendedClassConstructorPostfix ) {
					this.alter.insert(classConstructor.range[1], extendedClassConstructorPostfix);
				}

				core.traverse(classConstructor, {pre: this.replaceClassConstructorSuper});
			}
			else {
				this.alter.insert(
					node.body.range[0] + 1
					, "function " + currentClassName + "() {return "
						+ (superClass ? SUPER_NAME + ".apply(this, arguments)" : "this")
						+ "}" + (insertAfterBodyBegin_string || "") + (extendedClassConstructorPostfix || "")
					, {before: true}
				);
				insertAfterBodyBegin_string = null;
			}


			if( classBodyNodesCount ) {
				core.traverse(node.body, {pre: this.replaceClassMethods})
			}

			if( insertAfterBodyBegin_string ) {
				this.alter.insert(node.body.range[0] + 1, insertAfterBodyBegin_string);
			}

			// replace class definition
			// text change 'class A[ extends B]' => 'var A = (function([0$0])'
			this.alter.replace(node.range[0], node.body.range[0], classStr);

			this.alter.insert(node.range[1] - 1, ";return " + currentClassName + ";");

			this.alter.insert(node.range[1], ")(" + (superClass || "") + ");");

			this.__currentClassName = null;
			return false;
		}
		this.__currentClassName = null;
	}

	, unwrapSuperCall: function unwrapSuperCall(node, calleeNode, isStatic, property, isConstructor) {
		let superRefName = this.__currentSuperRefName;
		assert(superRefName);

		let changeStr = superRefName + (isStatic ? "" : ".prototype");
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

		// text change 'super(<some>)' => 'super$0(<some>)' (if <some> contains SpreadElement) or 'super$0.call(this, <some>)'
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
					// text change 'super.method(<some>)' => 'super$0(<some>)' (if <some> contains SpreadElement) or 'super$0.call(this, <some>)'
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
