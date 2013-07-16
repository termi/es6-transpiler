/**
 * test function 1
 * @param a
 * @param b
 * @param c
 */
function /*comment 1*/  test1 /*comment2*/  (/** @type {number} */a = 1, /** @type {number} */b = 2,/** @type {object} */ c = {}) { //some comment
	"use strict";

	console.log(a, b, c);
}


function test2 ( a = /*default value*/1, b = 2 ) {  void function(a = 1, b = 2) { console.log(a, b) } ( a , b )  }

function test3 ( // function lvl comment
// function declaration comment
	a = 123 // some param comment
	,/* some param comment */ b = 234
	, c/*  // some param comment */= 345
/* some param comment*/,/*some param comment*/d/*some param comment*/=/*some param comment*/456
)// function declaration comment
{// function body comment
	"use strict";

	console.log(a, b, c, d);
}// outer comment
