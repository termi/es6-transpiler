"use strict";
/*es6-transpiler let-const:false, has-iterators:false, has-generators: false*/
function test_forOf(someArrayLike) {var $D$2;var $D$3;
	let result = [];
	$D$2 = 0;$D$3 = someArrayLike.length;for( let item ; $D$2 < $D$3; ){item = (someArrayLike[$D$2++]);
		result.push(item);
	};$D$2 = $D$3 = void 0;
	return result;
}
{
	let arr = [1, 2, 3, 4, 5, 6];
	console.log(test_forOf(arr).join("|") === arr.join("|"));
}

function test_ArrayComprehensions(someArrayLike) {
	return (function(){var $D$0;var $D$1;var $result$0 = [], x;$D$0 = 0;$D$1 = someArrayLike.length;for(; $D$0 < $D$1; ){x = (someArrayLike[$D$0++]);{$result$0.push(x)}};;return $result$0})()
}
{
	let arr = [6, 5, 4, 3, 2, 1];
	console.log(test_ArrayComprehensions(arr).join("|") === arr.join("|"));
}

function test_let1() {
	let a = 1, b = 2;

	{/*es6-transpiler let-const:true*/
		var a$0 = 10, b$0 = 20;
		console.log(a$0 === 10, b$0 === 20);
	}

	{
		let a = 100, b = 200;
		console.log(a === 100, b === 200);
	}

	console.log(a === 1, b === 2);
}
test_let1();
/*es6-transpiler rest:false, let-const: true*/
function test_let2() {
	var a = 1, b = 2;

	/*es6-transpiler rest:true*/
	{
		var a$1 = 10, b$1 = 20;
	}

	{/*es6-transpiler rest:false, let-const: false*/
		let a = 100, b = 200;
		{
			let a = 100, b = 200;

			/*es6-transpiler rest:true, let-const: true*/

			{
				var a$2 = 100, b$2 = 200;
			}

			/*es6-transpiler rest:false, let-const: false*/
			{
				let a = 100, b = 200;
			}
		}
		/*es6-transpiler rest:false, let-const: false*/
		{
			let a = 100, b = 200;
		}
		/*es6-transpiler rest:true, let-const: true*/
		{
			var a$3 = 100, b$3 = 200;
		}
	}
	/*es6-transpiler ololo:true*/
	{
		var a$4 = 100, b$4 = 200;
	}
}
test_let2();

function test_let3() {
	var a = 1, b = 2;

	/*es6-transpiler let-const:true*/
	{
		var a$5 = 10, b$5 = 20;
		console.log(a$5 === 10, b$5 === 20);
	}

	{
		var a$6 = 100, b$6 = 200;
		console.log(a$6 === 100, b$6 === 200);
		{/*es6-transpiler let-const:false*/
			let a = 100, b = 200;
			console.log(a === 100, b === 200);
		}
	}

	console.log(a === 1, b === 2);
}
test_let3();