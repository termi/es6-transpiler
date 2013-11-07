"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const traverse = require("./../lib/traverse");
const core = require("./core");
const Scope = require("./../lib/scope");
const destructuring = require("./destructuring");



function getline(node) {
	return node.loc.start.line;
}

function isConstLet(kind) {
	return kind === "const" || kind === "let";
}

function isFunction(node) {
	let type;
	return node && ((type = node.type) === "FunctionDeclaration" || type === "FunctionExpression" || type === "ArrowFunctionExpression");
}

function isForInOfWithConstLet(node) {
	return node && (node.type === "ForInStatement" || node.type === "ForOfStatement") && node.left.type === "VariableDeclaration" && isConstLet(node.left.kind);
}

function isLoop(node) {
	let type;
	return node && ((type = node.type) === "ForStatement" || type === "ForInStatement" || type === "ForOfStatement" || type === "WhileStatement" || type === "DoWhileStatement");
}

function isReference(node) {
	const parent = node.$parent;
	const parentType = parent && parent.type;

	return node.$refToScope
		|| node.type === "Identifier"
			&& !(parentType === "VariableDeclarator" && parent.id === node) // var|let|const $
			&& !(parentType === "MemberExpression" && parent.computed === false && parent.property === node) // obj.$
			&& !(parentType === "Property" && parent.key === node) // {$: ...}
			&& !(parentType === "LabeledStatement" && parent.label === node) // $: ...
			&& !(parentType === "CatchClause" && parent.param === node) // catch($)
			&& !(isFunction(parent) && parent.id === node) // function $(..
			&& !(isFunction(parent) && parent.params.indexOf(node) !== -1) // function f($)..
			&& true
	;
}

function isDeclaration(node) {
	return node && (node.$variableDeclaration === true || node.$paramDefinition === true);
}

let transformLoop_fragmentOption_functionHeadAndTail = {
	applyChanges: true
	, extend: true

	, onbefore: function() {
		let fragmentOption = this.options;
		let forVariableNode = fragmentOption.variableDeclarationNode;
		let forVariableNode_newName = fragmentOption.newName || ""
			, forVariableNode_oldName = fragmentOption.oldName || ""
		;

		let isHead = this.data === "--head--";

		if( forVariableNode && !fragmentOption.secondTime ) {
			let destructuringVariableDeclarationNode = destructuring.detectDestructuringParent(forVariableNode);

			if ( destructuringVariableDeclarationNode ) {
				forVariableNode_newName = destructuring.getDestructuringVariablesName(destructuringVariableDeclarationNode).join(", ");
				let names = [];
				destructuring.traverseDestructuringVariables(destructuringVariableDeclarationNode, function(element) {
					names.push(element.originalName || element.name);
				});
				forVariableNode_oldName = names.join(", ");
			}
			else if( forVariableNode.type === "Identifier" ) {
				forVariableNode_newName = (forVariableNode ? forVariableNode.name : void 0);
				forVariableNode_oldName = (forVariableNode ? forVariableNode.originalName : void 0);
			}
			else {
				assert(false, forVariableNode);
			}

			fragmentOption.newName = forVariableNode_newName;
			fragmentOption.oldName = forVariableNode_oldName;
			fragmentOption.variableDeclarationNode = null;//cleanup
			fragmentOption.secondTime = true;
		}

		this.data =
			isHead
				? "(function(" + (forVariableNode_oldName || "") + "){"
				: "}).call(this" + (forVariableNode_newName ? ", " + forVariableNode_newName : "") + ");"
		;
	}
};

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
		this.esprima = options.esprima;
	}

	, pre: function detectLoopClosures(node) {
		// forbidden pattern:
		// <any>* <loop> <non-fn>* <constlet-def> <any>* <fn> <any>* <constlet-ref>
		var loopNode = null;
		if( isReference(node)
			&& node.$refToScope
			&& node.$refToScope !== node.$scope
			&& isConstLet(node.$refToScope.getKind(node.name))
		) {
			// traverse nodes up towards root from constlet-def
			// if we hit a function (before a loop) - ok!
			// if we hit a loop - maybe-ouch
			// if we reach root - ok!
			for (let n = node.$refToScope.node ; ; ) {
				if (isFunction(n)) {
					// we're ok (function-local)
					return;
				} else if (isLoop(n)) {
					loopNode = n;
					// maybe not ok (between loop and function)
					break;
				}
				n = n.$parent;
				if (!n) {
					// ok (reached root)
					return;
				}
			}

			// traverse scopes from reference-scope up towards definition-scope
			// if we hit a function, ouch!
			const defScope = node.$refToScope;
			const generateIIFE = true; // TODO get from options

			if( !loopNode.$iify ) for (let s = node.$scope ; s ; s = s.parent) {
				if (s === defScope) {
					// we're ok
					return;
				} else if (isFunction(s.node)) {
					// not ok (there's a function between the reference and definition)
					// may be transformable via IIFE

					if (!generateIIFE || !isLoop(loopNode)) {
						return error(getline(node), "can't transform closure. {0} is defined outside closure, inside loop", node.name);
					}

					const variableDeclarationNode = defScope.getNode(node.name);

					// here be dragons
					// for (let x = ..; .. ; ..) { (function(){x})() } is forbidden because of current
					// spec and VM status
					if (loopNode.type === "ForStatement" && defScope.node === loopNode) {
						return error(getline(variableDeclarationNode), "Not yet specced ES6 feature. {0} is declared in for-loop header and then captured in loop closure", variableDeclarationNode.name);
					}

					// speak now or forever hold your peace
					let loopError = this.detectIifyBodyBlockers(loopNode.body, node);
					if (loopError) {
						error(getline(node), loopError);
						return;
					}

					// mark loop for IIFE-insertion
					loopNode.$iify = true;
					this.transformLoop(loopNode, node, variableDeclarationNode);
					break;
				}
			}
		}
	}

	, detectIifyBodyBlockers: function detectIifyBodyBlockers(body, node) {
		var result;

		traverse(body, {pre: function(n) {
			// if we hit an inner function of the loop body, don't traverse further
			if (isFunction(n)) {
				return false;
			}

			let err;
			if (n.type === "BreakStatement") {
				err = "can't transform loop-closure due to use of break at line " + getline(n) + ". " + node.name + " is defined outside closure, inside loop";
			} else if (n.type === "ContinueStatement") {
				err = "can't transform loop-closure due to use of continue at line " + getline(n) + ". " + node.name + " is defined outside closure, inside loop";
			} else if (n.type === "ReturnStatement") {
				err = "can't transform loop-closure due to use of return at line " + getline(n) + ". " + node.name + " is defined outside closure, inside loop";
			} else if (n.type === "Identifier" && n.name === "arguments") {
				err = "can't transform loop-closure due to use of arguments at line " + getline(n) + ". " + node.name + " is defined outside closure, inside loop";
			} else if (n.type === "VariableDeclaration" && n.kind === "var") {
				err = "can't transform loop-closure due to use of var at line " + getline(n) + ". " + node.name + " is defined outside closure, inside loop";
			} else {
				err = false;
			}

			if (err) {
				result = err;
				return false;
			}
		}});

		return result;
	}

	, transformLoop: function transformLoop(loopNode, variableNode, variableDeclarationNode) {
		const hasBlock = (loopNode.body.type === "BlockStatement");

		const insertHeadPosition = (hasBlock
			? loopNode.body.range[0] + 1// just after body {
			: loopNode.body.range[0])	// just before existing expression
		;
		const insertTailPosition = (hasBlock
			? loopNode.body.range[1] - 1// just before body }
			: loopNode.body.range[1])	// just after existing expression
		;

		let fragmentOption = Object.create(transformLoop_fragmentOption_functionHeadAndTail);
		fragmentOption.variableDeclarationNode = isForInOfWithConstLet(loopNode) && variableNode && variableDeclarationNode;

		this.alter.insert(insertHeadPosition, "--head--", fragmentOption);
		this.alter.insert(insertTailPosition, "--tail--", fragmentOption);

		this.transformLoopScope(loopNode, variableDeclarationNode, hasBlock);
	}

	, transformLoopScope: function(loopNode, variableDeclarationNode, hasBlock) {
		if( hasBlock === void 0 ) {
			hasBlock = (loopNode.body.type === "BlockStatement")
		}

		let newScope;

		// Update scope's
		if( hasBlock ) {
			loopNode.body.$scope.mutate("hoist");
			newScope = loopNode.body.$scope;
		}
		else {
			let chs = loopNode.body.$scope.children;
			newScope = new Scope({
				kind: "hoist",
				node: loopNode.body,
				parent: loopNode.body.$scope
			});
			chs.forEach(function(scope) {
				scope.parent = newScope;
			});
			loopNode.body.$scope.children = [newScope];
		}

		function setNewRefToScope(variableNode, i) {
			variableNode.$refToScope = newScope;

			if( isDeclaration(variableNode) ) {
				let refs = variableNode.$scope.getRefs(variableNode.name) || [];
				refs.forEach(setNewRefToScope);
			}
		}

		let destructuringVariableDeclarationNode = destructuring.detectDestructuringParent(variableDeclarationNode);

		if( destructuringVariableDeclarationNode ) {
			destructuring.traverseDestructuringVariables(destructuringVariableDeclarationNode, setNewRefToScope);
		}
		else if( variableDeclarationNode.type === "Identifier" ) {
			setNewRefToScope(variableDeclarationNode);
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
