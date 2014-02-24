var SLICE$0 = Array.prototype.slice;function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof v['@@iterator']==='function'){i=v['@@iterator'](),r=[];while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};var $D$0;function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v==='object'&&typeof v['@@iterator']==='function')return v['@@iterator']();}throw new Error(v+' is not iterable')};
var arr = [1, 2, 3, 4, 5, 6], obj = { arr: arr, method: function(){ return ("value") } };

{// array comprehentions
    var str = ("" + ((function(){var $D$1;var $D$2;var $D$3;var $result$0 = [], i;$D$1 = GET_ITER$0(arr);$D$2 = $D$1 === 0;$D$3 = ($D$2 ? arr.length : void 0);for(; $D$2 ? ($D$1 < $D$3) : !($D$3 = $D$1["next"]())["done"]; ){i = ($D$2 ? arr[$D$1++] : $D$3["value"]);{$result$0.push(i + 1)}};;return $result$0})().join(("|"))));
	console.log(str === [2, 3, 4, 5, 6, 7].join("|"));
	
	{
        var str$0 = (("<<{" + ((function(){var $D$4;var $D$5;var $D$6;var $result$1 = [], i;$D$4 = GET_ITER$0(arr);$D$5 = $D$4 === 0;$D$6 = ($D$5 ? arr.length : void 0);for(; $D$5 ? ($D$4 < $D$6) : !($D$6 = $D$4["next"]())["done"]; ){i = ($D$5 ? arr[$D$4++] : $D$6["value"]);{$result$1.push(i + 1)}};;return $result$1})().join(("|")))) + "}>>");
        console.log(str$0 === "<<{" + [2, 3, 4, 5, 6, 7].join("|") + "}>>");
	}
}

{// compound with spread inside
    var a = "a", b = "b";
    function test() {var rest = SLICE$0.call(arguments, 0);
        return rest.join("\n");
    }
    var string = (("a = " + a) + (" | bb = " + (b + b)) + (" | function call = " + (test.apply(null, ITER$0([a, b, "c"].concat(["d"]))))) + "");
    console.log(string === "a = a | bb = bb | function call = a\nb\nc\nd");
}

{// compound with object literals inside
    var a$0 = "a", b$0 = "b";
    var string$0 = (("{a, b} = " + (JSON.stringify({a: a$0, b: b$0}))) + (" | {A: a, B: b} = " + (JSON.stringify({A: a$0, B: b$0}))) + (" | {a, b, method}.method() = " + ({a: a$0, b: b$0, method: function(){ return "c" }}.method())) + "");
    console.log(string$0 === '{a, b} = {"a":"a","b":"b"} | {A: a, B: b} = {"A":"a","B":"b"} | {a, b, method}.method() = c');
}

{// array destructuring assignment
    var a$1 = 1, b$1 = 9;
    var str$1 = ("" + (a$1 = ($D$0 = [b$1, a$1])[0], b$1 = $D$0[1], $D$0));
    console.log(str$1 === [a$1, b$1] + "", a$1 === 9, b$1 === 1);
}

{// array destructuring assignment
    var a$2 = 1, b$2 = 9;
    var str$2 = (("<<{" + (a$2 = ($D$0 = [b$2, a$2])[0], b$2 = $D$0[1], $D$0)) + "}>>");
    console.log(str$2 === "<<{" + [a$2, b$2] + "}>>", a$2 === 9, b$2 === 1);
}

{// array destructuring assignment
    var a$3 = 1, b$3 = [9];
    var str$3 = (("<<{" + (a$3 = ($D$0 = [b$3, a$3])[0][0], b$3 = $D$0[1], $D$0)) + "}>>");
    console.log(str$3 === "<<{" + [a$3, b$3] + "}>>", a$3 === 9, b$3 === 1);
}

{// array destructuring rest
    var str$4 = ("" + ([].concat(ITER$0(arr))));
    console.log(str$4 === "" + arr);
}

{// object destructuring & shorthand
    var a$4 = 1, b$4 = 9, c = 5;
    var obj$0;
        var str$5 = ("" + (obj$0 = b$4 = ($D$0 = {a: a$4, b: b$4, c: c, toString: function(){ return (("" + (this.a)) + ("|" + (this.b)) + ("|" + (this.c)) + "") }}).a, a$4 = $D$0.b, c = $D$0.c, $D$0));
    console.log(str$5 === obj$0.a + "|" + obj$0.b + "|" + obj$0.c, a$4 === 9, b$4 === 1, c === 5);
;$D$0 = void 0}

{// function inside
    {// just call
        var str$6 = ("" + ((function(){ return arr.join(("1")) })()));
        console.log(str$6 === arr.join(("1")));
    }

    {// rest & spread
        var str$7 = ("" + (((function(){var rest = SLICE$0.call(arguments, 0); return rest.join(("2")) })).apply(null, ITER$0(arr))));
        console.log(str$7 === arr.join(("2")));
    }
}
