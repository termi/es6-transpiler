"use strict";

const assert = require("assert");
const is = require("simple-is");
const stringset = require("stringset");
const core = require("./core");
const error = require("./../lib/error");

function getline(node) {
	return node.loc.start.line;
}


function isVarConstLet(kind) {
	return is.someof(kind, ["var", "const", "let"]);
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

	, pre: function replaceDestructuringVariableDeclaration(node) {
		if( node.type === "VariableDeclaration" && isVarConstLet(node.kind) ) {
			let declarations = node.declarations;

			let afterVariableDeclaration = declarations.reduce(this.__replaceDeclaration, {node: node, output: ""}).output;

			if( afterVariableDeclaration ) {
				// add temporary variables cleanup
				this.changes.push({
					start: node.range[1],
					end: node.range[1],
					str: afterVariableDeclaration
				});
			}
		}
	}

	/**
	 * reduce
	 */
	, __replaceDeclaration: function replaceDeclaration(output, declarator, declaratorIndex, declarations) {
		let declaratorId = declarator.id;

		if( isObjectPattern(declaratorId) || isArrayPattern(declaratorId) ) {
			let declaratorInit = declarator.init;

			if( declaratorInit == null ) {
				error(getline(declarator), "destructuring must have an initializer");
				return output;
			}

			let newVariables = [];

			let declarationString = this.unwrapDestructuring("var", declaratorId, declaratorInit, newVariables);

			newVariables.forEach(function(newVariable){
				if( newVariable.needsToCleanUp ) {
					output.output += (newVariable.name + " = null;");
				}
			});

			let isLastDeclaration = declarations.length - 1 == declaratorIndex;

			// replace destructuring with simple variable declaration
			this.changes.push({
				start: declarator.range[0],
				end: declarator.range[1],
				str: (declaratorIndex === 0 ? "" : ", ")
					+ declarationString.substring(4, declarationString.length - (isLastDeclaration ? 1 : 0))//remove first "var " and last ";" if need
					+ (isLastDeclaration ? "" : "var ")//unwrapDestructuring always return string with ";" at the end
			});
		}

		return output;
	}

	, unwrapDestructuring: function unwrapDestructuring(kind, definitionNode, valueNode, newVariables) {
		let newDefinitions = [];

		this.__unwrapDestructuring(definitionNode, valueNode, newVariables, newDefinitions);

		kind = (kind ? kind + " " : "");

		let destructurisationString = kind;

		let hoistScope = definitionNode.$scope.closestHoistScope();

		let lastIsSemicolon = false;

		newVariables.forEach(function(newVariable, index){
			hoistScope.add(newVariable.name, newVariable.kind, newVariable.originalNode);
			core.allIdentifiers.add(newVariable.name);

			destructurisationString += (
				(index === 0 ? "" : ", ")
				+ newVariable.name
				+ " = "
				+ newVariable.value
			);
		});

		newDefinitions.forEach(function(definition, index) {
			assert(definition.type === "VariableDeclarator");
			let definitionId = definition.id;

			let delimiter;
			if( lastIsSemicolon ) {
				delimiter = kind;
				lastIsSemicolon = false;
			}
			else {
				delimiter = (index === 0 && newVariables.length === 0 ? "" : ", ");
			}

			if( definitionId.type === "Identifier" ) {
				destructurisationString += (
					delimiter
					+ definitionId.name
					+ " = "
					+ definition["init"]["object"].name
					+ core.PropertyToString(definition["init"]["property"])
				);
			}
			else if( definitionId.type === "SpreadElement" ){
				destructurisationString += (
					delimiter
					+ core.unwrapSpreadDeclaration(definitionId.argument, definition["init"]["object"].name, index)
				);
			}
			else {
				throw new SyntaxError();
			}

			let defaultValue = definitionId.default;//TODO:: goes to latest Parser API from esprima

			if( defaultValue ) {
				destructurisationString += (";" + core.defaultString(definitionId, core.stringFromSrc(defaultValue)) + ";");
				lastIsSemicolon = true;
			}
		});

		return destructurisationString + (lastIsSemicolon ? "" : ";");
	}

	, __unwrapDestructuring: function(definitionNode, valueNode, newVariables, newDefinitions, temporaryVariables) {
		assert(typeof valueNode === "object");
		assert(isObjectPattern(definitionNode) || isArrayPattern(definitionNode));
		assert(Array.isArray(newVariables));
		assert(Array.isArray(newDefinitions));

		if(!temporaryVariables)temporaryVariables = stringset();

		let needsNewVariable = false, valueIdentifierName, valueIdentifierDefinition;
		if( valueNode.type === "Identifier" ) {
			valueIdentifierName = valueNode.name;

			if( valueIdentifierName.indexOf("[") !== -1 || valueIdentifierName.indexOf(".") !== -1 ) {
				needsNewVariable = true;
				valueIdentifierDefinition = valueIdentifierName;
			}
		}
		else {
			needsNewVariable = true;
			valueIdentifierDefinition = this.src.substring(valueNode.range[0], valueNode.range[1]);
		}

		if( needsNewVariable ) {
			valueIdentifierName = core.unique("$D", true, temporaryVariables);

			temporaryVariables.add(valueIdentifierName);

			newVariables.push({
				name: valueIdentifierName
				, kind: "var"
				, value: valueIdentifierDefinition
				, needsToCleanUp: true
				, originalNode: valueNode
			});
		}

		if( isObjectPattern(definitionNode) ) {
			for (let properties = definitionNode.properties, k = 0, l = properties.length ; k < l ; k++) {
				const property = properties[k];
				if (property) {
					//console.log("    property:: key = ", property.key.name, " / value = ", property.value.name, " | type =  ", definitionNode.$parent.type);

					if( isObjectPattern(property.value) || isArrayPattern(property.value) ) {
						this.__unwrapDestructuring(property.value, {type: "Identifier", name: valueIdentifierName + core.PropertyToString(property.key)}, newVariables, newDefinitions, temporaryVariables);
					}
					else {
						newDefinitions.push({
							"type": "VariableDeclarator",
							"id": property.value,
							"init": {
								"type": "MemberExpression",
								"computed": false,
								"object": {
									"type": "Identifier",
									"name": valueIdentifierName
								},
								"property": property.key
							}
						});
					}
				}
			}
		}
		else {
			for (let elements = definitionNode.elements, k = 0, l = elements.length ; k < l ; k++) {
				const element = elements[k];
				if (element) {
					//console.log("    element = ", element.name, " | type =  ", definitionNode.$parent.type);

					if( isObjectPattern(element) || isArrayPattern(element) ) {
						this.__unwrapDestructuring(element, {type: "Identifier", name: valueIdentifierName + "[" + k + "]"}, newVariables, newDefinitions, temporaryVariables);
					}
					else {
						newDefinitions.push({
							"type": "VariableDeclarator",
							"id": element,
							"init": {
								"type": "MemberExpression",
								"computed": true,
								"object": {
									"type": "Identifier",
									"name": valueIdentifierName
								},
								"property": {
									"type": "Literal",
									"value": k,
									"raw": k + ""
								}
							}
						});
					}
				}
			}
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
