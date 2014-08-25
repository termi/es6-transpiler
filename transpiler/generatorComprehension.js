"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const tmpl = require("./../lib/tmpl");
const core = require("./core");
const forOf = require("./forOf");
const destructuring = require("./destructuring");

function isObjectPattern(node) {
	return node && node.type == 'ObjectPattern';
}

function isArrayPattern(node) {
	return node && node.type == 'ArrayPattern';
}

//const functionGeneratorConstructor =
//	"function FunctionGenerator(){};" +
//	"${FunctionGenerator}._wrap=function(FunctionGenerator,func){func.__proto__=FunctionGenerator;if(func.constructor!==FunctionGenerator)func.constructor=FunctionGenerator;func.prototype=Object.create(this);}.bind(${FunctionGenerator}.prototype,${FunctionGenerator});" +
//	"${FunctionGenerator}.prototype=Object.create(Function.prototype);" +
//	"if(${FunctionGenerator}.name!=='GeneratorFunction')${FunctionGenerator}.name='GeneratorFunction';"
//;
//this._FunctionGenerator = core.bubbledVariableDeclaration(node.$scope, "FunctionGenerator", functionGeneratorConstructor, false, "${FunctionGenerator}");

const SymbolIteratorBody = "typeof Symbol!=='undefined'&&Symbol&&Symbol.iterator||'@@iterator'";
const SymbolToStringTagBody = "typeof Symbol!=='undefined'&&Symbol&&Symbol[\"toStringTag\"]||'@@toStringTag'";
const SymbolPolyfillMarkBody = "typeof Symbol!=='undefined'&&Symbol&&Symbol[\"__setObjectSetter__\"]";
const generatorConstructor =
	"function Generator(){" +
		"if(!(this instanceof ${Generator}))throw new TypeError('incompatible'+this);" +
		"this[\"__next__\"]=arguments[0];" +
		"this[\"__throw__\"]=arguments[1];" +
	"};" +
	"${Generator}.prototype={" +
		"constructor:${Generator}," +
		"\"next\":function(val){" +
			"if(!(this instanceof ${Generator}))throw new TypeError('next method called on incompatible '+this);" +
			"if(this[\"__next__\"]){" +
				"try {" +
					"return this[\"__next__\"](val);" +
				"}catch(e){" +
					"if(this[\"__throw__\"])return this[\"__throw__\"](e);" +
					"else throw e;" +
				"}" +
			"}" +
			"else return {\"value\":void 0,\"done\":true};}," +
		"\"throw\":function(e){" +
			"if(!(this instanceof ${Generator}))throw new TypeError('throw method called on incompatible '+this);" +
			"if(this&&this[\"__throw__\"])return this[\"__throw__\"](e);else throw e" +
		"}," +
		"\"toString\":function(){return '[object Generator]'}" +
	"};" +
	"if(${Symbol_mark})${Symbol_mark}(${Generator}.prototype);" +
	"${Generator}.prototype[${Symbol_toStringTag}]='Generator';" +
	"${Generator}.prototype[${Symbol_iterator}]=function(){return this};" +
	"if(${Symbol_mark})${Symbol_mark}(void 0)"
;

const generatorHEAD = tmpl.generate("var ${done}=false;");
const generatorINIT_var = tmpl.generate("var ${init}=false;");
const generatorINIT_init = tmpl.generate("if(${init}===false){${FOROF_INIT}${init}=true;}");
const generatorSTATE_var = tmpl.generate("var ${state}=1,${next}=false;");
const generatorLOOP_BODY = tmpl.generate(
	"if(${FOROF_CHECK}){" +
		"${FOROF_VALUE};" +
		"${FILTER_AND_RETURN}" +
	"}" +
	"else{${FOROF_RESET}${VALUE_RESET}${done}=true;${DONE_SET}}"
);
const generatorBODY = tmpl.generate("return new ${Generator}(function next(${throw_error},${throw}){" +
	"if(${throw}===true){${done}=true;}" +
	"if(${done}===false){" +
		"${HEAD_INIT}" +
		"${LOOP_START}" +
			"${LOOP_BODY}" +
		"${LOOP_END}" +
	"}" +
	"if(${done}===true){${DONE_RESET};if(${throw}===true){throw ${throw_error};};${DONE}}" +
",function(err){if(this&&this[\"__next__\"]){return this[\"__next__\"](err,true);}else {throw err}})");
const generatorNEXT = tmpl.generate("${VALUE_RESET}continue;");
const generatorFILTER = tmpl.generate(
	"if(${FILTER}){${RETURN}}" +
	"else {${NEXT}}"
);
const generatorNOFILTER = tmpl.generate("${RETURN}");
const generatorRETURN = tmpl.generate("return {\"value\":${VALUE},\"done\":false};");
const generatorDONE = tmpl.generate("return {\"value\":void 0,\"done\":true};");
const generatorDONE_RESET = tmpl.generate("if(this&&this[\"__next__\"]===next){delete this[\"__next__\"];delete this[\"__throw__\"];};}");

var plugin = module.exports = {
	reset: function() {
		this.__initNames = [];
		this.__vars = {
			"done": null
			, "value": null
			, "throw": null
			, "throw_error": null
			, "state": null
			, "next": null
		};
	}

	, setup: function(alter, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.alter = alter;
		this.options = options;
	}

	, createVariables: function(initCount) {
		// We need only one unique name for the entire file

		initCount = initCount || 1;

		if ( !this.__initNames.length || initCount > this.__initNames.length ) {
			var i = 0;
			while ( i < initCount ) {
				if ( !this.__initNames[i] ) {
					this.__initNames[i] = core.unique("init", true);
				}
				i++;
			}
		}
		Object.keys(this.__vars).reduce(function(vars, key) {
			vars[key] = core.unique(key, true);
			return vars;
		}, this.__vars);
	}

	, '::ComprehensionExpression': function(node) {
		if ( !node.xGenerator ) {
			return;
		}

		let Symbol_iterator = core.bubbledVariableDeclaration(node.$scope, "S_ITER", SymbolIteratorBody);
		let Symbol_toStringTag = core.bubbledVariableDeclaration(node.$scope, "S_STAG", SymbolToStringTagBody);
		let Symbol_mark = core.bubbledVariableDeclaration(node.$scope, "S_MARK", SymbolPolyfillMarkBody);
		this._Generator = core.bubbledVariableDeclaration(
			node.$scope
			, "Generator"
			, generatorConstructor
				.replace(/\$\{Symbol_mark\}/g, Symbol_mark)
				.replace('${Symbol_iterator}', Symbol_iterator)
				.replace('${Symbol_toStringTag}', Symbol_toStringTag)
			, false
			, "${Generator}"
		);

		const blocks = node.blocks
			, body = node.body
			, filter = node.filter
		;

		this.createVariables(blocks.length);

		let replacementString = blocks.length === 1
			? !filter
				? this.createSimpleGenerator(blocks[0], body, node)
				: this.createSimpleGeneratorWithFilter(blocks[0], body, filter, node)
			: this.createGenerator(blocks, body, filter, node)
		;

		if( node.$scope.closestHoistScope().doesThisUsing() ) {
			replacementString += ".call(this)";
		}
		else {
			replacementString += "()";
		}

		this.alter.replace(
			node.range[0]
			, node.range[0] + 1
			, "(function(){"
		);
		// between node.range[0] and (node.range[0] + 1) is a place for inserting from another part of the program
		this.alter.replace(
			node.range[0] + 1
			, node.range[1]
			, replacementString
			, {applyChanges: true, "__newTransitionalSubLogic":true}
		);

	}

	, createSimpleGenerator: function(block, body, node) {
		let beforeBodyString = "";
		let variableNames = [];

		variableNames = this.getBlockVars(block, variableNames);

		block.left.kind = 'let';
		const replacementObj = forOf.createForOfReplacement(block, node, {cleanup: true, implicitDeclaration: true});

		beforeBodyString += (
			tmpl.replace(generatorHEAD + generatorINIT_var + generatorBODY, {
				HEAD_INIT: generatorINIT_init
				, FOROF_INIT: replacementObj.before
				, LOOP_START: ''
				, LOOP_BODY: generatorLOOP_BODY
				, LOOP_END: ''
				, FILTER_AND_RETURN: generatorNOFILTER
				, NEXT: generatorNEXT
				, RETURN: generatorRETURN
				, FOROF_CHECK: replacementObj.check
				, FOROF_VALUE: replacementObj.inner
				, FOROF_RESET: replacementObj.after
				, VALUE_RESET: (variableNames.length ? variableNames.join("=void 0;") + "=void 0;" : "") + ''
				, DONE: generatorDONE
				, DONE_RESET: generatorDONE_RESET
				, DONE_SET: ''
				, VALUE: this.alter.get(body.range[0], body.range[1])
				, init: this.__initNames[0]
				, Generator: this._Generator
			}, this.__vars)
		);

		return (variableNames.length ? "var " + variableNames.join(",") : "") + ";"
			+ replacementObj.declarations
			+ beforeBodyString
			+ "})"
		;
	}

	, createSimpleGeneratorWithFilter: function(block, body, filter, node) {
		let beforeBodyString = "";
		let variableNames = [];

		variableNames = this.getBlockVars(block, variableNames);

		block.left.kind = 'let';
		const replacementObj = forOf.createForOfReplacement(block, node, {cleanup: true, implicitDeclaration: true});

		beforeBodyString += (
			tmpl.replace(generatorHEAD + generatorINIT_var + generatorBODY, {
				HEAD_INIT: generatorINIT_init
				, FOROF_INIT: replacementObj.before
				, LOOP_START: 'while(true){'
				, LOOP_BODY: generatorLOOP_BODY
				, LOOP_END: '}'
				, FILTER_AND_RETURN: generatorFILTER
				, FILTER: this.alter.get(filter.range[0], filter.range[1])
				, NEXT: generatorNEXT
				, RETURN: generatorRETURN
				, FOROF_CHECK: replacementObj.check
				, FOROF_VALUE: replacementObj.inner
				, FOROF_RESET: replacementObj.after
				, VALUE_RESET: (variableNames.length ? variableNames.join("=void 0;") + "=void 0;" : "") + ''
				, DONE: generatorDONE
				, DONE_RESET: generatorDONE_RESET
				, DONE_SET: 'break;'
				, VALUE: this.alter.get(body.range[0], body.range[1])
				, init: this.__initNames[0]
				, Generator: this._Generator
			}, this.__vars)
		);

		return (variableNames.length ? "var " + variableNames.join(",") : "") + ";"
			+ replacementObj.declarations
			+ beforeBodyString
			+ "})"
		;
	}

	, createGenerator: function(blocks, body, filter, node) {
		const generatorSET_STATE = tmpl.generate("${state}=${NEXT_STATE};");
		const generatorSWITCH_NEXT = tmpl.generate("${next}=${FOROF_CHECK};if(${next}){${FOROF_VALUE}${SET_STATE}}");
		const generatorSWITCH_ELSE = tmpl.generate("else{${SET_STATE}${init_false}continue;};");

		let loopBody = "";
		let variableNames = [];
		let resetVarsStr = "";
		let headInitStr = tmpl.replace(generatorHEAD, this.__vars, {Generator: this._Generator});
		let declarationsStr = '';

		for ( let i = 0, len = blocks.length ; i < len ; i++ ) {
			let block = blocks[i];
			let isLast = i + 1 === len;
			let isFirst = i === 0;

			variableNames = this.getBlockVars(block, variableNames);

			block.left.kind = 'let';
			const replacementObj = forOf.createForOfReplacement(block, node, {cleanup: true, implicitDeclaration: true});

			headInitStr += tmpl.replace(generatorINIT_var, {init: this.__initNames[i]});
			declarationsStr += replacementObj.declarations;
			resetVarsStr += replacementObj.after;

			loopBody += (
				'case ' + (i + 1) + ':'
				+ tmpl.replace(generatorINIT_init, {FOROF_INIT: replacementObj.before, init: this.__initNames[i]})
				+ tmpl.replace(generatorSWITCH_NEXT, {
					FOROF_CHECK: replacementObj.check
					, FOROF_VALUE: replacementObj.inner
					, SET_STATE: isLast ? '' : generatorSET_STATE
					, NEXT_STATE: i + 2
				}, this.__vars)
				+ tmpl.replace(!isFirst ? generatorSWITCH_ELSE : '', {
					SET_STATE: generatorSET_STATE
					, NEXT_STATE: i//prev state
					, init_false: this.__initNames[i] + '=false;' + replacementObj.after
				})
				+ (isFirst ? 'else {break;}' : '')
			);
		}

		let bodyStr = tmpl.replace(generatorSTATE_var + generatorBODY, {
			HEAD_INIT: ''
			, LOOP_START: tmpl.generate('while(true){${next}=false;switch(${state}){')
			, LOOP_BODY: loopBody + '}'/*switch*/ + generatorLOOP_BODY
			, LOOP_END: '}'/*while*/
			, VALUE_RESET: (variableNames.length ? variableNames.join("=void 0;") + "=void 0;" : "") + ''
			, DONE: generatorDONE
			, DONE_RESET: resetVarsStr + generatorDONE_RESET
			, FOROF_CHECK: this.__vars["next"]
			, FOROF_VALUE: ''
			, FILTER_AND_RETURN: filter ? generatorFILTER : generatorNOFILTER
			, RETURN: generatorRETURN
			, FILTER: filter ? this.alter.get(filter.range[0], filter.range[1]) : ''
			, VALUE: this.alter.get(body.range[0], body.range[1])
			, NEXT: 'continue;'
			, FOROF_RESET: ''
			, DONE_SET: 'break'
			, Generator: this._Generator
		}, this.__vars);

		return (variableNames.length ? "var " + variableNames.join(",") : "") + ";"
			+ declarationsStr
			+ headInitStr
			+ bodyStr
			+ "})"
		;
	}

	, getBlockVars: function(block, preNames) {
		let variableNames = preNames || [];

		let variableBlock = block.left;

		if( variableBlock.type === "Identifier") {
			variableNames.push(variableBlock.name);
		}
		else if(isObjectPattern(variableBlock) || isArrayPattern(variableBlock)) {
			// TODO:: replace forOf.createForOfReplacement().declarations with this implementation
		}
		else {
			assert(false)
		}

		return variableNames;
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
