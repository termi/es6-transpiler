function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v==='object'&&typeof v['iterator']==='function')return Array['from'](v);}throw new Error(v+' is not iterable')};{
	var i = 0;
	var a = [];
	var b = [-2, -1, "|"].concat(ITER$0((a.push(i++),a), true), "idx", [i, "-"], ITER$0((a.push(i++),a), true), "idx", [i, "-"], ITER$0((a.push(i++),a)), "idx", [i, "-"])

	console.log( b.join("|") === [-2, -1, "|", 0, "idx", 1, "-", 0, 1, "idx", 2, "-", 0, 1, 2, "idx", 3, "-"].join("|") )
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
