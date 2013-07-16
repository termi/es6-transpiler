"use strict";

function test1(a = 1) {
    console.log(a);
}
test1();

function test2(a, b = 2) {
    console.log(a, b);
}
test2(1);

function test3(a, b = 2, c = {a: 1}) {
    console.log(a, b, c);
}
test3(1, 9);

function test4(a, b = 2) {
    function inner(b = a, c = b) {
        console.log(b, c);
    }
    inner();
}
test4(1);

function test5(a = 1, ...rest) {
    console.log(a, rest.join("|"));
}
test5();
