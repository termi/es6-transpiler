var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};var class1 = (function(){"use strict";function class1(msg){this.property1 = msg;}DP$0(class1, "prototype", {"configurable": false, "enumerable": false, "writable": false});;class1.sayStatic = function() { return "[static:class1]" };class1.prototype.say = function() { return "class1:" + this.property1 };return class1;})();

var super$0;

var class2 = (function(super$1){"use strict";MIXIN$0(class2, super$1);class2.sayStatic = function(){ return super$1.sayStatic() + "[static:class2]" };function class2(message) {var message = message.message;super$0="test_super";super$1.call(this, message);this.property2 = message;}class2.prototype = Object.create(super$1.prototype, {"constructor": {"value": class2, "configurable": true, "writable": true} });DP$0(class2, "prototype", {"configurable": false, "enumerable": false, "writable": false});;class2.prototype.say = function() {var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol.iterator||'@@iterator';function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){i=f.call(v);r=[];}else if((v+'')==='[object Generator]'){i=v;r=[];};if(r) {while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};var a = arguments[0];if(a === void 0)a = [1];var b = arguments[1];if(b === void 0)b = [2];var arr = arguments[2];if(arr === void 0)arr = [ ].concat(ITER$0(a), ITER$0(b));return super$1.prototype.say.call(this) + "|arr:" + arr.join();};return class2;})(class1);

var class3 = (function(super$1){"use strict";function class3() {super$1.apply(this, arguments)}MIXIN$0(class3, super$1);class3.prototype = Object.create(super$1.prototype, {"constructor": {"value": class3, "configurable": true, "writable": true} });DP$0(class3, "prototype", {"configurable": false, "enumerable": false, "writable": false});
	class3.prototype.say = function(){return "class3"}
;return class3;})(class1);


//console.log(class2.A === 123);
console.log((new class2({message: "test"})).say() === "class1:test|arr:1,2")
console.log((new class3()).say() === "class3")
console.log(super$0 === "test_super")
