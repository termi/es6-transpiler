var $TS$0 = Object.freeze(Object.defineProperties(["\n<", ">\t - \n<", ">\t"], {"raw": {"value": Object.freeze(["\\n<", ">\\t - \\n<", ">\\t"])}}));var $TS$2 = ["<table>", "</table>"];$TS$2 = Object.freeze(Object.defineProperties($TS$2, {"raw": {"value": $TS$2}}));var $TS$3 = ["<tr>", "</tr>"];$TS$3 = Object.freeze(Object.defineProperties($TS$3, {"raw": {"value": $TS$3}}));var $TS$4 = ["<td>", "</td>"];$TS$4 = Object.freeze(Object.defineProperties($TS$4, {"raw": {"value": $TS$4}}));var assert = function(a, m){ if(!a)throw new Error(m||"") }

var filter = void 0;
function test(quasis){var SLICE$0 = Array.prototype.slice;var expressionValues = SLICE$0.call(arguments, 1);
    var raw = quasis.raw;

    assert(quasis.length);
    assert(raw.length);
    assert(quasis.length === raw.length);
    assert(expressionValues.length);

    if(quasis.length === 0)return '';

    expressionValues = expressionValues.map( filter || (function(x)  {return (("(" + x) + ")")}) )

    var s = '', i = 0, len = raw.length;
    while (true) {
        s += raw[i];
        if (i + 1 === len) {
            return s;
        }
        s += expressionValues[i++];
    }
}

var name = ("name");

{// simple
    var a = test($TS$0, 40 + 2, name);
    console.log(a === '\\n<(42)>\\t - \\n<(name)>\\t');

    var b = (("\n" + (40 + 2)) + ("\t - \n<" + name) + ">\t");
    console.log(b === '\n42\t - \n<name>\t');

//      let c = String.raw`\n<${ 40 + 2 }>\t - \n<${ name }>\t`;
//      console.log(c === '\\n<42>\\t - \\n<name>\\t' )

    (function() {var $TS$1 = Object.freeze(Object.defineProperties(["\n<{", "}>\t - \n<{", "}>\t"], {"raw": {"value": Object.freeze(["\\n<{", "}>\\t - \\n<{", "}>\\t"])}}));
        var a1 = test($TS$0, 1, 2);
        console.log(a1 === '\\n<(1)>\\t - \\n<(2)>\\t');

        var a2 = test($TS$1, 3, 4);
        console.log(a2 === '\\n<{(3)}>\\t - \\n<{(4)}>\\t');
    })();
}

{// nested

    filter = function safehtml(val) {
        if( Array.isArray(val) )return val.join("");
        return ("" + val).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;')
    };

    var rows = [['Unicorns', 'Sunbeams', 'Puppies'], ['<3', '<3', '<3']];
    var html = test($TS$2, rows.map(function(row) {
            return test($TS$3, row.map(function(cell)
                    {return test($TS$4, cell)}
                ))
        }));
    console.log(html === '<table><tr><td>Unicorns</td><td>Sunbeams</td><td>Puppies</td></tr><tr><td>&lt;3</td><td>&lt;3</td><td>&lt;3</td></tr></table>')
}
