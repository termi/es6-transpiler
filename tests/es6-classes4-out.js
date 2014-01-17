var class1 = (function(){function class1(opts){this.class1=1;this.op1=opts.op1};return class1;})();
var class2 = (function(super$0){var ASSIGN$0 = Object['assign']||function(t,s){for(var p in s){if(s.hasOwnProperty(p)){t[p]=s[p];}}return t};function class2() {super$0.apply(this, arguments)}ASSIGN$0(class2, super$0);class2.prototype = Object.create(super$0.prototype, {"constructor": {"value": class2, "configurable": true, "writable": true, "enumerable": false} });class2.prototype.say = function(){return "class2"};return class2;})(class1);

var a = new class2({op1: 99});

console.log(a.class1 === 1, a.op1 === 99, a.say() === "class2");
