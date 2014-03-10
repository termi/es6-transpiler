"use strict";

require("es5-shim");
require("es6-shim");

const fs = require("fs");
const traverse = require("./lib/traverse");
const error = require("./lib/error");
const defaultOptions = require("./options");
const core = require("./transpiler/core");
const StringAlter = require("./lib/StringAlter-es5");
const is = require("simple-is");
const ASTQuery = require("astquery");

let plugins = [
	core
	, require("./transpiler/classes")
	, require("./transpiler/loopClosures")
	, require("./transpiler/letConst")
	, require("./transpiler/objectLiteral")
	, require("./transpiler/functions")
	, require("./transpiler/spread")
	, require("./transpiler/destructuring")
	, require("./transpiler/quasiLiterals")
	, require("./transpiler/arrayComprehension")
	, require("./transpiler/forOf")
	, require("./transpiler/optimiser")
	, require("./transpiler/unicode")

	, {
		setup: function(config) {
			this.__cleanup = config.cleanup;
		}

		, before: function() {
			return !!this.__cleanup;
		}

		, pre: function cleanupTree(node) {
			for (let prop in node) {
				if (prop[0] === "$") {
					delete node[prop];
				}
			}
		}
	}
];

module.exports = {
	runned: false

	, setupPlugins: function(config) {
		var optionsList = this.optionsList = [];

		config.esprima = this.esprima;

		plugins.forEach(function(plugin, index) {
			var options = optionsList[index] = {}, passIt = false;

			if( typeof plugin.setup === "function" ) {
				for(let i in config)if(config.hasOwnProperty(i))options[i] = config[i];

				if( plugin.setup(this.alter, this.ast, options, this.src) === false ) {
					passIt = options.passIt = true;
				}
			}

			if ( passIt === false ) {
				let pluginsAstQuerySteps = Object.keys(plugin)
					.filter(function(prop){ return prop.substr(0, 2) == "::" } )
					.map(function(prop){ return prop.substr(2) })
				;

				pluginsAstQuerySteps.forEach(function(astQueryStep) {
					let callback;
					if ( !(callback = this._astQuerySteps[astQueryStep]) ) {
						callback = this._astQuerySteps[astQueryStep] = function callback(node) {
							let steps = callback["__steps"];
							for ( let i = 0, length = steps.length ; i < length ; i++ ) {
								steps[i](node);
							}
						};
						callback["__steps"] = [];
					}
					callback["__steps"].push(plugin["::" + astQueryStep]/*.bind(plugin)*/);
				}, this);
			}
		}, this);
	}

	, applyChanges: function(config, doNotReset) {
		if( this.alter.hasChanges() ) {// has changes in classes replacement Step
			this.src = this.alter.apply();

			if( doNotReset !== true ) {
				this.ast = this.esprima.parse(this.src, {
					loc: true,
					range: true
				});

				error.reset();
				core.reset();

				this.alter = new StringAlter(this.src);
			}

			if( config ) {
				this.setupPlugins(config);
			}
		}
	}
	, reset: function() {
		this.ast = this.src = null;
		error.reset();

		plugins.forEach(function(plugin) {
			if( typeof plugin.reset === "function" ) {
				plugin.reset();
			}
		});

		this._astQuerySteps = {};
	}

	, run: function run(config) {
		for(let i in defaultOptions)if(defaultOptions.hasOwnProperty(i) && !config.hasOwnProperty(i))config[i] = defaultOptions[i];

		if( this.runned === true ) {
			this.reset();
		}
		this._astQuerySteps = {};
		this.runned = true;

		config.fullES6 = true;// by default for now
		config.environments = Array.isArray(config.environments) ? config.environments : [
			// by default
			"browser"
			, "node"
		];

		if( config.resetUnCapturedVariables === true ) {
			config.resetUnCapturedVariables = ['let', 'const', 'fun', 'var'];
		}
		else if( !Array.isArray(config.resetUnCapturedVariables) ) {
			config.resetUnCapturedVariables = [];
		}

		//esprima
		let esprima;
		if( config.fullES6 === true ) {
			esprima = require("./lib/esprima_harmony");
		}
		else {
			esprima = require("esprima");
		}
		this.esprima = esprima;

		// input
		let isSourceInput = false;
		if( typeof config.filename === "string" ) {
			this.src = String(fs.readFileSync(config.filename));
			isSourceInput = true;
		}
		else if( typeof config.src === "string" || typeof config.src === "object" ) {
			this.src = String(config.src);
			isSourceInput = true;
		}
		else if( typeof config.ast === "object" ) {
			throw new Error("Currently unsupported");
			/*
			src = null;
			ast = config.ast;
			*/
		}

		if( !this.ast && isSourceInput ) {
			this.ast = esprima.parse(this.src, {
				loc: true,
				range: true
			});
		}
		else {
			throw new Error("Input not found " + config.filename);
		}

		this.alter = new StringAlter(this.src);

		// output
		const output = {errors: [], src: ""};

		this.setupPlugins(config);

		let astQuery = new ASTQuery(this.ast);
		astQuery.on(this._astQuerySteps);

		plugins.forEach(function(plugin, index) {
			var options = this.optionsList[index];

			if( options.passIt === true ) {
				return;
			}

			if( typeof plugin.before === "function" ) {
				if( plugin.before(this.ast) === false ) {
					return;
				}
			}

			if( typeof plugin.pre === "function" || typeof plugin.post === "function" ) {
				traverse(this.ast, {pre: plugin.pre, post: plugin.post});
			}

			if( typeof plugin.after === "function" ) {
				if( plugin.after(this.ast, output) === false ) {
					return;
				}
			}

			if( options.applyChangesAfter ) {
				this.applyChanges(config);
			}
		}, this);

		// output
		if( error.errors.length ) {
			output.exitcode = -1;
			output.errors = error.errors;
		}
		else if (config.outputType === "ast") {
			// return the modified AST instead of src code
			// get rid of all added $ properties first, such as $parent and $scope
			traverse(this.ast, {cleanup: true});

			output.ast = this.ast;
		}
		else {
			// apply changes produced by varify and return the transformed src
			//console.log(changes);var transformedSrc = "";try{ transformedSrc = alter(src, changes) } catch(e){ console.error(e+"") };

			this.applyChanges(null, true);
			output.src = this.src;
		}

		if( config.errorsToConsole ) {
			if ( output.errors.length ) {
				process.stderr.write(output.errors.join("\n"));
				process.stderr.write("\n");
				process.exit(-1);
			}
		}

		if( config.outputToConsole === true	) {
			outputToConsole(output, config);
		}

		if( config.outputFilename ) {
			fs.writeFileSync(config.outputFilename, output.src)
		}
		return output;
	}

};

function outputToConsole(output, config) {
	if (config.outputType === "stats" && output.stats) {
		process.stdout.write(output.stats.toString());
		process.exit(0);
	}
	if (config.outputType === "ast" && output.ast) {
		process.stdout.write(JSON.stringify(output.ast, null, 4));
	}
	if (output.src) {
		process.stdout.write(output.src);
	}
	process.exit(0);
}
