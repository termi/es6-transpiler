"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");


function isSpreadElement(node) {
	return node && node.type === 'SpreadElement';
}

function hasSpreadArgument(node) {
	let elements;
	return node && Array.isArray(elements = (node.elements || node["arguments"])) && elements.some(isSpreadElement);
}

const callIteratorBody =
	"(v){" +
		"if(v){" +
			"if(Array.isArray(v))return v;" +
			"if(typeof v==='object'&&typeof v['iterator']==='function')return Array['from'](v);" +
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
		let type = node.type;
		if( (
				type === "CallExpression"
				|| type === "NewExpression"
				|| type === "ArrayExpression"
			)
			&& hasSpreadArgument(node)
		) {
			if ( type === "CallExpression" ) {
				this.replaceCallExpression(node);
			}
			else if ( type === "NewExpression" ) {
				this.replaceNewExpression(node);
			}
			else if ( type === "ArrayExpression" ) {
				this.replaceArrayExpression(node);
			}
		}
	}

	, replaceCallExpression: function(node) {
		const isMemberExpression = node.callee.type === "MemberExpression";
		const isSimpleMemberExpression = isMemberExpression && node.callee.object.type === "Identifier";
//		const functionNameNode = isMemberExpression ? node.callee.property : node.callee;
		let expressionString;
		let tempVar;

		if( isMemberExpression ) {
			if( isSimpleMemberExpression ) {
				expressionString =
					this.alter.get(node.callee.range[0], node.callee.range[1])
					+ ".apply("
					+ this.alter.get(node.callee.object.range[0], node.callee.object.range[1])
					+ ", "
				;
			}
			else {
				tempVar = core.getScopeTempVar(node.$scope);

				expressionString =
					"(" + tempVar + " = "
					+ this.alter.get(node.callee.object.range[0], node.callee.object.range[1])
					+ ")"
					+ core.PropertyToString(node.callee.property)
					+ ".apply(" + tempVar
					+ ", "
				;

				core.setScopeTempVar(node.$scope, tempVar);
			}
		}
		else {
			expressionString =
				this.alter.get(node.callee.range[0], node.callee.range[1])
				+ ".apply(null, "
			;
		}

		if( node["arguments"].length === 1 ) {
			const callIteratorFunctionName = core.bubbledVariableDeclaration(node.$scope, "ITER", callIteratorBody, true);
			expressionString += (
				callIteratorFunctionName
				+ "("
				+ this.alter.get(node["arguments"][0].range[0] + 3, node["arguments"][0].range[1])
				+ ")"
			);
		}
		else {
			expressionString += this.__unwrapSpread(node, node["arguments"]);
		}

		this.alter.replace(
			node.range[0]
			, node.range[1]
			, expressionString + ")"
		);
	}

	, replaceNewExpression: function(node) {
		const bindFunctionName = core.bubbledVariableDeclaration(node.$scope, "BIND", "Function.prototype.bind");

		let expressionString =
			"(" + bindFunctionName + ".apply(" + this.alter.get(node.callee.range[0], node.callee.range[1]) + ", "
			+ this.__unwrapSpread(node, node["arguments"], "null")
		;

		this.alter.replace(
			node.callee.range[0]
			, node.range[1]
			, expressionString + ")"
		);

		this.alter.insertAfter(
			node.range[1]
			, ")()"
		);
	}

	, replaceArrayExpression: function(node) {
		this.alter.replace(
			node.range[0]
			, node.range[1]
			, this.__unwrapSpread(node)
		);
	}

	,
	__unwrapSpread: function(node, elements, firstElementString) {
		elements = elements || node.elements;

		const argsLength = elements.length;
		let spreadIndex = 0;
		const callIteratorFunctionName = core.bubbledVariableDeclaration(node.$scope, "ITER", callIteratorBody, true);

		elements.some(function(arg, index) {
			if( isSpreadElement(arg) ) {
				spreadIndex = index;
				return true;
			}
		});

		firstElementString = firstElementString || "";

		let expressionString
			, nonSpreadStart
			, nonSpreadEnd = null
		;

		if( spreadIndex > 0 ) {
			expressionString =
				"["
				+ (firstElementString ? (firstElementString + ", ") : "")
				+ this.alter.get(elements[0].range[0], elements[spreadIndex - 1].range[1]) + "]"
			;
		}
		else {
			expressionString = "[" + firstElementString + "]";
		}

		expressionString += ".concat(";

		function addNonSpreadStr() {
			var str = "", nodeStart, nodeEnd, isStart = true;

			if( nonSpreadStart ) {
				str += ", [";

				if( nonSpreadEnd === null ) {
					nonSpreadEnd = nonSpreadStart;
				}

				while( (nodeStart = elements[nonSpreadStart]) === null ) {
					str += ",";
					nonSpreadStart++;
				}

				if( nonSpreadStart > nonSpreadEnd ) {
					// next element is Spread Element
				}
				else {
					while( (nodeEnd = elements[nonSpreadEnd]) === null ) {
						str += ",";
						nonSpreadEnd--;
					}

					isStart = true;
					while( nonSpreadStart <= nonSpreadEnd ) {
						str += ((isStart ? "" : ", ") + core.unwrapNode(elements[nonSpreadStart]));
						nonSpreadStart++;
						isStart = false;
					}
				}

				str += "]";

//				expressionString += (", [" + str + (nonSpreadStart !== nonSpreadEnd ? alter.get(nonSpreadStart, nonSpreadEnd) : "") + "]")
				expressionString += str;
			}

			nonSpreadStart = nonSpreadEnd = null;
		}

		for(let currentIndex = 0 ; spreadIndex < argsLength ; spreadIndex++, currentIndex++ ) {
			let arg = elements[spreadIndex]
				, isSpread = isSpreadElement(arg)
				, spreadTypeIsArrayExpression
			;

			if( isSpread ) {
				addNonSpreadStr();
			}
			else {
				if( nonSpreadStart ) {
					nonSpreadEnd = spreadIndex;
				}
				else {
					if( arg && arg.type === "Literal" ) {
						expressionString += (
							(currentIndex ? ", " : "")
							+ arg.raw
						);
					}
					else {
						nonSpreadStart = spreadIndex;
					}
				}
			}

			if( isSpread ) {
				spreadTypeIsArrayExpression = arg.argument.type === "ArrayExpression";

				expressionString += (
					(currentIndex ? ", " : "")
					+ (spreadTypeIsArrayExpression ? "" : callIteratorFunctionName + "(")
					+ this.alter.get(arg.argument.range[0], arg.argument.range[1])
					+ (spreadTypeIsArrayExpression ? "" : ")")
				);
			}
		}

		if( nonSpreadStart ) {
			addNonSpreadStr();
		}

		expressionString += ")";

		return expressionString;
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
