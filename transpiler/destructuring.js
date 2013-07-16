"use strict";

const assert = require("assert");
const is = require("simple-is");
const stringset = require("stringset");
const core = require("./core");


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

	, setup: function(src, changes, ast, options) {
		this.changes = changes;
		this.src = src;
		this.options = options;
	}

	, pre: function replaceDestructuringVariableDeclaration(node) {
		if( node.type === "VariableDeclaration" && isVarConstLet(node.kind) ) {
			let declarations = node.declarations;

			let afterVariableDeclaration = declarations.reduce(this.__renameDeclaration, {node: node, output: ""}).output;

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
	, __renameDeclaration: function renameDeclaration(output, declarator, declaratorIndex) {
		let declaratorId = declarator.id;

		if( isObjectPattern(declaratorId) || isArrayPattern(declaratorId) ) {
			let declaratorInit = declarator.init;
			assert(typeof declaratorInit === "object");

			let newVariables = [], newDefinitions = [], declarationString = "";

			this.unwrapDestructuring(declaratorId, declaratorInit, newVariables, newDefinitions);

			let hoistScope = output.node.$scope.closestHoistScope();
			newVariables.forEach(function(newVariable, index){
				hoistScope.add(newVariable.name, newVariable.kind, declaratorInit);
				core.allIdentifiers.add(newVariable.name);

				declarationString += (
					(declaratorIndex === 0 && index === 0 ? "" : ", ")
						+ newVariable.name
						+ " = "
						+ newVariable.value
					);

				if( newVariable.needsToCleanUp ) {
					output.output += (newVariable.name + " = null;");
				}
			});

			newDefinitions.forEach(function(definition, index) {
				assert(definition.type === "VariableDeclarator");
				var definitionId = definition.id;

				declarationString += (
					(declaratorIndex === 0 && index === 0 && newVariables.length === 0 ? "" : ", ")
						+ definitionId.name
						+ " = "
						+ definition["init"]["object"].name
						+ core.PropertyToString(definition["init"]["property"])
					)
			});

			// replace destructuring with simple variable declaration
			this.changes.push({
				start: declarator.range[0],
				end: declarator.range[1],
				str: declarationString
			});
		}

		return output;
	}

	, unwrapDestructuring: function unwrapDestructuring(definitionNode, valueNode, newVariables, newDefinitions, temporaryVariables) {
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
			});
		}

		if( isObjectPattern(definitionNode) ) {
			for (let properties = definitionNode.properties, k = 0, l = properties.length ; k < l ; k++) {
				const property = properties[k];
				if (property) {
					//console.log("    property:: key = ", property.key.name, " / value = ", property.value.name, " | type =  ", definitionNode.$parent.type);

					if( isObjectPattern(property.value) || isArrayPattern(property.value) ) {
						this.unwrapDestructuring(property.value, {type: "Identifier", name: valueIdentifierName + core.PropertyToString(property.key)}, newVariables, newDefinitions, temporaryVariables);
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
						this.unwrapDestructuring(element, {type: "Identifier", name: valueIdentifierName + "[" + k + "]"}, newVariables, newDefinitions, temporaryVariables);
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
