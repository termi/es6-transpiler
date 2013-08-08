var $D$1;var $D$0;var test1, test2;

{
	var a = 1, b = 2, c = 3;

	var obj = {
		test2: ( a = ($D$0 = {a: a, b: b, c: c}).a, b = $D$0.b, c = $D$0.c, $D$0 ).a
		, test1: b
		, test3: c
	}

	test1 = function() {
		console.log(this.test2 === 1, this.test1 === 2, this.test3 === 3, a === 1, b === 2, c === 3)
	}.bind(obj);
}

{
	var a$0 = void 0, b$0 = void 0, c$0 = void 0

	var obj$0 = {
		test2: ( a$0 = (($D$1 = ($D$0 = {a: a$0, b: b$0, c: c$0}).a) === void 0 ? 9 : $D$1), b$0 = (($D$1 = $D$0.b) === void 0 ? 8 : $D$1), c$0 = (($D$1 = $D$0.c) === void 0 ? 7 : $D$1), $D$0 ).a
		, test1: b$0
		, test3: c$0
	}
	test2 = function() {
		console.log(this.test2 === void 0, this.test1 === 8, this.test3 === 7, a$0 === 9, b$0 === 8, c$0 === 7)
	}.bind(obj$0);
}

test1();
test2();

(function() {var $D$5;var $D$4;var $D$3;var $D$2;
	var a = ($D$2 = {c: {test: 22}}).a, b = $D$2.b, test = (($D$3 = ($D$2.c).test) === void 0 ? 12 : $D$3), c;
	console.log(a === void 0, b === void 0, c === void 0, test === 22);

	var obj = {};
	obj.test = (b = ($D$2 = {test: {test:b, a: [1, 2, [99], 4]}, b: test}).b, test = ($D$3 = $D$2.test).test, a = ($D$4 = $D$3.a)[2][0], c = (($D$5 = $D$4[4]) === void 0 ? 5 : $D$5), $D$2, test);

	console.log(a === 99, test === void 0, b === 22);
})()
