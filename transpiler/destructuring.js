"use strict";

const assert = require("assert");
const is = require("simple-is");
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
		let parentNode;

		if( isObjectPattern(node) || isArrayPattern(node) ) {
			parentNode = node.$parent;

			/*if( !parentNode ){
				return;
			}*/

			if( parentNode.type === "VariableDeclarator" ) {
				if( isVarConstLet(parentNode.$parent.kind) ) {
					this.__replaceDeclaration(parentNode, node);
				}
			}
			else if( parentNode.type === "AssignmentExpression" ) {
				this.__replaceAssignment(parentNode, node);
			}
		}
	}

	, __replaceDeclaration: function replaceDeclaration(declarator, declaratorId) {
		let declaratorInit = declarator.init;

		if( declaratorInit == null ) {
			error(getline(declarator), "destructuring must have an initializer");
			return;
		}

		let declarationString = this.unwrapDestructuring("var", declaratorId, declaratorInit);

		let isFirstVar = declarationString.substring(0, 4) === "var ";

		// replace destructuring with simple variable declaration
		this.changes.push({
			start: declarator.range[0],
			end: declarator.range[1],
			str: (isFirstVar ? declarationString.substr(4) : declarationString)//remove first "var " if need
		});
	}

	, __replaceAssignment: function(assignment, assignmentLeft) {
		let assignmentRight = assignment.right, newVariables = [];

		let declarationString = this.unwrapDestructuring("", assignmentLeft, assignmentRight, newVariables);

		if( newVariables.length ) {
			declarationString = "var " + newVariables.map(function(a){ return a.name }).join(", ") + ";" + declarationString;
		}

		// replace destructuring with simple variable assignment
		this.changes.push({
			start: assignment.range[0],
			end: assignment.range[1],
			str: declarationString
		});
	}

	, unwrapDestructuring: function unwrapDestructuring(kind, definitionNode, valueNode, newVariables) {
		assert(isObjectPattern(definitionNode) || isArrayPattern(definitionNode));
		if( !newVariables )newVariables = [];
		assert(Array.isArray(newVariables));

		let newDefinitions = [];

		this.__unwrapDestructuring(definitionNode, valueNode, newVariables, newDefinitions);

		kind = (kind ? kind + " " : "");

		let destructurisationString = "";

		let needsFirstSemicolon = false;

		for(let index = 0, len = newDefinitions.length ; index < len ; index++ ){
			let definition = newDefinitions[index];

			assert(
				definition.type === "VariableDeclarator"
				|| definition.type === "AssignmentExpression"
				//|| definition.type === "EmptyStatement"
			);
			let definitionId = definition.id;

			let delimiter;
			if( needsFirstSemicolon ) {
				delimiter = ";" + kind;
				needsFirstSemicolon = false;
			}
			else {
				delimiter = (index === 0 ? "" : ", ");
			}

			if( definition.type === "AssignmentExpression" ) {
				assert(!!definition.left && definition.operator === "=" && !!definition.right && !!definition.right.__initValue);
				destructurisationString += (
					(needsFirstSemicolon ? ";" : "")
						+ definition.left.name
						+ " = "
						+ definition.right.__initValue
					);
				needsFirstSemicolon = true;
			}
			else if( definitionId.type === "Identifier" ) {
				if( !destructurisationString )destructurisationString = kind;

				if( "__initValue" in definitionId ) {
					destructurisationString += (
						delimiter
							+ definitionId.name
							+ " = "
							+ definitionId.__initValue
						);
				}
				else {
					destructurisationString += (
						delimiter
							+ definitionId.name
							+ " = "
							+ definition["init"]["object"].name
							+ core.PropertyToString(definition["init"]["property"])
						);
				}
			}
			else if( definitionId.type === "SpreadElement" ){
				if( !destructurisationString )destructurisationString = kind;

				destructurisationString += (
					delimiter
						+ core.unwrapSpreadDeclaration(definitionId.argument, definition["init"]["object"].name, definition["init"]["property"]["value"])
					)
				;
			}
			else {
				throw new SyntaxError();
			}

			//if( definitionId ) {// "EmptyStatement" has no definition.id
				let defaultValue = definitionId.default;//TODO:: goes to latest Parser API from esprima

				if( defaultValue ) {
					destructurisationString += (";" + core.defaultString(definitionId, core.stringFromSrc(defaultValue)));
					needsFirstSemicolon = true;
				}
			//}
		}

		return destructurisationString;
	}

	, __unwrapDestructuring: function(definitionNode, valueNode, newVariables, newDefinitions, hoistScope) {
		let isTemporaryVariable = false, valueIdentifierName, temporaryVariableIndexOrName, valueIdentifierDefinition;
		let isTemporaryValueAssignment;

		if( valueNode.type === "Identifier" ) {
			valueIdentifierName = valueNode.name;

			if( valueIdentifierName.indexOf("[") !== -1 || valueIdentifierName.indexOf(".") !== -1 ) {
				isTemporaryVariable = true;
				valueIdentifierDefinition = valueIdentifierName;
			}
		}
		else {
			isTemporaryVariable = true;
			valueIdentifierDefinition = core.stringFromSrc(valueNode.range[0], valueNode.range[1]);
		}

		if( isTemporaryVariable ) {
			if( isObjectPattern(definitionNode) ) {
				if( definitionNode.properties.length < 2 ) {
					isTemporaryVariable = false;
				}
			}
			else {
				if( definitionNode.elements.length < 2 ) {
					isTemporaryVariable = false;
				}
			}
			if( isTemporaryVariable == false ) {
				if( valueIdentifierDefinition.charAt(0) != "(") {
					valueIdentifierName = "(" + valueIdentifierDefinition + ")";
				}
				else {
					valueIdentifierName = valueIdentifierDefinition;
				}
			}
		}


		if( isTemporaryVariable ) {
			if( !hoistScope ) {
				hoistScope = definitionNode.$scope.closestHoistScope();
			}

			valueIdentifierName = hoistScope.popFree();

			if( valueIdentifierName ) {
				temporaryVariableIndexOrName = valueIdentifierName;
				valueIdentifierName = "(" + valueIdentifierName + " = " + valueIdentifierDefinition + ")";
				isTemporaryValueAssignment = true;
				/*newDefinitions.push({
					"type": "EmptyStatement"
					, __semicolon: true
				});
				newDefinitions.push({
					"type": "AssignmentExpression"
					, "operator": "="
					, "left": {
						"type": "Identifier",
						"name": valueIdentifierName
					}
					, "right": {
						"type": "__Raw",
						__initValue: valueIdentifierDefinition
					}
				});*/

			}
			else {
				temporaryVariableIndexOrName = newVariables.length;
				valueIdentifierName = core.unique("$D", true);
				hoistScope.add(valueIdentifierName, "var", valueNode);

				newVariables.push({
					name: valueIdentifierName
					, kind: "var"
					, needsToCleanUp: true
					//, isFree: false
				});
				newDefinitions.push({
					"type": "VariableDeclarator",
					"id": {
						"type": "Identifier",
						"name": valueIdentifierName,
						__initValue: valueIdentifierDefinition
					}
				});
			}
		}

		if( isObjectPattern(definitionNode) ) {
			for (let properties = definitionNode.properties, k = 0, l = properties.length ; k < l ; k++) {
				const property = properties[k];
				if (property) {
					if( isObjectPattern(property.value) || isArrayPattern(property.value) ) {
						this.__unwrapDestructuring(property.value, {type: "Identifier", name: valueIdentifierName + core.PropertyToString(property.key)}, newVariables, newDefinitions, hoistScope);
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

					if( isTemporaryValueAssignment ) {
						valueIdentifierName = temporaryVariableIndexOrName;
						isTemporaryValueAssignment = false;
					}
				}
			}
		}
		else {
			for (let elements = definitionNode.elements, k = 0, l = elements.length ; k < l ; k++) {
				const element = elements[k];
				if (element) {
					if( isObjectPattern(element) || isArrayPattern(element) ) {
						this.__unwrapDestructuring(element, {type: "Identifier", name: valueIdentifierName + "[" + k + "]"}, newVariables, newDefinitions, hoistScope);
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

					if( isTemporaryValueAssignment ) {
						valueIdentifierName = temporaryVariableIndexOrName;
						isTemporaryValueAssignment = false;
					}
				}
			}
		}

		assert(!isTemporaryValueAssignment);

		if( isTemporaryVariable && temporaryVariableIndexOrName != void 0 ) {
			if( typeof temporaryVariableIndexOrName === "number" ) {
				hoistScope.pushFree(newVariables[temporaryVariableIndexOrName].name);
			}
			else {
				hoistScope.pushFree(temporaryVariableIndexOrName);
			}
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
