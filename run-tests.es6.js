"use strict";

const fs = require("fs");
const path = require("path");
const ansidiff = require("ansidiff");
const es6transpiler = require("./es6-transpiler");

const EOF_STRING = '/* <[tests es6-transpiler test file EOF ]> */';
const SUSPENDED_STRING = '/* <[tests es6-transpiler SUSPENDED test file ]> */';

const commandVariables = {};
process.argv.forEach(function(arg, index, array) {
	var nextArg;
	if( arg.indexOf("--") === 0 ) {
		if( (nextArg = array[index + 1]) && nextArg.indexOf("--") !== 0 ) {
			this[arg.substring(2)] = nextArg.indexOf("--") === 0 ? true : nextArg;
		}
		else {
			this[arg.substring(2)] = true;
		}
	}
}, commandVariables);


function slurp(filename) {
    return fs.existsSync(filename) ? String(fs.readFileSync(filename)) : "";
}

let pathToTests = commandVariables.path;

if( !pathToTests ) {
	pathToTests = fs.existsSync("tests") ? "tests" : path.join("..", "..", "tests");
}

let tests;
if( commandVariables.file && typeof commandVariables.file === "string" ) {
	tests = [
		commandVariables.file
	]
}
else {
	tests = fs.readdirSync(pathToTests).filter(function(filename) {
		return !/-out\.js$/.test(filename) && /.js$/.test(filename) && !/-stderr$/.test(filename);
	});
}

if( commandVariables.filter && typeof commandVariables.filter === "string" ) {
	commandVariables.filter = commandVariables.filter.toLowerCase();
	tests = tests.filter(function(filename) {
		return filename.toLowerCase().indexOf(commandVariables.filter) !== -1;
	})
}

function stringCompare(str1, str2, compareType, removeLines) {
	str1 = (str1 + "")
		.replace(/((\r\n)|\r|\n)/g, "\n")// Windows/Unix, Unicode/ASCII and IDE line break
		.replace(/\t/g, "    ")// IDE settings
		.trim()
	;
	str2 = (str2 + "")
		.replace(/((\r\n)|\r|\n)/g, "\n")// Windows/Unix, Unicode/ASCII and IDE line break
		.replace(/\t/g, "    ")// IDE settings
		.trim()
	;

	let eofKey;

	eofKey = str1.indexOf(EOF_STRING);
	if ( eofKey !== -1 ) {
		str1 = str1.substring(0, eofKey).trim();
	}
	eofKey = str2.indexOf(EOF_STRING);
	if ( eofKey !== -1 ) {
		str2 = str2.substring(0, eofKey).trim();
	}

	// check ansidiff.words first due something wrong with ansidiff.lines method result
	try {
		ansidiff.words(str1, str2, function(obj) {
			if( obj.added || obj.removed ) {
				throw new Error();//diff's exists
			}
		});

		return true;//no diff
	}
	catch(e) {

	}

	const compareFunction = compareType === "lines" ? ansidiff.lines : ansidiff.chars;

	let equal = true
		, result = compareFunction.call(ansidiff, str1, str2, function(obj) {
			if( obj.added || obj.removed ) {
				equal = false;

				/*obj.added && console.log("added", "'" + obj.value + "'")
				obj.removed && console.log("removed", "'" + obj.value + "'")*/

				if(!obj.value.trim())obj.value = "'" + obj.value + "'"
			}
			else if(removeLines) {
				return null;
			}

			return ansidiff.bright(obj);
		})
	;

    return equal === true || result;
}

function colorRed(text) {
	return (
		'\x1b[31m'  // red
		+ text
		+ '\x1b[39m'
	);
}

function colorGreen(text) {
	return (
		'\x1b[32m'  // green
		+ text
		+ '\x1b[39m'
	);
}

function fail(file, type, diff1, diff2) {
	console.log("FAILED test " + file + " TYPE " + type + " (" + colorRed("EXPECTED") + "/" + colorGreen("CURRENT") + ")");
	console.log(diff1, "\n", diff2 || "");
	console.log("\n---------------------------\n");
}

function removeCommentsFromErrorsList(str) {
	return str.replace(/^#[ \t\v\S]+((\n)|(\r\n))/gm, '');
}

function test(file) {
	let result;
	let errors;

	try {
		let fileSource = String(fs.readFileSync(path.join(pathToTests, file)));

		if ( fileSource.contains(SUSPENDED_STRING) ) {
			return;
		}

		result = es6transpiler.run({src: fileSource, polyfillsSeparator: "\/* <[tests es6-transpiler test file EOF ]> *\/"});
		errors = result.errors.join("\n");
	}
	catch(e) {
		result = {
			src: ""
		};

		errors = [e.message || e.name];
	}
	let srcOut = result.src;

	const noSuffix = file.slice(0, -3);

	const expectedStderr = removeCommentsFromErrorsList(slurp(pathToTests + "/" + noSuffix + "-stderr"));
	const expectedStdout = slurp(pathToTests + "/" + noSuffix + "-out.js");

	const compare1 = stringCompare(expectedStderr, errors, "lines");
	const compare2 = stringCompare(expectedStdout, srcOut, "lines", true);

	if (compare1 !== true && compare2 !== true) {
		fail(file, "stdout/stderr", compare1, compare2);
	}
	else {
		if (compare1 !== true) {
			fail(file, "stderr", compare1);
			//console.log(stderr);//, "+|+", stdout, "|error|", error);
		}
		if (compare2 !== true) {
			fail(file, "stdout", compare2);
			//console.log(stdout);//, "+|+", stderr, "|error|", error);
		}
	}
}

//tests = [tests[0], tests[1]];

console.log('test', tests.length, 'files');
tests.forEach(test);
console.log(tests.length, 'all done');
