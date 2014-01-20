var SLICE$0 = Array.prototype.slice;var obj = {
    arrowTest: function(a, b, c)  {var rest = SLICE$0.call(arguments, 3);
        return (a + "" + b + "" + c + rest.join(""))
    }
};

console.log( obj.arrowTest(1, 2, 3, 4, 5, 6, 7) === "1234567" )

function test() {
    function test4(ssssss) {var fffffffff = arguments[1];if(fffffffff === void 0)fffffffff = [];var ooooooo = arguments[2];if(ooooooo === void 0)ooooooo = [];
        return ssssss + fffffffff + ooooooo;
    }
    {var test;}

    var test$0;
    for (var i ; test$0 = false ; ) {
        var test$1 = (this.testtesttest((test$1||{}).a, (test$1||{}).b)).test;
    }

    var obj = (function() { return {
        arrowTest: function()  {var rest = SLICE$0.call(arguments, 0);
            return rest.join("")
        }
    } })();


    return test4(1) + test$0 + obj.arrowTest(1);
}
console.log(test() === "1false1");
