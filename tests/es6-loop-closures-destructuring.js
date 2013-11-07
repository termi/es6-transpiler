// for-of / destructuring / loop closure / arrow function
var e=[];
for( let {a, b} of [{a: 1, b: 2}, {a: 11, b: 22}, {a: 111, b: 222}] ) {
	e.push( () => a + b )
}

console.log(e.map( function(x) {return x()} ).join("|") === "3|33|333")

// destructuring / loop closure
{
	e = [];
	let a = 3;
	while( a-- > 0 ) {
		let {a, b} = {a: a, b: a * 100}
		e.push( function() {return a + b} )
	}
}
