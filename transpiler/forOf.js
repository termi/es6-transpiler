"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");
const destructuring = require("./destructuring");



function isObjectPattern(node) {
	return node && node.type == 'ObjectPattern';
}

function isArrayPattern(node) {
	return node && node.type == 'ArrayPattern';
}

const getIteratorBody =
	"(v){" +
		"if(v){" +
			"if(Array.isArray(v))return 0;" +
			"if(typeof v==='object'&&typeof v['iterator']==='function')return v['iterator']();" +
		"}" +
		"throw new Error(v+' is not iterable')"+
	"};"
;

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
		if( node.type === "ForOfStatement" ) {
			this.replaceForOf(node);
		}
	}

	, replaceForOf: function(node) {
		const hasBlock = (node.body.type === "BlockStatement");

		const nodeStartsFrom = node.body.range[0]
			, nodeEndsFrom = node.body.range[1]
		;

		const insertHeadPosition = (hasBlock
			? nodeStartsFrom + 1// just after body {
			: nodeStartsFrom)	// just before existing expression
		;


		const replacementObj = this.createForOfReplacement(node, nodeStartsFrom, nodeEndsFrom, true);


		this.alter.insert(//before for of
			node.range[0]
			, replacementObj.before
			, {extend: true, applyChanges: true}
		);
		this.alter.insertBefore(//after for of body begin, but before any other insert (loop closure function start, for example)
			insertHeadPosition
			, (hasBlock ? "" : "{") + replacementObj.inner
		);
		this.alter.insertAfter(//after for of
			node.range[1]
			, (hasBlock ? "" : "}") + replacementObj.after
			, {extend: true}
		);
		this.alter.setState("replaceForOf");
		if( replacementObj.remove ) {
			// remove 'var {des, truc, turing}' from for(var {des, truc, turing} of something){  }
			this.alter.remove(
				replacementObj.remove[0]
				, replacementObj.remove[1]
			);
		}
		this.alter.replace(//instead for of declaration body: for(var a of b) -> for(var a <forOfString>)
			node.left.range[1] + 1
			, insertHeadPosition - (hasBlock ? 1 : 0)//just before {
			, replacementObj.loop + ")"
		);
		this.alter.restoreState();
	}

	, createForOfReplacement: function(node, nodeStartsFrom, nodeEndsFrom, needTemporaryVariableCleaning) {
		const getIteratorFunctionName = core.bubbledVariableDeclaration(node.$scope, "GET_ITER", getIteratorBody, true);

		const variableBlock = node.left;
		const isDeclaration = variableBlock.type === "VariableDeclaration";

		const declarations = isDeclaration ? variableBlock.declarations : null
			, declaration = isDeclaration ? declarations[0] : null
		;

		if( isDeclaration ) {
			assert(declarations.length === 1);
		}

		const variableId = isDeclaration ? declaration.id : variableBlock
			, variableIdIsDestructuring = isObjectPattern(variableId) || isArrayPattern(variableId)
			, variableInit = node.right
			, variableInitIsIdentifier = variableInit.type === "Identifier"

			, tempVars = [
				core.getScopeTempVar(nodeStartsFrom, node.$scope)	// index or iterator
				, core.getScopeTempVar(nodeStartsFrom, node.$scope)	// isArray
				, core.getScopeTempVar(nodeStartsFrom, node.$scope)	// length or current value
			]
		;

		assert(
			isDeclaration
			|| variableBlock.type === "Identifier"
			|| variableIdIsDestructuring
			, variableBlock.type + " is a wrong type for forOf left part");

		if( !variableInitIsIdentifier ) {
			tempVars.push(
				core.getScopeTempVar(nodeStartsFrom, node.$scope)// empty string or variable name
			);
		}

		let variableInitString;
		let beforeBeginString = "";//Init string


		if( variableInitIsIdentifier ) {
			variableInitString = variableInit.name;
		}
		else {
			beforeBeginString += (tempVars[3] + " = (" + this.alter.get(variableInit.range[0], variableInit.range[1]) + ");");
			variableInitString = tempVars[3];
		}

		beforeBeginString +=
			tempVars[0]
				+ " = " + getIteratorFunctionName + "(" + variableInitString + ");"
				+ tempVars[1] + " = " + tempVars[0] + " === 0;"
				+ tempVars[2] + " = (" + tempVars[1] + " ? " + variableInitString + ".length : void 0);"
		;

		let innerString

			, forOfString =
				"; " + tempVars[1] + " ? (" + tempVars[0] + " < " + tempVars[2] + ") : !(" + tempVars[2] + " = " + tempVars[0] + "[\"next\"]())[\"done\"]; "

			, initString =
				"(" + tempVars[1] + " ? " + variableInitString + "[" + tempVars[0] + "++] : " + tempVars[2] + "[\"value\"])"

			, afterString = ";" + (needTemporaryVariableCleaning ? (tempVars.join(" = ") + " = void 0;") : "")//cleanup string
		;

		if( variableIdIsDestructuring ) {
			variableInit["$raw"] = initString;
			let newDefinitions = [];
			innerString = ";" + (
				destructuring.unwrapDestructuring("var", variableId, variableInit, null, newDefinitions) + ";"
			).substr(4);//remove "var "

			assert(newDefinitions.length);

			beforeBeginString = "var " + newDefinitions.map(function(a){ return a.id.name }).join(", ") + ";" + beforeBeginString;

			delete variableInit["$raw"];
		}
		else {
			innerString = variableId.name + " = " + initString + ";";
		}

		while(tempVars.length) {
			core.setScopeTempVar(tempVars.shift(), nodeEndsFrom, node.$scope)
		}

		return {
			before: beforeBeginString
			, loop: forOfString
			, inner: innerString
			, after: afterString
			, remove: variableIdIsDestructuring ? variableBlock.range : void 0
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
