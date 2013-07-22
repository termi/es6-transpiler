var x = (a, b, c = 998) =>
	a + b + c
console.log(x(1, 1) === 1000)

console.log(((function(){return (a)=>a*22.032})())("321") === "321"*22.032)

var obj = {
	a: 1,
	some: (...rest)=>rest.map((a)=>a + 2),
	b: 6
}
console.log((obj.a + obj.some(1, 2, 3, 4).join("") + obj.b) === "123456")

var y = (a = 1) =>
	(  a + 1  , a  )
console.log(y() === 1)
