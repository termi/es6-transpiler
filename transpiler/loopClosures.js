"use strict";

const assert = require("assert");
const is = require("simple-is");
const fmt = require("simple-fmt");
const error = require("./../lib/error");
const traverse = require("./../lib/traverse");
const core = require("./core");



function getline(node) {
	return node.loc.start.line;
}

function isConstLet(kind) {
	return is.someof(kind, ["const", "let"]);
}
function isFunction(node) {
	return is.someof(node.type, ["FunctionDeclaration", "FunctionExpression"]);
}

function isLoop(node) {
	return is.someof(node.type, ["ForStatement", "ForInStatement", "WhileStatement", "DoWhileStatement"]);
}

function isReference(node) {
	const parent = node.$parent;
	return node.$refToScope ||
		node.type === "Identifier" &&
			!(parent.type === "VariableDeclarator" && parent.id === node) && // var|let|const $
			!(parent.type === "MemberExpression" && parent.computed === false && parent.property === node) && // obj.$
			!(parent.type === "Property" && parent.key === node) && // {$: ...}
			!(parent.type === "LabeledStatement" && parent.label === node) && // $: ...
			!(parent.type === "CatchClause" && parent.param === node) && // catch($)
			!(isFunction(parent) && parent.id === node) && // function $(..
			!(isFunction(parent) && is.someof(node, parent.params)) && // function f($)..
			true;
}

//TODO:: replace LoopClosures
var plugin = module.exports = {
	reset: function() {
		this.outermostLoop = null;
		this.functions = [];
	}

	, setup: function(changes, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.changes = changes;
		this.options = options;
	}

	, pre: function detectLoopClosures(ast) {
		return;//TODO::
		traverse(ast, {pre: this.detectLoopClosuresPre, post: this.detectLoopClosuresPost});

		return false;
	}

	, detectLoopClosuresPre: function detectLoopClosuresPre(node) {
		return;//TODO::
		if (this.outermostLoop === null && isLoop(node)) {
			this.outermostLoop = node;
		}
		if (!this.outermostLoop) {
			// not inside loop
			return;
		}

		// collect function-chain (as long as we're inside a loop)
		if (isFunction(node)) {
			this.functions.push(node);
		}
		if (this.functions.length === 0) {
			// not inside function
			return;
		}

		if (isReference(node) && isConstLet(node.$refToScope.getKind(node.name))) {
			let n = node.$refToScope.node;

			// node is an identifier
			// scope refers to the scope where the variable is defined
			// loop ..-> function ..-> node

			let ok = true;
			while (n) {
//            n.print();
//            console.log("--");
				if (n === this.functions[this.functions.length - 1]) {
					// we're ok (function-local)
					break;
				}
				if (n === this.outermostLoop) {
					// not ok (between loop and function)
					ok = false;
					break;
				}
//            console.log("# " + scope.node.type);
				n = n.$parent;
//            console.log("# " + scope.node);
			}
			if (ok) {
//            console.log("ok loop + closure: " + node.name);
			} else {
				error(getline(node), "can't transform closure. {0} is defined outside closure, inside loop", node.name);
			}


			/*
			 walk the scopes, starting from innermostFunction, ending at this.outermostLoop
			 if the referenced scope is somewhere in-between, then we have an issue
			 if the referenced scope is inside innermostFunction, then no problem (function-local const|let)
			 if the referenced scope is outside this.outermostLoop, then no problem (const|let external to the loop)

			 */
		}
	}

	, detectLoopClosuresPost: function detectLoopClosuresPost(node) {
		return;//TODO::
		if (this.outermostLoop === node) {
			this.outermostLoop = null;
		}
		if (isFunction(node)) {
			this.functions.pop();
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
