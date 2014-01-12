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
	"(v,f){" +
		"if(v){" +
			"if(Array.isArray(v))return f?v.slice():v;" +
			"var i,r;"+
			"if(typeof v==='object'&&typeof v['@@iterator']==='function'){" +
				"i=v['@@iterator'](),r=[];while((f=i['next']()),f['done']!==true)r.push(f['value']);" +
				"return r;" +
			"}" +
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
		const valueNode = node["arguments"];

		let expressionBody = this.alter.get(node.callee.range[0], node.callee.range[1]);

		if( isMemberExpression ) {
			if( isSimpleMemberExpression ) {
				expressionString =
					expressionBody
					+ ".apply("
					+ this.alter.get(node.callee.object.range[0], node.callee.object.range[1])
					+ ", "
				;
			}
			else {
				let startsFrom = node.callee.object.range[0]
					, endsFrom = node.range[1]
				;

				tempVar = core.getScopeTempVar(startsFrom, node.$scope);

				expressionString =
					"(" + tempVar + " = "
						+ this.alter.get(startsFrom, node.callee.object.range[1])
						+ ")"
						+ core.PropertyToString(node.callee.property)
						+ ".apply(" + tempVar
						+ ", "
				;

				core.setScopeTempVar(tempVar, endsFrom, node.$scope);
			}
		}
		else {
			if( node.callee.type === "FunctionExpression" ) {
				expressionBody = "(" + expressionBody + ")";
			}
			expressionString =
				expressionBody
				+ ".apply(null, "
			;
		}

		if( valueNode.length === 1 ) {
			const isSequenceExpression = valueNode[0].type === "SequenceExpression";
			const callIteratorFunctionName = core.bubbledVariableDeclaration(node.$scope, "ITER", callIteratorBody, true);
			expressionString += (
				callIteratorFunctionName
				+ "(" + (isSequenceExpression ? "(" : "")
				+ this.alter.get(valueNode[0].range[0] + 3, valueNode[0].range[1])
				+ ")" + (isSequenceExpression ? ")" : "")
			);
		}
		else {
			expressionString += this.__unwrapSpread(node, valueNode);
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
		// found new line symbols
		const str =
			this.alter._source.substring(node.range[0], node.range[1])//TODO this.alter.getSource(node.range[0], node.range[1])
		;
		const newLines = str.match(/(\n\r)|(\n)|(\r)/g);

		let arrayExpressionStr = this.__unwrapSpread(node) + (newLines ? newLines.join("") : "");
		this.alter.replace(
			node.range[0]
			, node.range[1]
			, arrayExpressionStr
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

		let spreadExpressionsCount = 0;
		let currentSpread = 0;

		for(let currentIndex = spreadIndex ; currentIndex < argsLength ; currentIndex++ ) {
			let arg = elements[currentIndex];

			if( arg && arg.type !== "Literal" && arg.type !== "Identifier" ) {
				spreadExpressionsCount++;
			}
		}

		for(let currentIndex = spreadIndex ; currentIndex < argsLength ; currentIndex++ ) {
			let arg = elements[currentIndex]
				, isSpread = isSpreadElement(arg)
				, spreadTypeIsArrayExpression
			;

			if( isSpread ) {
				addNonSpreadStr();
			}
			else {
				if( nonSpreadStart ) {
					nonSpreadEnd = currentIndex;
				}
				else {
					if( arg && arg.type === "Literal" ) {
						expressionString += (
							(currentIndex ? ", " : "")
							+ arg.raw
						);
					}
					else {
						nonSpreadStart = currentIndex;
					}
				}
			}

			if( isSpread ) {
				currentSpread++;
				spreadTypeIsArrayExpression = arg.argument.type === "ArrayExpression";
				const isSequenceExpression = arg.argument.type === "SequenceExpression";
				const forcedCopyFlag = currentSpread < spreadExpressionsCount;

				//console.log(spreadIndex, argsLength)

				expressionString += (
					(currentIndex !== spreadIndex ? ", " : "")
					+ (spreadTypeIsArrayExpression ? "" : callIteratorFunctionName + "(")
						+ (isSequenceExpression ? "(" : "")
					+ this.alter.get(arg.argument.range[0], arg.argument.range[1])
						+ (isSequenceExpression ? ")" : "")
					+ (spreadTypeIsArrayExpression ? "" : (forcedCopyFlag ? ", true" : "") + ")")
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
