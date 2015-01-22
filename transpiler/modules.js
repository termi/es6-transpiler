"use strict"

const assert = require("assert");
const stringmap = require("stringmap");
const core = require("./core");

let plugin = module.exports = {
	reset: function() {
		this.__statistic = {
			requires: {}
		};
	}
	
	, setup: function(alter, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}
		
		this.alter = alter;
		this.options = options;
		
		core.registerVar('MD', {name:'MD'});
		core.registerVar('i', {persistent: true});
	}
	
	, isKnownModule: function(node) {
		return node.source.raw in this.__statistic.requires;
	}
	
	, getModule: function(node) {
		return this.__statistic.requires[node.source.raw];
	}
	
	, getOrAddModule: function(node) {
		let requirePath = node.source.raw;
		
		if (!(this.isKnownModule(node))) {
			let modName = this.__statistic.requires[requirePath] = core.getScopeTempVar(node, node.$scope, null, 'MD');
			this.alter.insertBefore(node.range[0], modName + ' = require(' + node.source.raw + ');\n');
		}
		return this.getModule(node);
	}
	
	, ':: ImportDeclaration': function replaceImportDeclaration(node, astQuery) {
		var specifier, name, replaceString, modName;
		
		switch (node.kind) {
			// import "module"
			case undefined:
				this.alter.replace(node.range[0], node.range[1], 'require(' + node.source.raw + ');\n');
				break;
			
			// import name from "module"
			case 'default':
				specifier = node.specifiers[0];
				assert(specifier, "default import without specifier: " + node);
				name = specifier.name ? specifier.name.name : specifier.id.name;
				replaceString = 'var ' + name + ' = require(' + node.source.raw + ');\n';
				this.alter.replace(node.range[0], node.range[1], replaceString);
				break;
			
			// import {name, name2 as name3} from "module"
			case 'named':
				modName = this.getOrAddModule(node);
				
				for (let i = 0, l = node.specifiers.length; i < l; i++) {
					specifier = node.specifiers[i];
					name = specifier.name ? specifier.name.name : specifier.id.name;
					replaceString = 'var ' + name + ' = ' + modName + '.' + specifier.id.name + ';\n';
					this.alter.insertAfter(node.range[1], replaceString);
				}
				this.alter.replace(node.range[0], node.range[1], '');
		}
	}
	
	, '::ExportDeclaration': function replaceExportDeclaration(node) {
		var specifier, name, len, i, modName, exportString;
		
		if (node.declaration) {
			// export default name =  value
			if (Array.isArray(node.declaration)) {
				assert(node.declaration.length === 1, "cannot export more than a single declaration");
				assert(node.declaration[0].id.name === "default", "invalid export format `export name = value1`");
				
				name = node.declaration[0].id.name;
				i = node.range[0]; // start of the "export default"
				exportString = "module.exports = ";
				
				if (node.declaration[0].init) {
					this.alter.replace(i, node.declaration[0].init.range[0], exportString);
				}
				else {
					this.alter.replace(i, node.declaration[0].range[1], exportString);
				}
			}
			else {
				// export var name = value -> var name = module.exports.name = value
				// export function name() {} -> function name() {} module.exports.name = name;
				// export class name() {} -> class name {} module.exports.name = name;
				
				// replace "export "
				this.alter.replace(node.range[0], node.declaration.range[0], '');
				
				switch (node.declaration.type) {
					case "VariableDeclaration":
						node.declaration.declarations.forEach(function(declaration) {
							this.alter.insertAfter(declaration.id.range[1], " = module.exports." + declaration.id.name);
						}, this);
						break;
					case "FunctionDeclaration":
					case "ClassDeclaration":
						name = node.declaration.id.name;
						this.alter.insertAfter(node.declaration.range[1], "\nmodule.exports." + name + " = " + name + ";");
						break;
					default:
						assert(false, "Unknown declaration type: " + node.declaration.type);
				}
			}
		}
		else if (node.source) {
			
			// export * from "module"
			if (node.specifiers.length === 1 && node.specifiers[0].type === "ExportBatchSpecifier") {
				modName = this.getOrAddModule(node);
				let keyId = core.createVars(node, 'i');
				this.alter.replace(node.range[0], node.range[1],
					"for (let " + keyId + " in " + modName + " ) " +
					"module.exports[" + keyId + "] = " + modName + "[" + keyId + "];"
				)
			}
			// export {name, name2 as name3} from "module"
			else {
				modName = this.getOrAddModule(node);
				this.alter.replace(node.range[0], node.range[1], '');
				node.specifiers.forEach(function(specifier) {
					let name = specifier.name ? specifier.name.name : specifier.id.name;
					this.alter.insertAfter(node.range[1], "module.exports." + name + " = " + modName + "." + specifier.id.name + ";");
				}, this);
			}
		}
		else if (node.specifiers) {
			// export {name, name2 as name3}
			
			node.specifiers.forEach(function(specifier) {
				let name = specifier.name ? specifier.name.name : specifier.id.name;
				this.alter.insertAfter(node.range[1], "module.exports." + name + " = " + specifier.id.name + ";");
			}, this);
			this.alter.replace(node.range[0], node.range[1], '');
		}
		else {
			assert(false, "unknown export declaration syntax");
		}
	}
	
	, ':: ModuleDeclaration': function replaceModuleDeclaration(node) {
		var modName = this.getOrAddModule(node), replaceString;
		
		replaceString = 'var ' + node.id.name + ' = ' + modName +';\n';
		this.alter.replace(node.range[0], node.range[1], replaceString);
	}
};

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
