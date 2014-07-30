#!/bin/sh

./clean.sh

mkdir es5
mkdir es5/lib
mkdir es5/transpiler
mkdir es5/transpiler/core
mkdir es5/polyfills
mkdir es5/jshint_globals

cp es6toes5 es5/

node --harmony build.js

echo ""

./test.sh
