var x = function(a, b)
    {var c = arguments[2];if(c === void 0)c = 998;return a + b + c}
console.log(x(1, 1) === 1000)

console.log(((function(){return function(a){return a*22.032}})())("321") === "321"*22.032)

var obj = {
    a: 1,
    some: function(){var rest = [].slice.call(arguments, 0);return rest.map(function(a){return a + 2})},
    b: 6
}
console.log((obj.a + obj.some(1, 2, 3, 4).join("") + obj.b) === "123456")

var y = function()
      {var a = arguments[0];if(a === void 0)a = 1;return (a + 1  , a  )}
console.log(y() === 1)
