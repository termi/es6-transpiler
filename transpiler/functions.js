"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");
const destructuring = require("./destructuring");



function getline(node) {
	return node.loc.start.line;
}

function isFunction(node) {
	let type;
	return node && ((type = node.type) === "FunctionDeclaration" || type === "FunctionExpression" || type === "ArrowFunctionExpression");
}
function isObjectPattern(node) {
	return node && node.type == 'ObjectPattern';
}

function isArrayPattern(node) {
	return node && node.type == 'ArrayPattern';
}

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

	, pre: function functionDestructuringAndDefaultsAndRest(node) {
		if ( isFunction(node) ) {
			const functionBody = node.body;

			const isArrowFunction = node.type === "ArrowFunctionExpression";
			const isNakedFunction = node.expression === true;//isArrowFunction && functionBody.type !== "BlockStatement";
			const fnBodyIsNotABlockStatement = isNakedFunction && functionBody.type !== "BlockStatement";
			const fnBodyIsSequenceExpression = fnBodyIsNotABlockStatement && functionBody.type === "SequenceExpression";
			const fnBodyHasHiddenBrackets =
				fnBodyIsNotABlockStatement && !fnBodyIsSequenceExpression && node.range[1] != functionBody.range[1];//(x) => (x+1), '(' and ')' in '(x+1)' is hidden brackets

			const defaults = node.defaults;
			const params = node.params;
			const rest = node.rest;
			let paramsCount = params.length;
			const initialParamsCount = paramsCount;
			let fnBodyStart = core.__getNodeBegin(node)
				, fnBodyEnd = functionBody.range[1]
			;
			const defaultsCount = defaults.length;
			const lastParam = params[paramsCount - 1];
			const lastDflt = defaults[defaultsCount - 1];

			const fnHasNoParams = paramsCount === 0 && !rest;

			let insertIntoBodyBegin = "", insertIntoBodyEnd = "";

			let doesThisInsideArrowFunction;

			paramsCount -= defaultsCount;

			if( isNakedFunction || isArrowFunction ) {
				if( fnBodyHasHiddenBrackets || isArrowFunction || fnBodyIsSequenceExpression ) {
					// find '=>' (isArrowFunction) or '=>(' (isArrowFunction && fnBodyHasHiddenBrackets) or first '(' (fnBodyHasHiddenBrackets)
					let left;

					let lastDefinition = rest || (lastDflt || lastParam);

					if( lastDefinition ) {
						left = lastDefinition.range[1];
					}
					else {// function without params
						if( node.id ) {
							left = node.id.range[1]
						}
						else {
							left = node.range[0] + (
								isArrowFunction ? 1//pass first '('
									: 8 //pass 'function' + [' '<name>]
								)
							;
						}
					}

					let str = this.alter.get(left, fnBodyStart);

					if( isArrowFunction ) {
						doesThisInsideArrowFunction = node.$scope.doesThisUsing();

						// add "function" word before arrow function params list
						this.alter.insert(
							node.range[0]
							, (doesThisInsideArrowFunction ? "(" : "") + "function"
						);
					}

					// remove '=>' (isArrowFunction) or '=>(' (isArrowFunction && fnBodyHasHiddenBrackets) or first '(' (fnBodyHasHiddenBrackets)
					this.alter.replace(//TODO:: use this.alter.transform(functionBody.range[1], node.range[1], function(){});
						left
						, fnBodyStart
						, str
						, {
							transformUniq: 1
							, transform: function(str) {
								if( isArrowFunction ) {
									str = str.replace(/=>/gi, "");
								}

								if( fnBodyIsSequenceExpression || fnBodyHasHiddenBrackets ) {
									// =>   (   <function body>
									// or Remove first '(' for fnBodyHasHiddenBrackets == true
									str =
										(isArrowFunction ? ""
											: (fnHasNoParams ? "(" : "")//add first '(' for non-arrow function declaration without parameters
										)
										+ str.replace(/\(/gi, "")
									;
								}

								return str
							}
						}
					);
				}

				if( isNakedFunction ) {
					if( fnBodyIsSequenceExpression ) {
						// ()=>( <function body> )
						fnBodyEnd = node.range[1];
					}
					// add { and }
					this.alter.insertBefore(fnBodyStart, "{", {extend: true});
					this.alter.insert(fnBodyEnd, "}", {extend: true});

					if( fnBodyHasHiddenBrackets ) {
						// => (1)   ->   {return 1}
						//  Remove last ')'
						//
						this.alter.replace(//TODO:: use this.alter.transform(functionBody.range[1], node.range[1], function(){});
							functionBody.range[1]
							, node.range[1]
							, this.alter.get(functionBody.range[1], node.range[1])
							, {
								transformUniq: 2
								, transform: function(str) {
									// =>   (   <function body>
									// or Remove first '(' for fnBodyHasHiddenBrackets == true

									return str.replace(/\)/gi, " ");
								}
							}
						);
					}
				}
			}

			if( paramsCount ) {
				for(let i = 0 ; i < paramsCount ; i++) {
					const param = params[i];
					const prevParam = params[i - 1];

					if( isObjectPattern(param) || isArrayPattern(param) ) {
						let newParamName = core.unique("$D", true);
						let paramStr =
							destructuring.unwrapDestructuring(
								"var"
								, param
								, {type: "Identifier", name: newParamName}
							) + ";"
						;

						param.$replaced = true;

						// add
						insertIntoBodyBegin += paramStr;

						// cleanup
						this.alter.replace(
							(prevParam ? prevParam.range[1] + 1 : param.range[0]) - (prevParam ? 1 : 0)
							, param.range[1]
							, (i === 0 ? "" : ", ") + newParamName
						);
					}
				}
			}

			if( defaultsCount ) {
				for(let i = 0 ; i < defaultsCount ; i++) {
					const paramIndex = initialParamsCount - defaultsCount + i;
					const param = params[paramIndex];
					const prevDflt = defaults[i - 1];
					const prevParam = params[paramIndex - 1];
					const dflt = defaults[i];

					if (dflt.type === "Identifier" && dflt.name === param.name) {
						error(getline(node), "function parameter '{0}' defined with default value refered to scope variable with the same name '{0}'", param.name);
					}

					let defaultStr;
					if( isObjectPattern(param) || isArrayPattern(param) ) {
						defaultStr =
							destructuring.unwrapDestructuring(
								"var"
								, param
								, {type: "Identifier", name: "(arguments[" + paramIndex + "] !== void 0 ? arguments[" + paramIndex + "] : " + this.alter.get(dflt.range[0], dflt.range[1]) + ")"}
							) + ";"
						;
					}
					else {
						defaultStr = "var "
							+ core.definitionWithDefaultString(param, "arguments[" + paramIndex + "]", this.alter.get(dflt.range[0], dflt.range[1]))
							+ ";"
					}

					param.$replaced = true;

					// add default set
					insertIntoBodyBegin += defaultStr;

					// cleanup default definition
					// text change 'param = value' into ''
					this.alter.remove(
						((prevDflt || prevParam) ? ((prevDflt || prevParam).range[1] + 1) : param.range[0]) - (prevParam ? 1 : 0)
						, dflt.range[1]
					);
				}
			}

			if( rest ) {
				const restStr = "var " + core.unwrapSpreadDeclaration(rest, "arguments", initialParamsCount) + ";";

				node.$scope.closestHoistScope().add(rest.name, "var", rest, -1);

				// add rest
				insertIntoBodyBegin += restStr;

				// cleanup rest definition
				this.alter.remove(
					((lastDflt || lastParam) ? ((lastDflt || lastParam).range[1] + 1) : rest.range[0]) - (lastParam ? 1 : 3)
					, rest.range[1]
				);
			}

			if( isNakedFunction ) {
				// '()=>a' or 'function test()a'
				// add "return "

				insertIntoBodyBegin += (
					"return "
					+ (fnBodyIsSequenceExpression ? "(" : "")
				);
				insertIntoBodyEnd += (doesThisInsideArrowFunction ? ").bind(this)" : "");

				node.body = {
					"type": "BlockStatement",
					"body": [{
						"type": "ReturnStatement",
						"argument": functionBody,
						"range": functionBody.range,//WARNING!!! range is not accurate
						"loc": functionBody.loc//WARNING!!! loc is not accurate
					}],
					"range": functionBody.range,//WARNING!!! range is not accurate
					"loc": functionBody.loc//WARNING!!! loc is not accurate
				}
			}
			else {
				if( doesThisInsideArrowFunction ) {
					insertIntoBodyEnd += ").bind(this)";
				}
			}

			if( insertIntoBodyBegin ) {
				this.alter.insert(fnBodyStart, insertIntoBodyBegin, {__newTransitionalSubLogic: true});
			}

			if( insertIntoBodyEnd ) {
				this.alter.insert(fnBodyEnd, insertIntoBodyEnd);
			}
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
