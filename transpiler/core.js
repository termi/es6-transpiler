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
	return is.someof(kind, ["const", "let"]);
}

function isVarConstLet(kind) {
	return is.someof(kind, ["var", "const", "let"]);
}

function isNonFunctionBlock(node) {
	return node.type === "BlockStatement" && is.noneof(node.$parent.type, ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);
}

function isForWithConstLet(node) {
	return node.type === "ForStatement" && node.init && node.init.type === "VariableDeclaration" && isConstLet(node.init.kind);
}

function isForInWithConstLet(node) {
	return node.type === "ForInStatement" && node.left.type === "VariableDeclaration" && isConstLet(node.left.kind);
}

function isFunction(node) {
	return is.someof(node.type, ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);
}

function isLoop(node) {
	return is.someof(node.type, ["ForStatement", "ForInStatement", "WhileStatement", "DoWhileStatement"]);
}

function isReference(node) {
	const parent = node.$parent;
	return node.$refToScope ||
		node.type === "Identifier" &&
			!(parent.type === "VariableDeclarator" && parent.id === node) && // var|let|const $
			!(parent.type === "MemberExpression" && parent.computed === false && parent.property === node) && // obj.$
			!(parent.type === "Property" && parent.key === node) && // {$: ...}
			!(parent.type === "LabeledStatement" && parent.label === node) && // $: ...
			!(parent.type === "CatchClause" && parent.param === node) && // catch($)
			!(isFunction(parent) && parent.id === node) && // function $(..
			!(isFunction(parent) && is.someof(node, parent.params)) && // function f($)..
			true;
}

function isLvalue(node) {
	return isReference(node) &&
		((node.$parent.type === "AssignmentExpression" && node.$parent.left === node) ||
			(node.$parent.type === "UpdateExpression" && node.$parent.argument === node));
}

function isObjectPattern(node) {
	return node && node.type === 'ObjectPattern';
}

function isArrayPattern(node) {
	return node && node.type === 'ArrayPattern';
}


let core = module.exports = {
    alter: alter,

	traverse: traverse,

	reset: function() {
		this.allIdentifiers = stringset();

		this.outermostLoop = null;
		this.functions = [];
        this.offsets = [];

		this.uniqueStart = "[<" + ((Math.random() * 1e8) | 0);//should matches /\[\<\d{8}/
		this.uniqueSeparator = "" + ((Math.random() * 1e8) | 0);//should matches /\d{8}/
		this.uniqueEnd = ((Math.random() * 1e8) | 0) + ">]";//should matches /\d{8}\>\]/
		this.uniqueRE = new RegExp("\\[\\<\\d{" + (this.uniqueStart.length - 2) + "}\\[(\\d+)\\]\\d{" + this.uniqueSeparator.length + "}\\[(\\d+)\\]\\d{" + (this.uniqueEnd.length - 2) + "}\\>\\]", "g");
	}

	, setup: function(changes, ast, options, src) {
		if( !this.__isInit ) {
		this.reset();
			this.__isInit = true;
		}

		this.changes = changes;
		this.src = src;
		this.options = options;
	}

	, pre: function(ast) {
		// setup scopes
		traverse(ast, {pre: this.createScopes});
		const topScope = this.createTopScope(ast.$scope, this.options.environments, this.options.globals);

		// allIdentifiers contains all declared and referenced vars
		// collect all declaration names (including those in topScope)
		const allIdentifiers = this.allIdentifiers;
		topScope.traverse({pre: function(scope) {
			allIdentifiers.addMany(scope.decls.keys());
		}});

		// setup node.$refToScope, check for errors.
		// also collects all referenced names to allIdentifiers
		traverse(ast, {pre: this.setupReferences});

		// static analysis passes//TODO:: separate transpiler
		traverse(ast, {pre: this.detectLoopClosuresPre, post: this.detectLoopClosuresPost});
		traverse(ast, {pre: this.detectConstAssignment});

		return false;
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

	, createScopes: function (node, parent) {
		assert(!node.$scope);

		node.$parent = parent;
		node.$scope = node.$parent ? node.$parent.$scope : null; // may be overridden

		function addParamToScope(param) {
			if( param === null ){
				return;
			}

			if( isObjectPattern(param) ) {
				param.properties.forEach(addParamToScope);
			}
			else if( param.type === "Property" ) {//from objectPattern
				addParamToScope(param.value);
			}
			else if( isArrayPattern(param) ) {
				param.elements.forEach(addParamToScope);
			}
			else {
				node.$scope.add(param.name, "param", param, null);
			}
		}

		function addVariableToScope(variable, kind, originalDeclarator) {
			if( isObjectPattern(variable) ) {
				variable.properties.forEach(function(variable) {
					addVariableToScope(variable, kind, originalDeclarator);
				});
			}
			else if( variable.type === "Property" ) {//from objectPattern
				addVariableToScope(variable.value, kind, originalDeclarator);
			}
			else if( isArrayPattern(variable) ) {
				variable.elements.forEach(function(variable) {
					if( variable ) {
						addVariableToScope(variable, kind, originalDeclarator);
					}
				});
			}
			else if( variable.type === "SpreadElement" ) {//from arrayPattern
				node.$scope.add(variable.argument.name, kind, variable, variable.range[1], originalDeclarator);
			}
			else {
				node.$scope.add(variable.name, kind, variable, variable.range[1], originalDeclarator);
			}
		}

		if (node.type === "Program") {
			// Top-level program is a scope
			// There's no block-scope under it
			node.$scope = new Scope({
				kind: "hoist",
				node: node,
				parent: null
			});

			/* Due classBodyReplace is separate process, we do not really need this check
			 } else if (node.type === "ClassDeclaration") {
			 assert(node.id.type === "Identifier");

			 node.$parent.$scope.add(node.id.name, "fun", node.id, null);
			 */
		} else if (isFunction(node)) {
			// Function is a scope, with params in it
			// There's no block-scope under it
			// Function name goes in parent scope
			if (node.id) {
	//            if (node.type === "FunctionExpression") {
	//                console.dir(node.id);
	//            }
	//            assert(node.type === "FunctionDeclaration"); // no support for named function expressions yet

				assert(node.id.type === "Identifier");
				node.$parent.$scope.add(node.id.name, "fun", node.id, null);
			}

			node.$scope = new Scope({
				kind: "hoist",
				node: node,
				parent: node.$parent.$scope
			});

			node.params.forEach(addParamToScope);

		} else if (node.type === "VariableDeclaration") {
			// Variable declarations names goes in current scope
			assert(isVarConstLet(node.kind));
			node.declarations.forEach(function(declarator) {
				assert(declarator.type === "VariableDeclarator");

				if (this.options.disallowVars && node.kind === "var") {
					error(getline(declarator), "var {0} is not allowed (use let or const)", name);
				}

				addVariableToScope(declarator.id, node.kind, declarator);
			}, this);

		} else if (isForWithConstLet(node) || isForInWithConstLet(node)) {
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
			node.$scope.add(identifier.name, "caught", identifier, null);

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
			let thisFunctionScope = node.$scope.closestHoistScope(), functionNode = thisFunctionScope.node;

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
	 */
	, setupReferences: function(node) {
		if (isReference(node)) {
			this.allIdentifiers.add(node.name);

			const scope = node.$scope.lookup(node.name);
			if (!scope && this.options.disallowUnknownReferences) {
				error(getline(node), "reference to unknown global variable {0}", node.name);
			}
			// check const and let for referenced-before-declaration
			if (scope && is.someof(scope.getKind(node.name), ["const", "let"])) {
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
		}
	}

	, detectLoopClosuresPre: function detectLoopClosuresPre(node) {
		if (this.outermostLoop === null && isLoop(node)) {
			this.outermostLoop = node;
		}
		if (!this.outermostLoop) {
			// not inside loop
			return;
		}

		// collect function-chain (as long as we're inside a loop)
		if (isFunction(node)) {
			this.functions.push(node);
		}
		if (this.functions.length === 0) {
			// not inside function
			return;
		}

		if (isReference(node) && isConstLet(node.$refToScope.getKind(node.name))) {
			let n = node.$refToScope.node;

			// node is an identifier
			// scope refers to the scope where the variable is defined
			// loop ..-> function ..-> node

			let ok = true;
			while (n) {
//            n.print();
//            console.log("--");
				if (n === this.functions[this.functions.length - 1]) {
					// we're ok (function-local)
					break;
				}
				if (n === this.outermostLoop) {
					// not ok (between loop and function)
					ok = false;
					break;
				}
//            console.log("# " + scope.node.type);
				n = n.$parent;
//            console.log("# " + scope.node);
			}
			if (ok) {
//            console.log("ok loop + closure: " + node.name);
			} else {
				error(getline(node), "can't transform closure. {0} is defined outside closure, inside loop", node.name);
			}


			/*
			 walk the scopes, starting from innermostFunction, ending at this.outermostLoop
			 if the referenced scope is somewhere in-between, then we have an issue
			 if the referenced scope is inside innermostFunction, then no problem (function-local const|let)
			 if the referenced scope is outside this.outermostLoop, then no problem (const|let external to the loop)

			 */
		}
	}

	, detectLoopClosuresPost: function detectLoopClosuresPost(node) {
		if (this.outermostLoop === node) {
			this.outermostLoop = null;
		}
		if (isFunction(node)) {
			this.functions.pop();
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
	unwrapSpreadDeclaration: function(node, donor, fromIndex) {
		assert(node.type === "Identifier");

		return node.name + " = [].slice.call(" + donor + ", " + fromIndex + ")";
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
	 * @param {string} type
	 */
	defaultString: function(node, value, type) {
		assert(node.type === "Identifier");

		return "if(" + node.name + " === void 0)" + node.name + " = " + value;
	}

	,

	__assignmentString: function(node) {
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

		let result = left.name + " = ";
		let valueString = right["object"].name + core.PropertyToString(right["property"]);

		if( isAssignmentExpression ) {
			result += "(";
		}

		if( typeof destructuringDefaultNode === "object" ) {
			let tempVar = core.getScopeTempVar(node.$scope);

			result += (
				"((" + tempVar + " = " + valueString + ") === void 0 ? " + core.stringFromSrc(destructuringDefaultNode) + " : " + tempVar + ")"
			);

			core.setScopeTempVar(node.$scope, tempVar);
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


	,
	/**
	 *
	 * @param {(Object|number)} nodeOrFrom
	 * @param {number=} to
	 * @returns {string}
	 */
	stringFromSrc: function(nodeOrFrom, to) {
        let from;

		if( typeof nodeOrFrom === "object" ) {
            from = nodeOrFrom.range[0];
            to = nodeOrFrom.range[1];
		}
		else if( typeof nodeOrFrom === "number" && typeof to === "number" ) {
            from = nodeOrFrom;
		}
		else {
			throw new Error();
		}

		return this.uniqueStart + "[" + from + "]" + this.uniqueSeparator + "[" + to + "]" + this.uniqueEnd;
	}

	, getScopeTempVar: function(scope) {
		assert(scope instanceof Scope, scope + " is not instance of Scope");

		scope = scope.closestHoistScope();

		var freeVar = scope.popFree();

		if( !freeVar ) {
			freeVar = core.unique("$D", true);
			scope.add(freeVar, "var", {});

			let hoistScopeNode = scope.node;
			let hoistScopeNodeBody = hoistScopeNode.body;
			let insertInto;

			if( hoistScopeNodeBody.length ) {
				hoistScopeNodeBody = hoistScopeNodeBody[0];
			}
			insertInto = hoistScopeNodeBody.range[0];
			if( isFunction(hoistScopeNode) ) {
				insertInto++;
			}

			this.changes.push({
				start: insertInto,
				end: insertInto,
				str: "var " + freeVar + ";",
				priority: 0
			});
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

	, setScopeTempVar: function(scope, freeVar) {
		assert(scope instanceof Scope, scope + " is not instance of Scope");
		assert(typeof freeVar === "string");

		scope = scope.closestHoistScope();

		scope.pushFree(freeVar);
	}
};

function getPositionsWithOffset(offsets, positionFrom, positionTo) {
	if( offsets && offsets.length ) {
		let originalFrom = positionFrom, originalTo = positionTo;

		for( let offset in offsets ) if( offsets.hasOwnProperty(offset) ) {
			// Fast enumeration through array MAY CAUSE PROBLEM WITH WRONG ORDER OF ARRAY ITEM, but it is unlikely
			offset = offset | 0;

			let offsetValue = offsets[offset];

			if( offset <= originalTo ) {
				if( offset <= originalFrom ) {
					positionFrom += offsetValue;
				}
				positionTo += offsetValue;
			}
			else {
				break;
			}
		}
	}

	return [
		positionFrom
		, positionTo
	]
}

/**
 * @this {core}
 * @param {string} sourceString
 * @param {Array.<{start: number, end: number}>} fragments
 * @returns {string}
 */
function alter(sourceString, fragments) {
    "use strict";

    assert(typeof sourceString === "string");
    assert(Array.isArray(fragments));
    assert(!!fragments.length);

    let offsets = this.offsets;

    if( fragments[0].originalIndex === void 0 ) {
	    fragments = fragments.map(function(v, index) {
		    v.originalIndex = index;
		    return v;
	    });
    }

    fragments.sort(function(a, b) {
        var result = a.start - b.start;

        if( result === 0 ) {
			if( a.reverse && b.reverse && a.start === a.end && b.start === b.end ) {
				result = -1;//-(a.originalIndex - b.originalIndex)
			}
			else if( a.start === a.end ) {
				result = -1;//-(a.originalIndex - b.originalIndex)
			}
            else {
				result = 1;//a.originalIndex - b.originalIndex
			}
        }
		result = a.end - b.end;

		if( result === 0 ){
			if( a.priority === 0 ) {
				if( b.priority === 0 ) {
					result = -(a.originalIndex - b.originalIndex);
				}
				else {
					result = -1;
				}
			}
			else if( b.priority === 0 ) {
				if( a.priority === 0 ) {
					result = (a.originalIndex - b.originalIndex);
				}
				else {
					result = 1;
				}
			}
		}

		return (result === 0 ? ( (result = a.start - b.start) === 0 ? a.originalIndex - b.originalIndex : result) : result);
    });

	// create sub fragments
	for( let len = fragments.length - 1, lastStart, lastEnd, groupFrag ; len >= 0 ;  len-- ) {
		let frag = fragments[len];

		if( lastEnd && frag.start >= lastStart && frag.end < lastEnd ) {
			if( !groupFrag.subFragments ) {
				groupFrag.subFragments = [];
			}
			groupFrag.subFragments.unshift(frag);
			fragments.splice(len, 1);
		}
		else {
			lastStart = frag.start;
			lastEnd = frag.end;
			groupFrag = frag;
		}
	}

    var outsStr = "", outs = [];

    var clearPos = 0, pos = 0, posOffset = 0, posInnerOffset = 0;
	var currentOffsets = offsets.slice();

    for (var i = 0; i < fragments.length; i++) {
        var frag = fragments[i];

		var $__0 = getPositionsWithOffset(currentOffsets, frag.start, frag.end);
	    var from = $__0[0], to = $__0[1];

	    assert(
		    (pos + posOffset) <= from
			|| from === to//nothing to remove
			, "'pos' (" + (pos + posOffset) + ") shoulde be lq 'start' (" + from + ") or 'start' (" + from + ") equal 'end' (" + to + ")"
        );
        assert(from <= to);

		if( frag.subFragments ) {
			this.offsets = offsets.slice();
			outsStr += outs.join("");
			sourceString = this.alter(outsStr + sourceString.slice(pos + posOffset, from) + sourceString.slice(from, to) + sourceString.substring(to), frag.subFragments);
			let offsetPos = getPositionsWithOffset(offsets, 0, clearPos)[1];
			posOffset = offsetPos - pos;
			let posInnerOffsetAdd = 0;
			this.offsets.forEach(function(v, index) {
				if(index >= offsetPos) {
					offsets[index - posOffset - posInnerOffset] = v;
					posInnerOffsetAdd += v;
				}
			});
			posInnerOffset += posInnerOffsetAdd;
			this.offsets = offsets;
			currentOffsets = offsets.slice();
			$__0 = getPositionsWithOffset(currentOffsets, frag.start, frag.end);
			from = $__0[0];
			to = $__0[1];
			outs = [];
		}

		let string = frag.str.replace(this.uniqueRE, function(str, from, to) {
			to |= 0;

			var $__0 = getPositionsWithOffset(currentOffsets, from | 0, to);

			return sourceString.substring($__0[0], $__0[1]);
		});

		if( typeof frag.transform === "function" ) {
			string = frag.transform.call(frag, string);
		}

		let offset = string.length - ( to - from );
		if( offset ) {
			let newIndex = from - posOffset - posInnerOffset
				, oldValue = offsets[newIndex] | 0
			;
			offsets[newIndex] = oldValue + offset;
		}

		outs.push(sourceString.slice(pos + posOffset, from));
		outs.push(string);

        pos = to - posOffset;
	    clearPos = frag.end;
    }
    if ((pos + posOffset) < sourceString.length) {
        outs.push(sourceString.slice(pos + posOffset));
    }

    return outsStr + outs.join("");
}



for(let i in core) if( core.hasOwnProperty(i) && typeof core[i] === "function" ) {
	core[i] = core[i].bind(core);
}
