"use strict";

const assert = require("assert");
const is = require("simple-is");
const fmt = require("simple-fmt");
const stringmap = require("stringmap");
const core = require("./core");
const Stats = require("./../lib/stats");

function getline(node) {
	return node.loc.start.line;
}

function isConstLet(kind) {
	return is.someof(kind, ["const", "let"]);
}

function isObjectPattern(node) {
	return node && node.type == 'ObjectPattern';
}

function isArrayPattern(node) {
	return node && node.type == 'ArrayPattern';
}


let plugin = module.exports = {
	setup: function(src, changes, ast, options) {
		this.changes = changes;
		this.src = src;
		this.options = options;
		if( typeof options.stats !== "object" ) {
			options.stats = new Stats();
		}

		ast.$scope.traverse({pre: function(scope) {
			delete scope.moves;
		}});
	}

	, pre: function(ast) {
		// change constlet declarations to var, renamed if needed
		// varify modifies the scopes and AST accordingly and
		// returns a list of change fragments (to use with alter)
		core.traverse(ast, {pre: this.renameDeclarations});
		core.traverse(ast, {pre: this.renameReferences});

		return false;
	}

	, after: function(ast) {
		ast.$scope.traverse({pre: function(scope) {
			delete scope.moves;
		}});
	}

	, renameDeclarations: function renameDeclarations(node) {
		if( node.type === "VariableDeclaration" && isConstLet(node.kind) ) {
			const changes = this.changes;
			const hoistScope = node.$scope.closestHoistScope();
			const origScope = node.$scope;
			const stats = this.options.stats;

			// text change const|let => var
			changes.push({
				start: node.range[0],
				end: node.range[0] + node.kind.length,
				str: "var"
			});

			let declarations = node.declarations;

			declarations.forEach(function renameDeclaration(declarator) {
				var declaratorId = isObjectPattern(declarator) || isArrayPattern(declarator)
						? declarator
						: declarator.type === "Property"
							? declarator.value
							: declarator.id
				;

				//console.log(declarator.type, declarator.$parent.$type)
				assert(
					declarator.type === "VariableDeclarator" || declarator.$type === "VariableDeclarator"
					/*|| (
					 ( isObjectPattern(declarator.id) || isArrayPattern(declarator.id) )
					 && ( declarator.$parent.type === "VariableDeclarator" || declarator.$parent.$type === "VariableDeclarator" )
					 )*/
				);

				if( isObjectPattern(declaratorId) ) {
					for (let properties = declaratorId.properties, k = 0, l = properties.length ; k < l ; k++) {
						const property = properties[k];
						if (property) {
							property.$type = "VariableDeclarator";
							property.$parentType = "ObjectPattern";
							renameDeclaration(property);
						}
					}
					return;
				}
				else if (isArrayPattern(declaratorId)) {
					for (let elements = declaratorId.elements, k = 0, l = elements.length ; k < l ; k++) {
						const element = elements[k];
						if (element) {
							element.$type = "VariableDeclarator";
							element.$parentType = "ArrayPattern";
							renameDeclaration(element);
						}
					}
					return;
				}

				let name, prefix = "", needSrcChanges = true;

				if (declarator.$parentType === "ObjectPattern") {
					declaratorId = declarator;
					name = declarator.value.name;
					prefix = declarator.key.name + " :";

					needSrcChanges = false;//src text-replace in replaceDestructuringVariableDeclaration function
				}
				else if (declarator.$parentType === "ArrayPattern") {
					declaratorId = declarator;
					name = declarator.name;

					needSrcChanges = false;//src text-replace in replaceDestructuringVariableDeclaration function
				}
				else {
					declaratorId = declarator.id;
					name = declaratorId.name;
				}

				stats.declarator(node.kind);//FIXME:: comment

				// rename if
				// 1) name already exists in hoistScope, or
				// 2) name is already propagated (passed) through hoistScope or manually tainted
				const rename = (origScope !== hoistScope &&
					(hoistScope.hasOwn(name) || hoistScope.doesPropagate(name)));

				const newName = (rename ? core.unique(name) : name);

				origScope.remove(name);
				hoistScope.add(newName, "var", declaratorId, declarator.range[1]);

				origScope.moves = origScope.moves || stringmap();
				origScope.moves.set(name, {
					name: newName,
					scope: hoistScope
				});

				core.allIdentifiers.add(newName);

				if (newName !== name) {
					stats.rename(name, newName, getline(declarator));

					declaratorId.originalName = name;//TODO:: in other parts of this file replace it to ObjectPattern/ArrayPattern check

					if (declarator.$parentType === "ObjectPattern") {
						declarator.value.name = newName;
						declarator.originalName = name;
					}
					else if (declarator.$parentType === "ArrayPattern") {
						declarator.name = newName;
					}
					else {
						declaratorId.name = newName;
					}

					if( needSrcChanges ) {
						// textchange var x => var x$1
						changes.push({
							start: declaratorId.range[0],
							end: declaratorId.range[1],
							str: prefix + newName
						});
					}
				}

				//node.kind = "var";
			});
		}
	}

	, renameReferences: function renameReferences(node) {
		if (!node.$refToScope) {
			return;
		}
		const move = node.$refToScope.moves && node.$refToScope.moves.get(node.name);
		if (!move) {
			return;
		}
		node.$refToScope = move.scope;

		if (node.name !== move.name
			&& (//not a destructuring
				node.$parentType !== "ObjectPattern"
				&& node.$parentType !== "ArrayPattern"
			)
		) {
			node.originalName = node.name;
			node.name = move.name;

			this.changes.push({
				start: node.range[0],
				end: node.range[1],
				str: move.name
			});
		}
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
