"use strict";

const assert = require("assert");
const is = require("simple-is");
const error = require("./../lib/error");
const core = require("./core");
const destructuring = require("./destructuring");



function getline(node) {
	return node.loc.start.line;
}

function isFunction(node) {
	return is.someof(node.type, ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);
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
			const fnBodyIsSequenceExpression = isArrowFunction && functionBody.type === "SequenceExpression";
			const defaults = node.defaults;
			const params = node.params;
			const rest = node.rest;
			let paramsCount = params.length;
			const initialParamsCount = paramsCount;
			let fnBodyStart = functionBody.range[0] + (isArrowFunction ? 0 : 1), fnBodyEnd = functionBody.range[1];
			const defaultsCount = defaults.length;
			const lastParam = params[paramsCount - 1];
			const lastDflt = defaults[defaultsCount - 1];

			let insertIntoBodyBegin = "", insertIntoBodyEnd;

			let doesThisInsideArrowFunction;

			paramsCount -= defaultsCount;

			if( isArrowFunction ) {
				doesThisInsideArrowFunction = node.$scope.doesThisUsing();

				// find '=>'
				const right = fnBodyStart;
				let left;

				let lastDefinition = rest || (lastDflt || lastParam);

				if( lastDefinition ) {
					left = lastDefinition.range[1];
				}
				else {// function without params
					left = node.range[0];
				}

				let str = this.alter.get(left, right);

				// add "function" word before arrow function params list
				this.alter.insert(
					node.range[0]
					, (doesThisInsideArrowFunction ? "(" : "") + "function"// + "|"
				);

				// remove "=>"
				this.alter.replace(
					left
					, right
					, str
					, {
						transform: function(str) {
							str = str.replace(/=>/gi, "");

							if( fnBodyIsSequenceExpression ) {
								// =>   (   <function body>
								str = str.replace(/\(/gi, "");
							}

							return str
						}
					}
				);
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
					// text change 'param = value' => ''
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

			if( isArrowFunction && functionBody.type !== "BlockStatement" ) {
				if( fnBodyIsSequenceExpression ) {
					// ()=>( <function body> )
					fnBodyEnd = node.range[1];
				}
				// add "{return " and "}"

				insertIntoBodyBegin =
					"{"
						+ insertIntoBodyBegin
						+ "return "
						+ (fnBodyIsSequenceExpression ? "(" : "")
				;
				insertIntoBodyEnd = "}" + (doesThisInsideArrowFunction ? ").bind(this)" : "");

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
					insertIntoBodyEnd = ").bind(this)";
				}
			}

			if( insertIntoBodyBegin ) {
				this.alter.insert(fnBodyStart, insertIntoBodyBegin);
			}

			if( insertIntoBodyEnd ) {
				this.alter.insertAfter(fnBodyEnd, insertIntoBodyEnd);
			}
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
