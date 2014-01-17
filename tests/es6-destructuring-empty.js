
function test1({} = {}, a = 1) {
	return a;
}
console.log(test1() === 1);

function test2([] = []) {
	return 2;
}
console.log(test2() === 2);

var [] = [1];
var {} = {}, b = 2 ;
let a, c = ({a} = {a: 3}).a;
console.log(b === 2, a === c, a === 3);

function test3({}) {
	var a;
	return ({a} = {a: 3}), a;
}
console.log(test3() === 3);

function test4([]) {
	var a, b = ({a} = {a: 4}).a;
	return b;
}
console.log(test4() === 4);

function test5(){var a,b = ({a}={a:5});function test6(){var a,b = ({a}={a:6});return b.a}return b.a+test6()}
console.log(test5() === 11);

function empty() {

}
