function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v==='object'&&typeof v['iterator']==='function')return v['iterator']();}throw new Error(v+' is not iterable')};var $D$0;var $D$1;var $D$2;var $D$3;var e;
var a = 1, b = 2, c = 3;

{// for-of / destructuring / loop closure / arrow function
    e = [];
    var a$0, b$0;$D$3 = ([{a: 1, b: 2}, {a: 11, b: 22}, {a: 111, b: 222}]);$D$0 = GET_ITER$0($D$3);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? $D$3.length : void 0);for(  ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){;a$0 = (b$0 = ($D$1 ? $D$3[$D$0++] : $D$2["value"])).a, b$0 = b$0.b;(function(a, b){
        e.push( function()  {return a + b} )
    }).call(this, a$0, b$0);};$D$0 = $D$1 = $D$2 = $D$3 = void 0;

    console.log(e.map( function(x) {return x()} ).join("|") === "3|33|333")
}

{// for-of / destructuring / loop closure / arrow function #2
    e = [];
    var firstChild;$D$3 = ([
             { childrens: [ 1         , 2] }
           , { childrens: [ 2         , 3] }
           , { childrens: [ 3         , 4] }
    ]);$D$0 = GET_ITER$0($D$3);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? $D$3.length : void 0);for(  ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){;firstChild = ($D$1 ? $D$3[$D$0++] : $D$2["value"]).childrens[0];(function(firstChild){
        e.push( function()  {return firstChild} )
    }).call(this, firstChild);};$D$0 = $D$1 = $D$2 = $D$3 = void 0;

    console.log(e.map( function(x) {return x()} ).join("|") === "1|2|3")
}

{// destructuring inside loop closure
    e = [];
    var a$1 = 3, c$0;
    while( (c$0 = a$1--) > 0 ) {(function(){
        var a = (b = {a: c$0, b: c$0 * 100}).a, b = b.b
        e.push( function() {return a + b} )
    }).call(this);}
    console.log(e.map( function(x) {return x()} ).join("|") === "303|202|101")
}
