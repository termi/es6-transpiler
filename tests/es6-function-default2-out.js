/**
 * test function 1
 * @param a
 * @param b
 * @param c
 */
function /*comment 1*/  test1 /*comment2*/  (/** @type {number} */) { //some comment
    var a = arguments[0];if(a === void 0)a = 1; //some comment
    var b = arguments[1];if(b === void 0)b = 2; //some comment
    var c = arguments[2];if(c === void 0)c = {}; //some comment
    "use strict";

    console.log(a, b, c);
}


function test2 (  ) {  var a = arguments[0];if(a === void 0)a = 1;  var b = arguments[1];if(b === void 0)b = 2;  void function() { var a = arguments[0];if(a === void 0)a = 1; var b = arguments[1];if(b === void 0)b = 2; console.log(a, b) } ( a , b )  }

function test3 ( // function lvl comment
// function declaration comment

)// function declaration comment
{// function body comment
    var a = arguments[0];if(a === void 0)a = 123;// function body comment
    var b = arguments[1];if(b === void 0)b = 234;// function body comment
    var c = arguments[2];if(c === void 0)c = 345;// function body comment
    var d = arguments[3];if(d === void 0)d = 456;// function body comment
    "use strict";

    console.log(a, b, c, d);
}// outer comment
