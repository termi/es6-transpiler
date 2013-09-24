"use strict";

const assert = require("assert");
const core = require("./core");
const error = require("./../lib/error");

function getline(node) {
	return node.loc.start.line;
}

function isVarConstLet(kind) {
	return kind === "var" || kind === "const" || kind === "let";
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

	, pre: function replaceDestructuringVariableDeclaration(node) {
		let parentNode;

		if( isObjectPattern(node) || isArrayPattern(node) ) {
			parentNode = node.$parent;

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
		this.alter.replace(
			declarator.range[0]
			, declarator.range[1]
			, (isFirstVar ? declarationString.substr(4) : declarationString)//remove first "var " if need
		);
	}

	, __replaceAssignment: function(assignment, assignmentLeft) {
		let assignmentRight = assignment.right;

		let declarationString = this.unwrapDestructuring("", assignmentLeft, assignmentRight);

		// replace destructuring with simple variable assignment
		this.alter.replace(
			assignment.range[0]
			, assignment.range[1]
			, declarationString
		);
	}

	, unwrapDestructuring: function unwrapDestructuring(kind, definitionNode, valueNode, newVariables) {
		assert(isObjectPattern(definitionNode) || isArrayPattern(definitionNode));
		if( !newVariables )newVariables = [];
		assert(Array.isArray(newVariables));

		let newDefinitions = [];

		this.__unwrapDestructuring(kind === "var" ? 1 : 0, definitionNode, valueNode, newVariables, newDefinitions);

		kind = (kind ? kind + " " : "");

		let destructurisationString = kind;

		let needsFirstComma = false;

		for(let index = 0, len = newDefinitions.length ; index < len ; index++ ){
			let definition = newDefinitions[index];

			// inherit scope from original VariableDefinitions node
			definition.$scope = definitionNode.$scope;

			assert( definition.type === "VariableDeclarator" );

			let delimiter;
			if( needsFirstComma ) {
				delimiter = ", ";
				needsFirstComma = false;
			}
			else {
				delimiter = "";
			}

			assert( typeof definition["__stringValue"] === "string" );//"__stringValue" defined in this.__unwrapDestructuring

			destructurisationString += ( delimiter + definition["__stringValue"] );
			needsFirstComma = true;
		}

		return destructurisationString;
	}

	, __unwrapDestructuring: function(type, definitionNode, valueNode, newVariables, newDefinitions, hoistScope) {
		let isTemporaryVariable = false, valueIdentifierName, temporaryVariableIndexOrName, valueIdentifierDefinition;
		let isTemporaryValueAssignment = false;

		let _isObjectPattern = isObjectPattern(definitionNode)
			, elementsList = _isObjectPattern ? definitionNode.properties : definitionNode.elements
			, localFreeVariables
			, isLocalFreeVariable = type === 1
		;

		if( isLocalFreeVariable ) {
			//TODO:: tests
			//TODO:: get only last variable name
			localFreeVariables = core.getNodeVariableNames(definitionNode);
		}

		if( valueNode.type === "Identifier" ) {
			valueIdentifierName = valueNode.name;

			if( valueIdentifierName.indexOf("[") !== -1 || valueIdentifierName.indexOf(".") !== -1 ) {
				isTemporaryVariable = true;
				valueIdentifierDefinition = valueIdentifierName;
			}
		}
		else {
			isTemporaryVariable = true;
			let isSequenceExpression = valueNode.type === "SequenceExpression";
			valueIdentifierDefinition = (isSequenceExpression ? "(" : "") + this.alter.get(valueNode.range[0], valueNode.range[1]) + (isSequenceExpression ? ")" : "");
		}

		if( isTemporaryVariable ) {
			if( valueNode.type === "Identifier" || isLocalFreeVariable ) {
				if( elementsList.length < 2 ) {
					isTemporaryVariable = false;
				}

				if( isTemporaryVariable === false ) {
					if( valueIdentifierDefinition.charAt(0) !== "(") {
						valueIdentifierName = "(" + valueIdentifierDefinition + ")";
					}
					else {
						valueIdentifierName = valueIdentifierDefinition;
					}
				}
			}
		}

		if( isTemporaryVariable ) {
			if( isLocalFreeVariable ) {
				valueIdentifierName = localFreeVariables.pop();
			}
			else {
				valueIdentifierName = null;
			}

			if( !valueIdentifierName ) {
				isLocalFreeVariable = false;
				if( !hoistScope ) {
					hoistScope = definitionNode.$scope.closestHoistScope();
				}

				valueIdentifierName = core.getScopeTempVar(hoistScope);
			}
			else {
				isLocalFreeVariable = true;
			}

			temporaryVariableIndexOrName = valueIdentifierName;
			valueIdentifierName = "(" + valueIdentifierName + " = " + valueIdentifierDefinition + ")";
			isTemporaryValueAssignment = true;
		}

		for( let k = 0, len = elementsList.length ; k < len ; k++ ) {
			const element = elementsList[k], elementId = _isObjectPattern ? element.value : element;
			if (element) {
				if( isObjectPattern(elementId) || isArrayPattern(elementId) ) {
					this.__unwrapDestructuring(
						1
						, _isObjectPattern ? element.value : element
						, {
							type: "Identifier"
							, name: valueIdentifierName + (_isObjectPattern ? core.PropertyToString(element.key) : ("[" + k + "]"))
						}
						, newVariables
						, newDefinitions
						, hoistScope
					);
				}
				else {
					let newDefinition = {
						"type": "VariableDeclarator",
						"id": elementId,
						"init": {
							"type": "MemberExpression",
							"computed": false,
							"object": {
								"type": "Identifier",
								"name": valueIdentifierName
							}
						}
					};
					newDefinition.$scope = definitionNode.$scope;

					if( _isObjectPattern ) {
						newDefinition["init"]["property"] = element.key;
					}
					else {
						newDefinition["computed"] = true;
						newDefinition["init"]["property"] = {
							"type": "Literal",
							"value": k,
							"raw": k + ""
						}
					}

//					TODO::
//					if( type === 0 ) {
//						newDefinition["type"] = "AssignmentExpression";
//						newDefinition["left"] = newDefinition["id"];
//						delete newDefinition["id"];
//						newDefinition["right"] = newDefinition["init"];
//						delete newDefinition["init"];
//					}

					if( element.type === "SpreadElement" ) {
						newDefinition["__stringValue"] = core.unwrapSpreadDeclaration(element.argument, valueIdentifierName, k);
					}
					else {
//						if( type === 1 ) {//VariableDeclarator
							newDefinition["__stringValue"] = core.VariableDeclaratorString(newDefinition);
//						}
//						else {//AssignmentExpression
//							newDefinition["__stringValue"] = core.AssignmentExpressionString(newDefinition);
//						}
					}

					newDefinitions.push(newDefinition);
				}

				if( isTemporaryValueAssignment ) {
					valueIdentifierName = temporaryVariableIndexOrName;
					isTemporaryValueAssignment = false;
				}
			}
		}

		if( type === 0 ) {//AssignmentExpression
			newDefinitions.push({
				"type": "VariableDeclarator"
				, "__stringValue": temporaryVariableIndexOrName || valueIdentifierName
			});
		}

		assert(!isTemporaryValueAssignment);

		if( !isLocalFreeVariable && isTemporaryVariable && temporaryVariableIndexOrName != void 0 ) {
			core.setScopeTempVar(hoistScope, temporaryVariableIndexOrName)
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
