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
	 */
	defaultString: function(node, value) {
		assert(node.type === "Identifier");

		return "if(" + node.name + " === void 0)" + node.name + " = " + value;
	}

	,
	/**
	 *
	 * @param {(Object|number)} nodeOrFrom
	 * @param {number=} to
	 * @returns {string}
	 */
	stringFromSrc: function(nodeOrFrom, to) {
        let offsets = this.offsets;
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

		let originalFrom = from, originalTo = to;
        if( offsets.length ) {

            for( let offset in offsets ) if( offsets.hasOwnProperty(offset) ) {
	            // Fast enumeration through array MAY CAUSE PROBLEM WITH WRONG ORDER OF ARRAY ITEM, but it is unlikely
                offset = offset | 0;
	            let offsetValue = offsets[offset];

                if( offset <= originalTo ) {
                    if( offset <= originalFrom ) {
                        from += offsetValue;
                    }
                    to += offsetValue;
                }
                else {
                    break;
                }
            }
        }

        return this.src.substring(from, to)
	}
};

/**
 * @this {core}
 * @param {string} str
 * @param {Array.<{start: number, end: number}>} fragments
 * @param {boolean=} safeOffset
 * @returns {string}
 */
function alter(str, fragments, safeOffset) {
    "use strict";

    assert(typeof str === "string");
    assert(Array.isArray(fragments));

    let offsets = this.offsets;

    fragments = fragments.map(function(v, index) {
        v.originalIndex = index;
        return v;
    }); // copy before destructive sort

    fragments.sort(function(a, b) {
        var result = a.start - b.start;
        if( result === 0 ) {
			if( a.reverse && b.reverse && a.start === a.end && b.start === b.end ) {
				result = -(a.originalIndex - b.originalIndex);
			}
            else {
				result = a.originalIndex - b.originalIndex;
			}
        }
        return result;
    });

    // smart-filter for changes: If one change A full-overwrite one or more changes B -> remove B
    for( let i = 0, len = fragments.length ; i < len ; i++ ) {
        let frag = fragments[i], nextFrag;

        do {
            if( nextFrag = fragments[i + 1] ) {
                if( nextFrag.start === frag.start && (frag.start !== frag.end) ) {
                    if( nextFrag.start === nextFrag.end ) {
                        nextFrag = null;
                    }
                    else if( nextFrag.end === frag.end && nextFrag.originalIndex > frag.originalIndex || nextFrag.end > frag.end ) {
                        fragments.splice(i, 1);//remove current fragment
                        frag = nextFrag;
                    }
                    else {
                        fragments.splice(i + 1, 1);//remove next fragment
                    }
                    len--;
                }
                else if( frag.end > nextFrag.start && frag.end >= nextFrag.end ) { // nextFrag.start is <= frag.start due of previous sorting
                    fragments.splice(i + 1, 1);//remove next fragment
                    len--;
                }
                else {
                    nextFrag = null;
                }
            }
        }
        while( nextFrag );
    }

    var outs = [];

    var pos = 0;
	var currentOffsets = offsets.slice();

    //console.log(fragments);

    for (var i = 0; i < fragments.length; i++) {
        var frag = fragments[i];
	    var from = frag.start, to = frag.end;

	    if( currentOffsets.length ) {
		    let originalFrom = from, originalTo = to;

		    for( let offset in currentOffsets ) if( currentOffsets.hasOwnProperty(offset) ) {
			    // Fast enumeration through array MAY CAUSE PROBLEM WITH WRONG ORDER OF ARRAY ITEM, but it is unlikely
			    offset = offset | 0;

			    let offsetValue = currentOffsets[offset];

			    if( offset <= originalTo ) {
				    if( offset <= originalFrom ) {
					    from += offsetValue;
				    }
				    to += offsetValue;
			    }
			    else {
				    break;
			    }
		    }
	    }

        assert(pos <= from
			|| from === to//nothing to remove
			, "'pos' (" + pos + ") shoulde be lq " + from + " or " + from + " equal " + to
        );
        assert(from <= to);

	    //console.log(pos, frag.str, frag.start, frag.end)
        if( safeOffset ) {
            let offset = frag.str.length - (to - from);
            if(offset) {
                offsets[from] = offset;
            }
        }

        outs.push(str.slice(pos, from));
        outs.push(frag.str);
        pos = to;
    }
    if (pos < str.length) {
        outs.push(str.slice(pos));
    }

	//offsets && console.log(offsets.map(function(a, index){ return a && index } ).filter(function(a){ return !!a }))

    return outs.join("");
}



for(let i in core) if( core.hasOwnProperty(i) && typeof core[i] === "function" ) {
	core[i] = core[i].bind(core);
}
