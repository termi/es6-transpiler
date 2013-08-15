"use strict";

const assert = require("assert");
const core = require("./core");

const classesTranspiler = {
	reset: function() {
		this.__currentClassMethodsStatic = null;
		this.__currentClassName = null;
	}

	, setup: function(changes, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.changes = changes;

		options.applyChangesAfter = true;
	}

	, pre: function replaceClassBody(node) {
		if( node.type === "ClassDeclaration" ) {
			const changes = this.changes;

			let nodeId = node.id
				, superClass = node.superClass
				, classStr
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
				superClass = core.stringFromSrc(superClass.range[0], superClass.range[1]);
				extendedClassConstructorPostfix =
					"Object.assign(" + this.__currentClassName + ", _super);" +
					this.__currentClassName + ".prototype = Object.create(_super.prototype);" +
					this.__currentClassName + ".prototype.constructor = " + this.__currentClassName + ";"
				;
			}

			classStr += ")";

			// replace class definition
			// text change 'class A[ extends B]' => ''
			changes.push({
				start: node.range[0],
				end: node.body.range[0],
				str: classStr
			});

			//classStr = "";


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

				changes.push({
					start: classConstructor.key.range[0],
					end: classConstructor.key.range[1],
					str: "function " + this.__currentClassName
				});
				if( extendedClassConstructorPostfix ) {
					changes.push({
						start: classConstructor.range[1],
						end: classConstructor.range[1],
						str: extendedClassConstructorPostfix
					});
				}
				core.traverse(classConstructor, {pre: this.replaceClassConstructorSuper});
			}
			else {
				changes.push({
					start: node.body.range[0] + 1,
					end: (classBodyNodesCount ? node.body.body[0].range[0] : node.body.range[1]) - 1,
					str: "function " + this.__currentClassName + "() {" + (superClass ? "_super.apply(this, arguments)" : "") + "}" + (extendedClassConstructorPostfix || "") + "\n"
				});
			}


			if( classBodyNodesCount ) {
				core.traverse(node.body, {pre: this.replaceClassMethods})
			}

			changes.push({
				start: node.range[1] - 1,
				end: node.range[1] - 1,
				str: "return " + this.__currentClassName + ";"
			});

			changes.push({
				start: node.range[1],
				end: node.range[1],
				str: ")(" + (superClass || "") + ");"
			});

			this.__currentClassName = null;
			return false;
		}
		this.__currentClassName = null;
	}

	, unwrapSuperCall: function unwrapSuperCall(node, calleeNode, isStatic, property, isConstructor) {
		const changes = this.changes;
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
		changes.push({
			start: calleeNode.range[0],
			end: changesEnd,
			str: changeStr
		});
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
			const changes = this.changes;

			this.__currentClassMethodsStatic = node.static;
			if( this.__currentClassMethodsStatic === true ) {
				// text change 'method(<something>)' => 'ClassName.method(<something>)'
				changes.push({
					start: node.range[0],
					end: node.key.range[0],
					str: this.__currentClassName + "."
				});
			}
			else {
				// text change 'method(<something>)' => 'ClassName.prototype.method(<something>)'
				changes.push({
					start: node.range[0],
					end: node.key.range[0],
					str: this.__currentClassName + ".prototype."
				});
			}

			// text change 'method(<something>)' => 'method = function(<something>)'
			changes.push({
				start: node.key.range[1],
				end: node.key.range[1],
				str: " = function"
			});

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
