"use strict";

function test11()11
console.log(test11() === 11)

function test12()
	12
console.log(test12() === 12)

function test13()(13)
console.log(test13() === 13)

function test14()(
	14
)
console.log(test14() === 14)

function test21()(1, "2")
console.log(test21() === "2")

function test22()
	(1, "2")
console.log(test22() === "2")

function test31({a}, ...rest)([a, rest[0]])
console.log(test31({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

function test32({a}, ...rest)
	([a, rest[0]])
console.log(test32({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

function test33({a}, ...rest)(//some comments
	[a, rest[0]]
)
console.log(test33({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))

function test34({a}, ...rest)[
	a, rest[0]
]
console.log(test34({a: 1}, 2, 3, 4).join("|") === [1, 2].join("|"))
