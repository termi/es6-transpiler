function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v==='object'&&typeof v['iterator']==='function')return Array['from'](v);}throw new Error(v+' is not iterable')};// Important: finalize file. Do not add new tests!!!

{
	var i = 0;
	var a = [];
	var c = ["c"];
	var b = [-2, -1, "|"].concat(ITER$0((a.push(i++),a), true), "idx", [i, "-"], ITER$0((a.push(i++),a), true), "idx", [i, "-"], ITER$0((a.push(i++),a), true), "idx", [i, "-"], ITER$0(c));

	console.log( b.join("|") === [-2, -1, "|", 0, "idx", 1, "-", 0, 1, "idx", 2, "-", 0, 1, 2, "idx", 3, "-", "c"].join("|") )
}

{
	var a$0 = [1, 2, 3];
	var b$0 =
		[0].concat(ITER$0(a$0, true), 4, ITER$0(a$0.reverse()));

	console.log( b$0.join("|") === [0, 1, 2, 3, 4, 3, 2, 1].join("|") )
}


{
	var a$1 = [0, 1].concat([5, 6], 7, [8, 9]);

	console.log( a$1.join("|") === [0, 1, 5, 6, 7, 8, 9].join("|") )
}

function test(a, b, c) {
	console.log(a === 1, b === 2, c.join() === "3")
}
test.apply(null, [1].concat([].concat([2], [[3]])))

{
	var a$2 = [].concat([5, 6], 7);

	var b$1 = (function(a, b, c){return [
		a, b, c
	]}).apply(null, ITER$0(a$2))

	console.log(b$1.join("|") === [5, 6, 7].join("|"))
}

{
	var a$3 = [].concat([9, void 0], [void 0, 6, 5, 4]);

	var b$2 = (function(){var SLICE$0 = Array.prototype.slice;var a = arguments[0];if(a === void 0)a = 9;var b = arguments[1];if(b === void 0)b = 8;var c = arguments[2];if(c === void 0)c = 7;var rest = SLICE$0.call(arguments, 3);return [a, b, c].concat(ITER$0(rest))

}).apply(null, ITER$0(a$3))

	console.log(b$2.join("|") === [9, 8, 7, 6, 5, 4].join("|"))
}
