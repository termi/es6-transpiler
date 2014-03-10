# es6-transpiler.js
es6 -> es5

## status

Beta

## Goal

 * different output than [traceur-compiler](https://github.com/google/traceur-compiler):
     1. no runtime library
     1. no try/catch for block binding
     1. no `.bind` using for arrow functions
     1. `.concat` for spread emulation
     1. and others
 * output should support [Closure Compiler](https://code.google.com/p/closure-compiler/)
 * line-to-line input/output mapping

## Supported

 * classes
 * destructuring
 * block binding (let / const)
 * default parameters
 * arrow functions
 * spread (with iterator protocol)
 * for-of (with iterator protocol)
 * array comprehensions (with iterator protocol)
 * string templates
 * object literals
 * unicode code point escapes

Static scope analysis and transpilation of ES6 block scoped `const` and `let` variables to ES3 based on [olov/defs](https://github.com/olov/defs).

## Supported iterator protocol

Important note: This based on the current [FireFox 27 implementation](https://developer.mozilla.org/en-US/Firefox/Releases/27/Site_Compatibility#sect9).
In future it has to be [updated to Symbol.iterator](https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14)

```javascript
var obj = {a: 1, b: 2, c: 3};
obj["@@iterator"] = function() {
	var iterableObject = this;
	var keys = ["a", "b", "c"];

	return {
		next: function() {
			var currentKey = keys.shift();

			return {
				value: currentKey ? iterableObject[currentKey] : void 0
				, done: !currentKey
			}
		}
	}
}
```

## Installation

Install using npm

	npm install es6-transpiler

Or just using [Grunt task](https://github.com/termi/grunt-es6-transpiler) (see below).

## Usage

For the output code works you need an implementation of Object.create in the target browser.
You can get it here: [es5-shim](https://github.com/kriskowal/es5-shim/) or copy and past this code:
```
if(!Object.create)Object.create = function(_prototype) {//[Warning!!!]This is PURE and UNSAFE implementation of Object.create
	var Type = function () {};
	Type.prototype = _prototype;
	var _object = new Type();
	_object.__proto__ = _prototype;

	return _object;
};
```

### Grunt task

[Grunt](http://gruntjs.com/) task can be fount here: https://github.com/termi/grunt-es6-transpiler

Install:
`npm install grunt-es6-transpiler`

Usage:
```javascript
grunt.loadNpmTasks('grunt-es6-transpiler');

grunt.initConfig({
  "es6-transpiler": {
    test: {
        src: 'test.js'
        , dest: 'test.es5.js'
    }
  },
})
```

### Gulp task

[Gulp](http://gulpjs.com/) task can be fount here: https://github.com/sindresorhus/gulp-es6-transpiler

Install:
`npm install --save-dev gulp-es6-transpiler`

Usage:
```javascript
var gulp = require('gulp');
var es6transpiler = require('gulp-es6-transpiler');

gulp.task('default', function () {
    gulp.src('src/app.js')
        .pipe(es6transpiler())
        .pipe(gulp.dest('dist'));
});
```

### In console

Run it as `es6toes5 <input file>`. Or `node --harmony es6toes5 <input file>`. Also you can run a compiled es5 version `node build/es5/es6toes5 <input file>`.
The errors (if any) will go to stderr, the transpiled source to `stdout`, so redirect it like `es6toes5 file.js > output.js`.

### Node.js / Using as a library

require("es6-transpiler").run(\<Options\>)

Options is:

	{
		filename: string // input file
		src: string // input source if not filename
		outputToConsole: boolean // if true -> result would be outputted to console
		outputFilename: string // if specific -> result would be written to file
	}
Other options below in "Options" section.

```javascript
var es6tr = require("./es6-transpiler");
var result = es6tr.run({filename: "test.js"});
console.log(result.src);//result
```
result object is:

    {
        src: string or "" // on success
        errors: array of error messages or [] // on errors
        stats: statistics object
        ast: transformed ast // ast tree from esprima
    }

## Options

Example of `options` object:

    {
    	//described above:
    	//"filename" or "scr": "string"
    	//outputToConsole: false
    	//outputFilename: true

        "environments": ["node", "browser"],

        "globals": {
            "my": false,
            "hat": true
        },
        "disallowVars": false,
        "disallowDuplicated": true,
        "disallowUnknownReferences": true
    }

`globals` lets you list your program's globals, and indicate whether they are
writable (`true`) or read-only (`false`), just like `jshint`.

`environments` lets you import a set of pre-defined globals, here `node` and
`browser`. These default environments are borrowed from `jshint` (see
[jshint_globals/vars.js](https://github.com/olov/defs/blob/master/jshint_globals/vars.js)).

`disallowVars` (defaults to `false`) can be enabled to make
usage of `var` an error.

`disallowDuplicated` (defaults to `true`) errors on duplicated
`var` definitions in the same function scope.

`disallowUnknownReferences` (defaults to `true`) errors on references to
unknown global variables.

## License
`MIT`, see [LICENSE](LICENSE) file.


## Example

See tests


## Compatibility
`es6-transpiler.js` strives to transpile your program as true to the ES6 block scope semantics as
possible, while being as maximally non-intrusive as possible. The only textual
differences you'll find between your original and transpiled program is that the latter
uses `var` and occasional variable renames.


### Loop closures limitation
`es6-transpiler.js` won't transpile a closure-that-captures-a-block-scoped-variable-inside-a-loop, such
as the following example:

```javascript
for (let x = 0; x < 10; x++) {
    let y = x;
    arr.push(function() { return y; });
}
```

With ES6 semantics `y` is bound fresh per loop iteration, so each closure captures a separate
instance of `y`, unlike if `y` would have been a `var`. [Actually, even `x` is bound per
iteration, but v8 (so node) has an
[open bug](https://code.google.com/p/v8/issues/detail?id=2560) for that].

To transpile this example, an IIFE or `try-catch` must be inserted, which isn't maximally
non-intrusive. `es6-transpiler.js` will detect this case and spit out an error instead, like so:

    line 3: can't transform closure. y is defined outside closure, inside loop

You need to manually handle this the way we've always done pre-`ES6`,
for instance like so:

```javascript
for (let x = 0; x < 10; x++) {
    (function(y) {
        arr.push(function() { return y; });
    })(x);
}
```

I'm interested in feedback on this based on real-world usage of `es6-transpiler.js`.


### Referenced (inside closure) before declaration
`es6-transpiler.js` detects the vast majority of cases where a variable is referenced prior to
its declaration. The one case it cannot detect is the following:

```javascript
function printx() { console.log(x); }
printx(); // illegal
let x = 1;
printx(); // legal
```

The first call to `printx` is not legal because `x` hasn't been initialized at that point
of *time*, which is impossible to catch reliably with statical analysis.
`v8 --harmony` will detect and error on this via run-time checking. `es6-transpiler.js` will
happily transpile this example (`let` => `var` and that's it), and the transpiled code
will print `undefined` on the first call to `printx`. This difference should be a very
minor problem in practice.

## TODO
 1. Generators support
 1. Modules support
 1. 'pre-es6-node10', 'pre-es6-chrome20' and 'pre-es6-ff24' output modes
