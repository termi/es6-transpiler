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
	return is.someof(node.type, ["FunctionDeclaration", "FunctionExpression"]);
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

	, setup: function(changes, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.changes = changes;
		this.options = options;
	}

	, pre: function functionDestructuringAndDefaultsAndRest(node) {
		if ( isFunction(node) ) {
			const changes = this.changes;
			const src = this.src;
			const defaults = node.defaults;
			const params = node.params;
			let paramsCount = params.length;
			const initialParamsCount = paramsCount;
			const fnBodyRange = node.body.body.length ?
					node.body.body[0].range
					:
					[//empty function body. example: function r(){}
						node.body.range[0] + 1
						, node.body.range[1] - 1
					]
				;
			const indentStr = "" + core.stringFromSrc(node.body.range[0] + 1, fnBodyRange[0]);
			const defaultsCount = defaults.length;
			const lastParam = params[paramsCount - 1];
			const lastDflt = defaults[defaults.length - 1];
			let hoistScope;

			paramsCount -= defaultsCount;

			if( paramsCount ) {
				for(let i = 0 ; i < paramsCount ; i++) {
					const param = params[i];
					const prevParam = params[i - 1];

					if( isObjectPattern(param) || isArrayPattern(param) ) {
						let paramStr, newVariables = [], postFix = "";
						paramStr = "";//"\n" + indentStr;
						paramStr =
							destructuring.unwrapDestructuring(
								"var"
								, param
								, {type: "Identifier", name: "arguments[" + i + "]"}
								, newVariables
							);

						hoistScope = node.$scope.closestHoistScope();
						newVariables.forEach(function(newVariable){
							if( newVariable.needsToCleanUp ) {
								postFix += (newVariable.name + " = null;");
							}
						});
						paramStr += (postFix + indentStr);

						param.$replaced = true;

						// add
						changes.push({
							start: fnBodyRange[0],
							end: fnBodyRange[0],
							str: paramStr,
							type: 2// ??
						});

						// cleanup
						changes.push({
							start: (prevParam ? prevParam.range[1] + 1 : param.range[0]) - (prevParam ? 1 : 0),
							end: param.range[1],
							str: ""
						});
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
						//dflt.$type = dflt.type;
						//dflt.type = "";//TODO:: check it

						let newVariables = [], postFix = "";
						defaultStr =
							destructuring.unwrapDestructuring(
								"var"
								, param
								, {type: "Identifier", name: "arguments[" + paramIndex + "] !== void 0 ? arguments[" + paramIndex + "] : " + core.stringFromSrc(dflt)}
								, newVariables
							)
						;

						newVariables.forEach(function(newVariable, index){
							if( newVariable.needsToCleanUp ) {
								postFix += (newVariable.name + " = null;");
							}
						});

						defaultStr += (postFix + indentStr);
					}
					else {
						defaultStr = "var "
							+ core.definitionWithDefaultString(param, "arguments[" + paramIndex + "]", core.stringFromSrc(dflt))
							+ ";" + indentStr;
					}

					param.$replaced = true;

					// add default set
					changes.push({
						start: fnBodyRange[0],
						end: fnBodyRange[0],
						str: defaultStr,
						type: 2// ??
					});

					// cleanup default definition
					// text change 'param = value' => ''
					changes.push({
						start: ((prevDflt || prevParam) ? ((prevDflt || prevParam).range[1] + 1) : param.range[0]) - (prevParam ? 1 : 0),
						end: dflt.range[1],
						str: ""
					});
				}
			}

			const rest = node.rest;
			if( rest ) {
				const restStr = "var " + core.unwrapSpreadDeclaration(rest, "arguments", initialParamsCount) + indentStr;
				if( !hoistScope ) {
					hoistScope = node.$scope.closestHoistScope();
				}

				hoistScope.add(rest.name, "var", rest, -1);

				// add rest
				changes.push({
					start: fnBodyRange[0],
					end: fnBodyRange[0],
					str: restStr
				});

				// cleanup rest definition
				changes.push({
					start: ((lastDflt || lastParam) ? ((lastDflt || lastParam).range[1] + 1) : rest.range[0]) - (lastParam ? 1 : 3),
					end: rest.range[1],
					str: ""
				});
			}
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
