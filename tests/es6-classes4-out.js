var DP$0 = Object.defineProperty;var class1 = (function(){"use strict";function class1(opts){this.class1=1;this.op1=opts.op1}DP$0(class1, "prototype", {"configurable": false, "enumerable": false, "writable": false});;return class1;})();
var class2 = (function(super$0){var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};"use strict";function class2() {super$0.apply(this, arguments)}MIXIN$0(class2, super$0);class2.prototype = Object.create(super$0.prototype, {"constructor": {"value": class2, "configurable": true, "writable": true} });DP$0(class2, "prototype", {"configurable": false, "enumerable": false, "writable": false});class2.prototype.say = function(){return "class2"};return class2;})(class1);

var a = new class2({op1: 99});

console.log(a.class1 === 1, a.op1 === 99, a.say() === "class2");
