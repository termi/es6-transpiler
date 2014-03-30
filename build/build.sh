#!/bin/sh
echo "beginning es6-transpiler self-build"
rm -rf es5
mkdir es5
mkdir es5/lib
mkdir es5/transpiler

declare -a main=(es6-transpiler.js options.js run-tests.js)
for i in ${main[@]}
do
  echo "building $i"
  node --harmony ../es6toes5 ../$i es5/$i
done

declare -a transpilers=(arrayComprehension.js classes.js core.js destructuring.js forOf.js functions.js letConst.js loopClosures.js objectLiteral.js quasiLiterals.js spread.js optimiser.js unicode.js polyfills.js RegExp.js)
for i in ${transpilers[@]}
do
  echo "building transpiler/$i"
  node --harmony ../es6toes5 ../transpiler/$i es5/transpiler/$i
done

declare -a libs=(error.js scope.js stats.js traverse.js)
for i in ${libs[@]}
do
  echo "building lib/$i"
  node --harmony ../es6toes5 ../lib/$i es5/lib/$i
done

cp es6toes5 es5/

cp ../lib/esprima_harmony.js es5/lib/
cp ../lib/StringAlter-es5.js es5/lib/
cp ../lib/regjsparser.js es5/lib/

cp -r ../jshint_globals es5/

polyfills.sh

cd es5

echo "running tests (in es5 mode i.e. without --harmony)"
/usr/bin/env node run-tests.js --path ../../tests
echo "done self-build. Press Enter"
