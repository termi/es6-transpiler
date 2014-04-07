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
		"var $Symbol_iterator=typeof Symbol!=='undefined'&&Symbol.iterator||'@@iterator';" +
		"if(v){" +
			"if(Array.isArray(v))return f?v.slice():v;" +
			"var i,r;"+
			"if(typeof v==='object'&&typeof (f=v[$Symbol_iterator])==='function'){" +
				"i=f.call(v);r=[];" +
				"while((f=i['next']()),f['done']!==true)r.push(f['value']);" +
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

	, ':: CallExpression,NewExpression,ArrayExpression': function(node) {
		if( hasSpreadArgument(node) ) {
			let type = node.type;

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
		const calleeType = isMemberExpression && node.callee.object.type;
		const isSimpleMemberExpression = isMemberExpression && (calleeType === "Identifier" || calleeType === "ThisExpression");
//		const functionNameNode = isMemberExpression ? node.callee.property : node.callee;
		const args = node["arguments"];
		const argsLength = args.length;

		assert(argsLength);

		let expressionBefore = ""
			, expressionAfter = ""
			, expressionParams = ""
		;

		if( isMemberExpression ) {
			if( isSimpleMemberExpression ) {
				expressionAfter =
					".apply("
					+ this.alter.get(node.callee.object.range[0], node.callee.object.range[1])
					+ ", "
				;
			}
			else {
				let tempVar = core.getScopeTempVar(node.callee.object, node.$scope);

				this.alter.wrap(
					node.callee.object.range[0]
					, node.callee.object.range[1]
					, "(" + tempVar + " = "
					, ")"
				);

				expressionAfter =
					".apply(" + tempVar
					+ ", "
				;

				core.setScopeTempVar(tempVar, node, node.$scope, true);
			}
		}
		else {
			expressionAfter =
				".apply(null, "
			;

			if( node.callee.type === "FunctionExpression" ) {
				expressionBefore = "(";
				expressionAfter = ")" + expressionAfter;
			}
		}

		if( argsLength === 1 ) {
			const isSequenceExpression = args[0].type === "SequenceExpression";
			const callIteratorFunctionName = core.bubbledVariableDeclaration(node.$scope, "ITER", callIteratorBody, true);

			expressionParams = (
				callIteratorFunctionName
				+ "(" + (isSequenceExpression ? "(" : "")
				+ this.alter.get(args[0].range[0] + 3, args[0].range[1])
				+ ")" + (isSequenceExpression ? ")" : "")
			);
		}
		else {
			expressionParams += this.__unwrapSpread(node, args);
		}

		this.alter.insertBefore(
			node.callee.range[0]
			, expressionBefore
		);


		this.alter.replace(
			args.range[0]
			, args[argsLength - 1].range[1]
			, expressionAfter + expressionParams
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
			this.alter.getRange(node.range[0], node.range[1])
		;
		const lineBreaks = str.match(/[\r\n]/g) || [];
		const lineBreaksCount = lineBreaks.length;

		let arrayExpressionStr = this.__unwrapSpread(node);

		this.alter.replace(
			node.range[0]
			, node.range[1]
			, arrayExpressionStr
			, {transform: function(str) {
				const newLineBreaks = str.match(/[\r\n]/g) || [];
				const newLineBreaksCount = newLineBreaks.length;

				if ( newLineBreaksCount < lineBreaksCount ) {
					str = str + lineBreaks.slice(newLineBreaksCount).join("");
				}
				return str;
			}}
		);
	}

	,
	__unwrapSpread: function(node, elements, firstElementString) {
		elements = elements || node.elements;

		const argsLength = elements.length;
		let spreadIndex = 0;
		let callIteratorFunctionName;
		function getCallIteratorFunctionName() {
			if( !callIteratorFunctionName ) {
				callIteratorFunctionName = core.bubbledVariableDeclaration(node.$scope, "ITER", callIteratorBody, true);
			}
			return callIteratorFunctionName;
		}

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
					+ (spreadTypeIsArrayExpression ? "" : getCallIteratorFunctionName() + "(")
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
