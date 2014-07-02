// Destructuring: The initializer must be an object.
{
	let {x} = 1;// transpiling-time error
	let a = 1;
	let {y} = a;// runtime error
}

// Esprima#harmony: Error: Line 1: Invalid left-hand side in formals list
function A({b:{a} = {}}){};

// Powerfull array comprehantions
var arr = [1]
var arr1 = [2,3]
var aa = [ for (i of arr) if(i==2) for (i1 of arr1) if(i1==2)i * i];


// Forbidden destructuring
{
      var test51 = [3, 2, 1];
      var [...[...test52]] = [test51.reverse()];
      test51.push(4);
      console.log(test51.join("|") === "1|2|3|4", test52.join("|") === "1|2|3");
}

// ---------------------------------------------------

// Esprima support
let obj = {
	test: (function({a = 1} = {}){
		let d = 123, res;
		{
			let d = 888;
			let {a: h, b} = {a, b: ([c] = [...(([a])=>[a])([a + d]),1,2])}
			res = ([1, 2, ...b, h, d]);
		}
		return res.join("|") + "|" + d
	})()
}

// ---------------------------------------------------

// Array comprehensions
[for (x of ['a', 'b', 'c']) for (y of [1, 2, 3]) for (z of [9, 8, 7]) (x+y+z)];// ->
//function ITER$0(v,f,fn){if(v){var ia=Array.isArray(v);if(ia&&!fn)return f?v.slice():v;if(ia||(typeof v==='object'&&typeof v['iterator']==='function'))return Array['from'](v,fn);}throw new Error(v+' is not iterable')};var x, y, z;
//[].concat.apply([], ITER$0(['a', 'b', 'c'], false, function(x){return [].concat.apply([], ITER$0([1, 2, 3], false, function(y){return ITER$0([9, 8, 7], false, function(z){return (x+y+z)})}))}));


var arr = [1, 2, 3];
var arr2 = [5, 6, 7];

[ for(x of arr) for(y of arr2) if(x % 2) (x * 2 * y) ]

function forOf(result, $a, fun) {
	if(Array.isArray($a))for(var $__i = 0, $__len = $a.length ; $__i < $__len ; $__i++)fun.call(result, $a[$__i]);
	else Array.from($a, fun.bind(result))
	return result;
}

forOf([], arr, function(x){  forOf(this, arr2, function(){ if(x % 2)this.push(x * 2 * y); })   })

// --------------------------------------------------------------------

// Destructuring refactoring
function test1({a}) {
	function test2() {
		console.log(test1.arguments, a)
	}

	test2()
}
test1({a: 1})


function test1(a) {
	var a = a.a;

	console.log(arguments[0], a)
}
test1({a: 1})
