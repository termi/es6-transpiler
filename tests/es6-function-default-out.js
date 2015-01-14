"use strict";

function test1() {var a = arguments[0];if(a === void 0)a = 1;
    console.log(a === 1);
}
test1();

function test2(a) {var b = arguments[1];if(b === void 0)b = 2;
    console.log(a === 1, b === 2);
}
test2(1);

function test3(a) {var b = arguments[1];if(b === void 0)b = 2;var c = arguments[2];if(c === void 0)c = {a: 1};
    console.log(a === 1, b === 9, typeof c === "object" && c.a === 1);
}
test3(1, 9);

function test4(a) {var b = arguments[1];if(b === void 0)b = 2;
    function inner() {var b = arguments[0];if(b === void 0)b = a;var c = arguments[1];if(c === void 0)c = b;
        console.log(b === 1, c === 1);
    }
    inner();
}
test4(1);

function test5() {var ARRAY$0 = Array;var a = arguments[0];if(a === void 0)a = 1;for (var l$0 = arguments.length, rest = ARRAY$0(l$0 > 1 ? l$0 - 1 : 0),  i$0 = 1; i$0 < l$0; i$0++) rest[i$0 - 1] = arguments[i$0];
    console.log(a === 1, rest.join("|") === "");
}
test5();
