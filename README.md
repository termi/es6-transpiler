# es6-transpiler.js
es6 -> es3

Supported:
 * classes
 * destructuring
 * let / const
 * function default
 * arrow functions

Static scope analysis and transpilation of ES6 block scoped `const` and `let`
variables to ES3 based on https://github.com/olov/defs.

## Installation

Not in npm for now!

Use local copy of es6-transpiler.js

	git clone https://github.com/termi/es6-transpiler.git

## Usage

### In console

Run it as `es6toes3 file.js`. The errors (if any) will go to stderr,
the transpiled source to `stdout`, so redirect it like `es6toes3 file.js > output.js`.

### Node.js

require("./es6-transpiler").run(\<Options\>)

```javascript
var es6tr = require("./es6-transpiler");
var result = es6tr.run({filename: "test.js", fullES6: true});
console.log(result.src);//result
```
res object:

    {
        src: string or "" // on success
        errors: array of error messages or [] // on errors
        stats: statistics object
        ast: transformed ast // ast tree from esprima
    }

## Options

Example of `options` object:

    {
        "environments": ["node", "browser"],

        "globals": {
            "my": false,
            "hat": true
        },
        "disallowVars": false,
        "disallowDuplicated": true,
        "disallowUnknownReferences": true,
        "fullES6": false
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

'fullES6' (defaults to `false`) use local copy of esprima harmony branch with es6 features
support

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
