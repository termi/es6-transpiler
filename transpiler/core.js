"use strict";

const assert = require("assert");
const is = require("simple-is");
const stringset = require("stringset");
const traverse = require("./../lib/traverse");
const jshint_vars = require("./../jshint_globals/vars.js");
const Scope = require("./../lib/scope");
const error = require("./../lib/error");

function getline(node) {
	return node.loc.start.line;
}

function isConstLet(kind) {
	return kind === "const" || kind === "let";
}

function isVarConstLet(kind) {
	return kind === "var" || kind === "const" || kind === "let";
}

function isFunction(node) {
	let type;
	return node && (type = node.type)
		&& type === "FunctionDeclaration" || type === "FunctionExpression" || type === "ArrowFunctionExpression";
}

function isNonFunctionBlock(node) {
	return node && node.type === "BlockStatement" && !isFunction(node.$parent.type);
}

function isForWithConstLet(node) {
	return node && node.type === "ForStatement" && node.init && node.init.type === "VariableDeclaration" && isConstLet(node.init.kind);
}

function isForInOfWithConstLet(node) {
	return node && (node.type === "ForInStatement" || node.type === "ForOfStatement") && node.left.type === "VariableDeclaration" && isConstLet(node.left.kind);
}

function isReference(node) {
	const parent = node.$parent;
	const parentType = parent && parent.type;

	return node.$refToScope
		|| node.type === "Identifier"
			&& !(parentType === "VariableDeclarator" && parent.id === node) // var|let|const $
			&& !(parentType === "MemberExpression" && parent.computed === false && parent.property === node) // obj.$
			&& !(parentType === "Property" && parent.key === node) // {$: ...}
			&& !(parentType === "LabeledStatement" && parent.label === node) // $: ...
			&& !(parentType === "CatchClause" && parent.param === node) // catch($)
			&& !(isFunction(parent) && parent.id === node) // function $(..
			&& !(isFunction(parent) && parent.params.indexOf(node) !== -1) // function f($)..
			&& node.$parentProp !== 'label'// for 'break label', 'continue label', etc cases
			&& true
	;
}

function isDeclaration(node) {
	return node && (node.$variableDeclaration === true || node.$paramDefinition === true);
}

function isLvalue(node) {
	return isReference(node) &&
		(
			(node.$parent.type === "AssignmentExpression" && node.$parent.left === node)
			|| (node.$parent.type === "UpdateExpression" && node.$parent.argument === node)
		)
	;
}

function isObjectPattern(node) {
	return node && node.type === 'ObjectPattern';
}

function isArrayPattern(node) {
	return node && node.type === 'ArrayPattern';
}

let UUID_PREFIX = "uuid" + ((Math.random() * 1e6) | 0);
let UUID = 1;

let core = module.exports = {
	traverse: traverse,

	reset: function() {
		this.allIdentifiers = stringset();

		this.outermostLoop = null;
		this.functions = [];
		this.bubbledVariables = {}
	}

	, setup: function(alter, ast, options, src) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.alter = alter;
		this.src = src;
		this.options = options;

		Scope.setOptions(options);
	}

	, '::Program': function(node) {
		// setup scopes
		const topScope = this.createTopScope(node.$scope, this.options.environments, this.options.globals);

		// allIdentifiers contains all declared and referenced vars
		// collect all declaration names (including those in topScope)
		const allIdentifiers = this.allIdentifiers;
		topScope.traverse({pre: function(scope) {
			allIdentifiers.addMany(scope.decls.keys());
		}});
	}

	, '::Identifier': function(node) {
		// setup node.$refToScope, check for errors.
		// also collects all referenced names to allIdentifiers
		this.setupReferences(node);
		this.detectConstAssignment(node);// static analysis passes

		let parentNode = node.$parent;

		if ( parentNode.type === 'AssignmentExpression' ) {//TODO: '::AssignmentExpression[operator="="]': function(node) {}
			let valueNode = parentNode.right
				, assignmentType = this.detectType(valueNode, parentNode.left)
				, declarationNode = node.$declaration
			;


			let types = declarationNode.$types;
			if ( types.indexOf(assignmentType) === -1 ) {
				types.push(assignmentType);
			}
		}
	}

	, onnode: function createScopes(node, parent) {
		assert(!node.$scope);

		node.$parent = parent;
		node.$scope = node.$parent ? node.$parent.$scope : null; // may be overridden

		let self = this;

		function addParamToScope(param) {
			if ( param === null ) {
				return;
			}

			if ( isObjectPattern(param) ) {
				param.properties.forEach(addParamToScope);
			}
			else if ( param.type === "Property" ) {//from objectPattern
				addParamToScope(param.value);
			}
			else if ( isArrayPattern(param) ) {
				param.elements.forEach(addParamToScope);
			}
			else {
				node.$scope.add(param.name, "param", param);
				param.$types = [];
			}

			param.$paramDefinition = true;
		}

		function addVariableToScope(variable, kind, originalDeclarator, scope, initNode) {
			if( isObjectPattern(variable) ) {
				variable.properties.forEach(function(variable) {
					addVariableToScope(variable, kind, originalDeclarator, scope);
				});
			}
			else if( variable.type === "Property" ) {//from objectPattern
				addVariableToScope(variable.value, kind, originalDeclarator, scope);
			}
			else if( isArrayPattern(variable) ) {
				variable.elements.forEach(function(variable) {
					if( variable ) {
						addVariableToScope(variable, kind, originalDeclarator, scope);
					}
				});
			}
			else if( variable.type === "SpreadElement" ) {//from arrayPattern
				addVariableToScope(variable.argument, kind, originalDeclarator, scope);
//				node.$scope.add(variable.argument.name, kind, variable, variable.range[1], 0, originalDeclarator);
			}
			else {
				let referableFromPos;
				if( is.someof(kind, ["var", "const", "let"]) ) {
					referableFromPos = variable.range[1];
				}
				(scope || node.$scope).add(variable.name, kind, variable, referableFromPos, 0, originalDeclarator);

				variable.$types = initNode ? [self.detectType(initNode, variable)] : [];
			}

			variable.$variableDeclaration = true;
		}

		if (node.type === "Program") {
			// Top-level program is a scope
			// There's no block-scope under it
			node.$scope = new Scope({
				kind: "hoist",
				node: node,
				parent: null
			});

		} if (node.type === "ClassDeclaration") {// class declaration
			node.$scope = new Scope({
				kind: "hoist",
				node: node,
				parent: node.$parent.$scope
			});

			addVariableToScope(node.id, "let"/*TODO::"class"*/, node.id, node.$parent.$scope, node);

			if( node.superClass ) {
				node.$scope.add("super", "var");
			}

			node.body.body.forEach(function(method) {
				assert(method.type === "MethodDefinition");//TODO:: static properties

				//TODO:: class A { m(){} static m(){} m2{ m(); //where m referred? } }

				// method.kind ca be 'get', 'set', ''
				node.$scope.add(this.getKeyName(method.key), method.kind || "fun", method.value);
			}, this);

		} else if (isFunction(node)) {
			// Function is a scope, with params in it
			// There's no block-scope under it

			node.$scope = new Scope({
				kind: "hoist",
				node: node,
				parent: node.$parent.$scope
			});

			// function has a name
			if (node.id) {
				assert(node.id.type === "Identifier");

				if (node.type === "FunctionDeclaration") {
					// Function name goes in parent scope for declared functions
					addVariableToScope(node.id, "fun", node.id, node.$parent.$scope, node);
				} else if (node.type === "FunctionExpression") {
					// Function name goes in function's scope for named function expressions
					addVariableToScope(node.id, "fun", node.id, void 0, node);
				} else {
					assert(false);
				}
			}

			node.params.forEach(addParamToScope);
			if( node.rest ) {
				addParamToScope(node.rest)
			}

		} else if (node.type === "ImportDeclaration") {
			// Variable declarations names in import's
			assert( node.kind === "default" || node.kind === "named" );
			node.specifiers.forEach(function(declarator) {
				assert(declarator.type === "ImportSpecifier");

				addVariableToScope(declarator.id, "var"/*, node.kind*/, declarator, void 0, declarator);
			}, this);

		} else if (node.type === "VariableDeclaration") {
			// Variable declarations names goes in current scope
			assert(isVarConstLet(node.kind));
			node.declarations.forEach(function(declarator) {
				assert(declarator.type === "VariableDeclarator");

				if (this.options.disallowVars && node.kind === "var") {
					error(getline(declarator), "var {0} is not allowed (use let or const)", declarator.id.name);
				}

				addVariableToScope(declarator.id, node.kind, declarator, void 0, declarator.init);
			}, this);

		} else if (isForWithConstLet(node) || isForInOfWithConstLet(node)) {
			// For(In) loop with const|let declaration is a scope, with declaration in it
			// There may be a block-scope under it
			node.$scope = new Scope({
				kind: "block",
				node: node,
				parent: node.$parent.$scope
			});

		} else if (isNonFunctionBlock(node)) {
			// A block node is a scope unless parent is a function
			node.$scope = new Scope({
				kind: "block",
				node: node,
				parent: node.$parent.$scope
			});

		} else if (node.type === "CatchClause") {
			const identifier = node.param;

			node.$scope = new Scope({
				kind: "catch-block",
				node: node,
				parent: node.$parent.$scope
			});
			addVariableToScope(identifier, "caught", identifier, void 0, node);

			// All hoist-scope keeps track of which variables that are propagated through,
			// i.e. an reference inside the scope points to a declaration outside the scope.
			// This is used to mark "taint" the name since adding a new variable in the scope,
			// with a propagated name, would change the meaning of the existing references.
			//
			// catch(e) is special because even though e is a variable in its own scope,
			// we want to make sure that catch(e){let e} is never transformed to
			// catch(e){var e} (but rather var e$0). For that reason we taint the use of e
			// in the closest hoist-scope, i.e. where var e$0 belongs.
			node.$scope.closestHoistScope().markPropagates(identifier.name);
		}
		else if ( node.type === "ThisExpression" ) {
			let thisFunctionScope = node.$scope.closestHoistScope()
				, functionNode = thisFunctionScope.node
			;

			thisFunctionScope.markThisUsing();

			if( functionNode.type === "ArrowFunctionExpression" ) {
				do {
					// ArrowFunction should transpile to the function with .bind(this) at the end
					thisFunctionScope.markThisUsing();
				}
				while(
					(functionNode = thisFunctionScope.node.$parent)
						&& functionNode.type === "ArrowFunctionExpression"
						&& (thisFunctionScope = functionNode.$scope.closestHoistScope())
					);
			}
		}
		else if ( node.type === "Identifier" && node.name === "arguments" ) {
			let thisFunctionScope = node.$scope.closestHoistScope()
				, functionNode = thisFunctionScope.node
			;

			thisFunctionScope.markArgumentsUsing();
		}
		else if ( node.type === "ComprehensionExpression" ) {
			// TODO:: when I write this, I not looking to spec
			// TODO:: check the logic below

			node.$scope = new Scope({
				kind: "hoist",
				node: node,
				parent: node.$parent.$scope
			});

			let blocks = node.blocks;
			for( let i = 0, len = blocks.length ; i < len ; i++) {
				let block = blocks[i];

				if( block.type === "ComprehensionBlock" ) {
					addVariableToScope(block.left, "let", node);
				}
			}
		}
	}

	, detectType: function(valueNode, recipientNode) {
		if ( !valueNode ) {
			return "undefined";
		}

		let type = valueNode.type;

		if ( type === 'Literal' ) {
			let value = valueNode.value
				, raw = valueNode.raw
				, lastSlashIndex
			;
			return raw[0] == '/' && (lastSlashIndex = raw.lastIndexOf("/")) !== -1 && lastSlashIndex !== 0
				? 'RegExp'
				: typeof value
			;
		}
		else if ( type === 'TemplateLiteral' ) {
			return 'String';
		}
		else if ( type === 'ArrayExpression' ) {
			return 'Array';
		}
		else if ( type === 'ObjectExpression' ) {
			return 'Object';
		}
		else if ( type === 'ClassDeclaration' ) {
			return 'Class';
		}
		else if ( type === 'CatchClause' ) {
			return 'Error';
		}
		else if ( isFunction(valueNode) ) {
			return 'Function';
		}
		else {
			return 'Variant';
		}
	}

	, unique: function (name, newVariable, additionalFilter) {
		assert(newVariable || this.allIdentifiers.has(name));

		for( let cnt = 0 ; ; cnt++ ) {
			const genName = name + "$" + cnt;
			if( !this.allIdentifiers.has(genName) && (!additionalFilter || !additionalFilter.has(genName))) {
				if( newVariable ) {
					this.allIdentifiers.add(genName);
				}
				return genName;
			}
		}
	}

	, uniqueByToken: function (token, name, newVariable, additionalFilter) {
		if( this.__nameByToken && token in this.__nameByToken ) {
			return this.__nameByToken[token];
		}

		if( !this.__nameByToken ) {
			this.__nameByToken = {};
		}

		return this.__nameByToken[token] = this.unique(name, newVariable, additionalFilter);
	}

	, createTopScope: function(programScope, environments, globals) {
		function inject(obj) {
			for (let name in obj) {
				const writeable = obj[name];
				const kind = (writeable ? "var" : "const");
				if (topScope.hasOwn(name)) {
					topScope.remove(name);
				}
				topScope.add(name, kind, {loc: {start: {line: -1}}}, -1);
			}
		}

		const topScope = new Scope({
			kind: "hoist",
			node: {},
			parent: null
		});

		const complementary = {
			undefined: false,
			Infinity: false,
			console: false
		};

		inject(complementary);
		inject(jshint_vars.reservedVars);
		inject(jshint_vars.ecmaIdentifiers);
		if (environments) {
			environments.forEach(function(env) {
				if (!jshint_vars[env]) {
					error(-1, 'environment "{0}" not found', env);
				} else {
					inject(jshint_vars[env]);
				}
			});
		}
		if (globals) {
			inject(globals);
		}

		// link it in
		programScope.parent = topScope;
		topScope.children.push(programScope);

		return topScope;
	}

	/**
	 * traverse: pre
	 * after 'createScopes'
	 */
	, setupReferences: function(node) {
		if (isReference(node)) {
			this.allIdentifiers.add(node.name);

			const scope = node.$scope.lookup(node.name);
			if (!scope && this.options.disallowUnknownReferences) {
				error(getline(node), "reference to unknown global variable {0}", node.name);
			}

			if( !isDeclaration(node) ) {
				if( scope ) {
					scope.addRef(node);
				}
			}

			if( !scope ) {
				// 'reference to unknown global variable' case
				return;
			}

			let decl = scope.get(node.name);

			// check const and let for referenced-before-declaration
			if ( isConstLet(decl.kind) ) {
				const allowedFromPos = scope.getFromPos(node.name);
				const referencedAtPos = node.range[0];

				assert(is.finitenumber(allowedFromPos));
				assert(is.finitenumber(referencedAtPos));
				if (referencedAtPos < allowedFromPos) {
					if (!node.$scope.hasFunctionScopeBetween(scope)) {
						error(getline(node), "{0} is referenced before its declaration", node.name);
					}
				}
			}

			node.$refToScope = scope;

			let declNode = decl.node;
			if( declNode ) {
				node.$declaration = declNode;
				node.$captured = declNode.$captured =
					declNode.$captured || scope != node.$scope.closestHoistScope()
				;
			}
			else {
				// Special case. For example, 'super' or 'this' doesn't has any declaration node
				node.$captured = true;
			}
		}
	}

	, detectConstAssignment: function detectConstAssignment(node) {
		if (isLvalue(node)) {
			const scope = node.$scope.lookup(node.name);
			if (scope && scope.getKind(node.name) === "const") {
				error(getline(node), "can't assign to const variable {0}", node.name);
			}
		}
	}

	, getNodeVariableNames: function(node) {
		let vars = [];

		function addParam(param) {
			if( param === null ){
				return;
			}

			if( isObjectPattern(param) ) {
				param.properties.forEach(addParam);
			}
			else if( param.type === "Property" ) {//from objectPattern
				addParam(param.value);
			}
			else if( isArrayPattern(param) ) {
				param.elements.forEach(addParam);
			}
			else {
				vars.push(param.name);
			}
		}

		function addVariable(variable) {
			if( !variable ) {
				return;
			}

			if( isObjectPattern(variable) ) {
				variable.properties.forEach(addVariable);
			}
			else if( variable.type === "Property" ) {//from objectPattern
				addVariable(variable.value);
			}
			else if( isArrayPattern(variable) ) {
				variable.elements.forEach(addVariable);
			}
			else if( variable.type === "SpreadElement" ) {//from arrayPattern
				vars.push(variable.argument.name);
			}
			else {
				vars.push(variable.name);
			}
		}

		if( isFunction(node) ) {
			node.params.forEach(addParam);

			if( node.rest ) {
				addParam(node.rest)
			}
		}
		else if( node.type === "VariableDeclaration" ) {
			node.declarations.forEach(function(declarator) {
				addVariable(declarator.id);
			}, this);
		}
		else if( node.type === "AssignmentExpression" ) {
			addVariable(node.left)
		}
		else {
			addVariable(node)
		}

		return vars;
	}

	, PropertyToString: function PropertyToString(node) {
		assert(node.type === "Literal" || node.type === "Identifier");

		var result;
		if( node.type === "Literal" ) {
			result = "[" + node.raw + "]";
		}
		else {
			result = "." + node.name;
		}

		return result
	}

	,
	/**
	 *
	 * @param {Object} node
	 * @param {string} donor
	 * @param {number} fromIndex
	 */
	unwrapRestDeclaration: function(node, donor, fromIndex) {
		assert(node.type === "Identifier");

		const sliceFunctionName = this.bubbledVariableDeclaration(node.$scope, "SLICE", "Array.prototype.slice");

		return node.name + " = " + sliceFunctionName + ".call(" + donor + ", " + fromIndex + ")";
	}


	,
	/**
	 * TODO:: update this method to unwrapp more node types
	 * @param {Object} node
	 */
	unwrapNode: function(node) {
		assert(typeof node === "object");
		var from = node.range[0], to = node.range[1];

		if( node.type === "SequenceExpression" )return "(" + this.alter.get(from, to) + ")";
		if( node.type === "ConditionalExpression" )return "(" + this.alter.get(from, to) + ")";
		return this.alter.get(from, to);
	}

	,
	/**
	 *
	 * @param {Object} node
	 * @param {string} donor
	 * @param {string} value
	 */
	definitionWithDefaultString: function(node, donor, value) {
		assert(node.type === "Identifier");

		return node.name + " = " + donor + ";" + this.defaultString(node, value);
	}

	,
	/**
	 *
	 * @param {Object} node
	 * @param {string} value
	 */
	defaultString: function(node, value) {
		assert(node.type === "Identifier");

		return "if(" + node.name + " === void 0)" + node.name + " = " + value;
	}

	,

	__assignmentString: function(node, isDeclaration) {
		assert(node.type === "AssignmentExpression" || node.type === "VariableDeclarator");

		let left, right, isAssignmentExpression = node.type === "AssignmentExpression";

		if( isAssignmentExpression ) {
			left = node.left;
			right = node.right;
		}
		else {
			left = node.id;
			right = node.init;
		}

		let destructuringDefaultNode = left.default;//TODO:: goes to latest Parser API from esprima

		let variableName = left.name;
		let result = variableName + " = ";
		let valueString = right["object"].name + core.PropertyToString(right["property"]);

		if( isAssignmentExpression ) {
			result += "(";
		}

		if( typeof destructuringDefaultNode === "object" ) {
//			let tempVar = core.getScopeTempVar(node.$scope);
//
//			result += (
//				"((" + tempVar + " = " + valueString + ") === void 0 ? " + this.alter.get(destructuringDefaultNode.range[0], destructuringDefaultNode.range[1]) + " : " + tempVar + ")"
//			);
//
//			core.setScopeTempVar(node.$scope, tempVar);

			// TODO:: tests
			result += (
				"((" + variableName + " = " + valueString + ") === void 0 ? " + this.alter.get(destructuringDefaultNode.range[0], destructuringDefaultNode.range[1]) + " : " + variableName + ")"
				);
		}
		else {
			result += valueString;
		}

		if( isAssignmentExpression ) {
			result += ", " + left.name + ")";
		}

		return result;
	}

	,
	AssignmentExpressionString: function(expression) {
		return this.__assignmentString(expression, false);
	}

	,
	VariableDeclaratorString: function(definition) {
		return this.__assignmentString(definition, true);
	}

	, __getNodeBegin: function(node) {
		let begin;
		let hoistScopeNodeBody = node.body;

		if ( node.type === "Program" ) {
			begin = 0;
		}
		else if( node.type === "ClassDeclaration" ) {
			begin = hoistScopeNodeBody.range[0] + 1;
		}
		else if( isFunction(node) ) {
			const isNakedFunction = node.expression === true;

			begin = hoistScopeNodeBody.range[0] + (isNakedFunction ? 0 : 1);
		}
		else if( node.type === "ComprehensionExpression" ) {
			begin = node.range[0] + 1;
		}
		else if( hoistScopeNodeBody ) {
			if( hoistScopeNodeBody.length ) {
				hoistScopeNodeBody = hoistScopeNodeBody[0];
			}
			begin = hoistScopeNodeBody.range[0];

			if( isFunction(node) ) {
				begin++;
			}
		}
		else {
			begin = node.range[0];
		}

		return begin;
	}

	, getScopeTempVar: function(usingNode, scope, hoistScope, prefix) {
		assert(scope instanceof Scope, scope + " is not instance of Scope");

		if( !hoistScope ) {
			hoistScope = scope.closestHoistScope();
		}

		if( !prefix ) {
			prefix = "$D";
		}

		let startsFrom = usingNode.range[0];

		let freeVar = hoistScope.popFree(startsFrom);

		if( !freeVar ) {
			freeVar = core.unique(prefix, true);
			hoistScope.add(freeVar, "var", {
				//TODO:
			});

			this.alter.insertBefore(this.__getNodeBegin(hoistScope.node), "var " + freeVar + ";");
		}
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

		return freeVar;
	}

	, setScopeTempVar: function(freeVar, usingNode, hoistScope, cleanup) {
		assert(hoistScope instanceof Scope, hoistScope + " is not instance of Scope");
		assert(typeof freeVar === "string");

		hoistScope = hoistScope.closestHoistScope();

		let endsFrom = usingNode.range[1];

		hoistScope.pushFree(freeVar, endsFrom);

		if( !cleanup ) {
			return;
		}

		// TODO:: maybe cleanup only if variable can be captured by function-closure?

		// go up the tree and trying to find a BlockStatement or Program block
		let blockStatement
			, commaNeeded = false
			, maxParentCount = 20, ii = 0
		;
		while ( usingNode ) {

			if( usingNode.type === 'ReturnStatement' ) {
				usingNode = null;
			}
			else if( usingNode.type === 'BlockStatement' ) {
				blockStatement = usingNode;
				break;
			}
			else if( usingNode.type === 'VariableDeclaration' ) {
				let $parent = usingNode.$parent;

				if( $parent && $parent.type === 'BlockStatement' ) {
					if( ($parent = $parent.$parent) && isFunction($parent) ) {
						blockStatement = usingNode;
						commaNeeded = true;
						break;
					}
				}

				usingNode = usingNode.$parent;
			}
			else if( usingNode.type === 'Program' ) {
				blockStatement = usingNode;
				commaNeeded = true;
				break;
			}
			else if( usingNode.type === 'FunctionDeclaration' ) {
				blockStatement = usingNode.body;
				commaNeeded = true;
				break;
			}
			else {
				usingNode = usingNode.$parent;
			}

			if( ++ii > maxParentCount ) {
				// paranoiac mode on
				break;
			}
		}

		if( blockStatement ) {
			// trying to clean up temporary variable
			let previousCleanupOptions = hoistScope.$cleanups && hoistScope.$cleanups[freeVar];
			if( !previousCleanupOptions ) {
				if( !hoistScope.$cleanups ) {
					hoistScope.$cleanups = {};
				}
			}
			else {
				previousCleanupOptions.inactive = true;// turn-off previous cleanup
			}

			let cleanupOptions = {};
			let isProgramNode = usingNode.type === 'Program';

			this.alter.insertBefore(
				blockStatement.range[1] - ( isProgramNode ? 0 : 1 )
				, ";" + freeVar + " = void 0" + (commaNeeded ? ";" : "")
				, cleanupOptions
			);

			hoistScope.$cleanups[freeVar] = cleanupOptions;
		}
	}

	, findParentForScopes: function() {
		let parentScope
			, scopes = [].slice.call(arguments)
			, scopesLength = scopes.length
			, maxCounter = 0
		;

		assert(scopesLength);

		if( scopesLength === 1 ) {
			return scopes[0].closestHoistScope();
		}

		for( let i = 0 ; i < scopesLength ; ++i ) {
			let scope = scopes[i];
			scope = scopes[i] = scope.closestHoistScope();

			if( scope.node.type === "Program" ) {
				return scope;
			}
		}

		if( scopesLength === 2 ) {
			if( scopes[0] === scopes[1] ) {
				return scopes[0];
			}
		}

		let uniquePathId = UUID_PREFIX + UUID++;

		while( !parentScope && ++maxCounter < 100 ) {
			for( let i = 0 ; i < scopesLength ; ++i ) {
				let scope = scopes[i];

				if( scope.node.type === 'Program') {
					//top scope reached
					parentScope = scope;
					break;
				}

				scope = scope.parent.closestHoistScope();

				if( scope.$__path === uniquePathId ) {
					parentScope = scope;
					break;
				}

				scope.$__path = uniquePathId;
				scopes[i] = scope;
			}
		}

		return parentScope
			|| scopes[0] // could not find a parent for two or more scope's -> using first scope as a default value
		;
	}

	, bubbledVariableDeclaration: function(scope, variableName, variableInitValue, isFunction, variableNamePlaceholder) {
		scope = scope.closestHoistScope();

		let bubbledVariable = this.__isBubbledVariableDeclaration(variableName, variableInitValue);

		if( bubbledVariable ) {
			if( scope.lookup(bubbledVariable.name) ) {
				return bubbledVariable.name;
			}

			scope = this.findParentForScopes(scope, bubbledVariable.scope);
			return this.__rebaseBubbledVariableDeclaration(scope, variableName);
		}
		else {
			return this.__createBubbledVariableDeclaration(scope, variableName, variableInitValue, isFunction, void 0, variableNamePlaceholder);
		}
	}

	, __isBubbledVariableDeclaration: function(variableName, variableInitValue) {
		let bubbledVariable = this.bubbledVariables[variableName];

		if( bubbledVariable && bubbledVariable.value === variableInitValue ) {
			return bubbledVariable;
		}
		return false;
	}

	, __createBubbledVariableDeclaration: function(scope, variableName, variableInitValue, isFunction, bubbledVariable, variableNamePlaceholder) {
		if( bubbledVariable ) {
			isFunction = bubbledVariable.isFunction;
			variableName = bubbledVariable.name;
			variableInitValue = bubbledVariable.value;

			bubbledVariable.scope = scope;//rebase to the new scope
			bubbledVariable.changesOptions = {};//create new options for new changes
		}
		else {
			let name = core.unique(variableName, true);

			if( variableNamePlaceholder ) {
				variableInitValue = variableInitValue.replace(new RegExp(variableNamePlaceholder, "g"), name);
			}

			bubbledVariable = {
				name: name
				, value: variableInitValue
				, isFunction: isFunction
				, scope: scope
				, changesOptions: {}
			};
			this.bubbledVariables[variableName] = bubbledVariable;
			variableName = bubbledVariable.name;
		}

		// remove previous VariableDeclaration ?
		scope.add(variableName, "var", {
			//TODO:
		});

		if( isFunction ) {
			variableInitValue = "function " + variableName + variableInitValue
		}
		else {
			variableInitValue = "var " + variableName + " = " + variableInitValue + ";";
		}

		this.alter.insertBefore(this.__getNodeBegin(scope.node), variableInitValue, bubbledVariable.changesOptions);

		return variableName;
	}

	, __rebaseBubbledVariableDeclaration: function(scope, variableName) {
		let bubbledVariable = this.bubbledVariables[variableName];
		let latestChangesOptions = bubbledVariable.changesOptions;

		latestChangesOptions.inactive = true;//deactivate this changes

		return this.__createBubbledVariableDeclaration(scope, void 0, void 0, void 0, bubbledVariable);
	}

	, getVariableDeclarationNodes: function(variableDeclaration) {
		if( variableDeclaration.type === 'FunctionDeclaration' ) {
			return [variableDeclaration.id];
		}

		let result = [];
		let declarations = variableDeclaration.declarations;

		assert(!!declarations, "Wrong type of declaration");

		declarations.forEach(function(variableDeclarator) {
			let variableDeclaratorId = variableDeclarator.id;

			if( isArrayPattern(variableDeclaratorId) || isObjectPattern(variableDeclaratorId) ) {
				this.traverseDestructuringVariables(variableDeclaratorId, function(Identifier) {
					result.push(Identifier);
				})
			}
			else {
				result.push(variableDeclaratorId);
			}
		}, this);

		return result;
	}

	, traverseDestructuringVariables: function(definitionNode, traverse) {
		assert(isObjectPattern(definitionNode) || isArrayPattern(definitionNode));

		let _isObjectPattern = isObjectPattern(definitionNode)
			, elementsList = _isObjectPattern ? definitionNode.properties : definitionNode.elements
		;

		for( let k = 0, len = elementsList.length ; k < len ; k++ ) {
			let element = elementsList[k], elementId = _isObjectPattern ? element.value : element;
			if (element) {
				if( isObjectPattern(elementId) || isArrayPattern(elementId) ) {
					this.traverseDestructuringVariables(
						_isObjectPattern ? element.value : element
						, traverse
					);
				}
				else {
					element = _isObjectPattern ? element.value : element;

					const isSpreadElement = element.type === "SpreadElement";

					if( isSpreadElement ) {
						element = element.argument;
					}

					assert(element.type === "Identifier", 'error in "traverseDestructuringVariables". Element is "' + element.type + '"');

					if( traverse(element, isSpreadElement) === false ) {
						break;
					}
				}
			}
		}
	}

	, getDestructuringVariablesName: function(definitionNode) {
		let names = [];
		this.traverseDestructuringVariables(definitionNode, function(element) {
			names.push(element.name);
		});
		return names;
	}

	, detectDestructuringParent: function(node) {
		let parent = node.$parent;

		if( parent ) {
			if( parent.type === 'Property' ) {
				parent = parent.$parent;
				if( isObjectPattern(parent) ) {
					return parent;
				}
			}
			else if( isArrayPattern(parent) ) {
				return parent;
			}
		}

		return null;
	}

	/**
	 * check declaration for non-empty
	 * */
	, declarationContainsDeclarator: function(declarationNode, declaratorNode) {
		assert(declarationNode.type === 'VariableDeclaration', 'first parameter must be a "VariableDeclaration" node not a "' + declarationNode.type + '"');
		assert(declaratorNode.type === 'VariableDeclarator', 'second parameter must be a "VariableDeclarator" node not a "' + declaratorNode.type + '"');

		let declarations = declarationNode.declarations;
		let declaration;

		let k = 0, len = declarations.length, result;
		for(  ; k < len ; k++ ) {
			declaration = declarations[k];

			if( isObjectPattern(declaration) || isArrayPattern(declaration) ) {
				//let result; // TODO:: es6-traspiler error: line 1091: can't transform loop-closure due to use of return at line 1100. result is defined outside closure, inside loop
				this.traverseDestructuringVariables(declaration, function(declaration) {
					if( declaration === declaratorNode ) {
						result = true;
						return false;
					}
				});
				if( result === true ) {
					return true;
				}
			}
			else if( declaration === declaratorNode ) {
				return true;
			}
		}
	}

	, getVariableDeclaratorForIdentifier: function(node) {
		assert(node.type === 'Identifier', 'node must be a "Identifier" node not a "' + node.type + '"');

		let parent = node;

		while( true ) {
			parent = parent.$parent;

			if( parent.type === 'VariableDeclarator' ) {
				return parent;
			}

			if( parent.type === 'Property' ) {

			}
			else if( isArrayPattern(parent) || isObjectPattern(parent) ) {

			}
			else {
				assert(false, 'Wrong type of node "' + parent.type + '"');
			}
		}
	}

	, getNearestIIFENode: function(node) {
		let closestHoistScope = node.$scope.closestHoistScope();
		let scopeNode = closestHoistScope.node;

		while( scopeNode ) {
			let parent = scopeNode.$parent;

			if( !parent )break;

			if( scopeNode.type === "FunctionExpression" ) {

				if( parent && parent.type === "CallExpression" && parent.callee === scopeNode ) {
					return scopeNode;
				}
			}

			scopeNode = parent.$scope.closestHoistScope().node;
		}

		return null;
	}

	, getKeyName: function(keyNode) {
		let isLiteral = keyNode.type == 'Literal';
		assert(keyNode.type == 'Identifier' || isLiteral);

		return isLiteral ? keyNode.value : keyNode.name;
	}
};

for(let i in core) if( core.hasOwnProperty(i) && typeof core[i] === "function" ) {
	core[i] = core[i].bind(core);
}
