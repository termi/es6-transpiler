"use strict";

const fs = require("fs");
const fmt = require("simple-fmt");
const path = require("path");
const exec = require("child_process").exec;
const ansidiff = require("ansidiff");
const defsMain = require("./main");

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

const pathToTests = (fs.existsSync("tests") ? "tests" : "../../tests");

var tests;
if( commandVariables.file && typeof commandVariables.file === "string" ) {
	tests = [
		commandVariables.file
	]
}
else {
	tests = fs.readdirSync("tests").filter(function(filename) {
		return !/-out\.js$/.test(filename) && !/-stderr$/.test(filename);
	});
}

if( commandVariables.filter && typeof commandVariables.filter === "string" ) {
	commandVariables.filter = commandVariables.filter.toLowerCase();
	tests = tests.filter(function(filename) {
		return filename.toLowerCase().indexOf(commandVariables.filter) !== -1;
	})
}

function stringCompare(str1, str2, compareType, removeLines) {
	str1 = str1
		.replace(/((\r\n)|\r|\n)/g, "\n")// Windows/Unix, Unicode/ASCII and IDE line break
		.replace(/\t/g, "    ")// IDE settings
		.trim()
	;
	str2 = str2
		.replace(/((\r\n)|\r|\n)/g, "\n")// Windows/Unix, Unicode/ASCII and IDE line break
		.replace(/\t/g, "    ")// IDE settings
		.trim()
	;

	const compareFunction = compareType === "lines" ? ansidiff.lines : ansidiff.chars;

	var equal = true
		, lastDiffIndex = null
		, result = compareFunction.call(ansidiff, str1, str2, function(obj, i, array) {
			if( obj.added || obj.removed ) {
				lastDiffIndex = i;
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

function test(file) {
	let result = defsMain.run({filename: path.join(pathToTests, file), fullES6: true});
	let errors = result.errors.join("\n");
	let srcOut = result.src;

	const noSuffix = file.slice(0, -3);

	const expectedStderr = slurp(fmt("{0}/{1}-stderr", pathToTests, noSuffix));
	const expectedStdout = slurp(fmt("{0}/{1}-out.js", pathToTests, noSuffix));

	const compare1 = stringCompare(expectedStderr, errors, "lines");
	const compare2 = stringCompare(expectedStdout, srcOut, "lines", true);

	if (compare1 !== true && compare2 !== true) {
		fail("stdout/stderr", compare1, compare2);
	}
	else {
		if (compare1 !== true) {
			fail("stderr", compare1);
			//console.log(stderr);//, "+|+", stdout, "|error|", error);
		}
		if (compare2 !== true) {
			fail("stdout", compare2);
			//console.log(stdout);//, "+|+", stderr, "|error|", error);
		}
	}

	function fail(type, diff1, diff2) {
		console.log(fmt("FAILED test {0} TYPE {1}", file, type));
		console.log(diff1, "\n", diff2 || "");
		console.log("\n---------------------------\n");
	}
}

//tests = [tests[0], tests[1]];

tests.forEach(test);
