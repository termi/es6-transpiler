{
	let get_args = function() { return [1, 2 ,3]; };
	
	var [a, b, c] = Array(...get_args());
	console.log(a === 1, b === 2, c === 3);
}