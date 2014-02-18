function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof v['@@iterator']==='function'){i=v['@@iterator'](),r=[];while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};var a = "a", b = "b", a$1, b$1;

{
    var a$0 = 1, b$0 = 2;
    console.log((("" + (a$0 + 1)) + ("|" + b$0) + "") === "2|2")
}

{
    var a$2 = "3a", b$2 = 4;
    console.log(
        (("\"" + (a$2.toUpperCase())) + ("\"\
\n   " + (b$2 + "\\n")) + "") === "\"3A\"\n   4\\n")
}

{// compound with spread inside
    var a$3 = "a", b$3 = "b";
    function test() {var SLICE$0 = Array.prototype.slice;var rest = SLICE$0.call(arguments, 0);
        return rest.join("\n");
    }
    var string = (("a = " + a$3) + (" | bb = " + (b$3 + b$3)) + (" | function call = " + (test.apply(null, ITER$0([a$3, b$3, "c"].concat(["d"]))))) + "");
    console.log(string === "a = a | bb = bb | function call = a\nb\nc\nd");
}

{// compound with object literals inside
    var a$4 = "a", b$4 = "b";
    var string$0 = (("{a, b} = " + (JSON.stringify({a: a$4, b: b$4}))) + (" | {A: a, B: b} = " + (JSON.stringify({A: a$4, B: b$4}))) + (" | {a, b, method}.method() = " + ({a: a$4, b: b$4, method: function(){ return "c" }}.method())) + "");
    console.log(string$0 === '{a, b} = {"a":"a","b":"b"} | {A: a, B: b} = {"A":"a","B":"b"} | {a, b, method}.method() = c');
}

{// special symbols
    var n = ("\n"), t = ("\t"), r = ("\r"), q1 = ("\""), q2 = ("'"), q1q1 = ("\"\""), q2q2 = ("''"), q1_q1q1 = ("\"\"\""), q2_q2q2 = ("'\''");
    var string$1 = (("" + n) + ("|" + t) + ("|" + r) + ("|" + q1) + ("|" + q2) + ("|" + q1q1) + ("|" + q2q2) + ("|" + q1_q1q1) + ("|" + q2_q2q2) + "");
    console.log(string$1 === "\n|\t|\r|\"|'|\"\"|''|\"\"\"|'''");
}

{// just toString
    var obj = {toString: function(){ return [3, 2, 1].join("") }};
    console.log( ("" + obj).split("").join("") === "321" )
}
