var $D$2;
function test1() {var $D$0;$D$0;var a = arguments[1];if(a === void 0)a = 1;
    return a;
}
console.log(test1() === 1);

function test2() {var $D$1;$D$1;
    return 2;
}
console.log(test2() === 2);

var $D$2;
var $D$2, b = 2 ;
var a, c = (a = ($D$2 = {a: 3}).a, $D$2).a;
console.log(b === 2, a === c, a === 3);

function test3() {var $D$3;
    var a;
    return (a = ($D$3 = {a: 3}).a, $D$3), a;
}
console.log(test3() === 3);

function test4() {var $D$4;
    var a, b = (a = ($D$4 = {a: 4}).a, $D$4).a;$D$4 = void 0;;
    return b;
}
console.log(test4() === 4);

function test5(){var $D$5;var a,b = (a = ($D$5 = {a:5}).a, $D$5);$D$5 = void 0;;function test6(){var $D$6;var a,b = (a = ($D$6 = {a:6}).a, $D$6);$D$6 = void 0;;return b.a}return b.a+test6()}
console.log(test5() === 11);

function empty() {

};$D$2 = void 0;
