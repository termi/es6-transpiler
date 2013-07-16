"use strict";

function test1() {
    var a = arguments[0];if(a === void 0)a = 1;
    console.log(a);
}
test1();

function test2(a) {
    var b = arguments[1];if(b === void 0)b = 2;
    console.log(a, b);
}
test2(1);

function test3(a) {
    var b = arguments[1];if(b === void 0)b = 2;
    var c = arguments[2];if(c === void 0)c = {a: 1};
    console.log(a, b, c);
}
test3(1, 9);

function test4(a) {
    var b = arguments[1];if(b === void 0)b = 2;
    function inner() {
        var b = arguments[0];if(b === void 0)b = a;
        var c = arguments[1];if(c === void 0)c = b;
        console.log(b, c);
    }
    inner();
}
test4(1);

function test5() {
    var a = arguments[0];if(a === void 0)a = 1;
    var rest = [].slice.call(arguments, 1);
    console.log(a, rest.join("|"));
}
test5();