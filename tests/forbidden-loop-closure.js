"use strict";
var arr = [];

// fresh x per iteration so can't be transformed
// note v8 bug https://code.google.com/p/v8/issues/detail?id=2560
// also see other/v8-bug.js
for (let x = 0; x < 10; x++) {
    arr.push(function() { return x; });
}

// fresh y per iteration so can't be transformed
for (var x = 0; x < 10; x++) {
    let y = x;
    arr.push(function() { return y; });
}

// fresh x per iteration so can't be transformed
for (let x in [0,1,2]) {
    arr.push(function() { return x; });
}

arr.forEach(function(f) {
    console.log(f());
});
